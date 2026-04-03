/**
 * GPU-accelerated Gaussian blur using raw WebGL.
 *
 * Uses iterative two-pass (H+V) blur rounds. For large radii, multiple
 * iterations at a capped per-pass radius are used — this produces smooth
 * results because stacking Gaussians is equivalent to a single larger
 * Gaussian (variances add).
 */

const VERT = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

// 9-tap Gaussian with properly normalized weights (sum = 1.0)
const FRAG = `
precision highp float;
uniform sampler2D u_texture;
uniform vec2 u_direction;
uniform float u_radius;
varying vec2 v_uv;

void main() {
  vec4 sum = vec4(0.0);

  // Precomputed 9-tap Gaussian weights (sigma ≈ radius/3)
  // These are normalized so center + 2*sum(sides) = 1.0
  float w0 = 0.2270270270;
  float w1 = 0.1945945946;
  float w2 = 0.1216216216;
  float w3 = 0.0540540541;
  float w4 = 0.0162162162;

  sum += texture2D(u_texture, v_uv) * w0;

  vec2 step1 = u_direction * u_radius * 0.25;
  vec2 step2 = u_direction * u_radius * 0.50;
  vec2 step3 = u_direction * u_radius * 0.75;
  vec2 step4 = u_direction * u_radius * 1.00;

  sum += texture2D(u_texture, v_uv + step1) * w1;
  sum += texture2D(u_texture, v_uv - step1) * w1;
  sum += texture2D(u_texture, v_uv + step2) * w2;
  sum += texture2D(u_texture, v_uv - step2) * w2;
  sum += texture2D(u_texture, v_uv + step3) * w3;
  sum += texture2D(u_texture, v_uv - step3) * w3;
  sum += texture2D(u_texture, v_uv + step4) * w4;
  sum += texture2D(u_texture, v_uv - step4) * w4;

  gl_FragColor = sum;
}`;

// ── Cached WebGL state ──────────────────────────────────────────────
let glCanvas: HTMLCanvasElement | null = null;
let gl: WebGLRenderingContext | null = null;
let program: WebGLProgram | null = null;
let posBuf: WebGLBuffer | null = null;
let fbTex1: WebGLTexture | null = null;
let fbTex2: WebGLTexture | null = null;
let fb1: WebGLFramebuffer | null = null;
let fb2: WebGLFramebuffer | null = null;
let lastW = 0;
let lastH = 0;

let uTexture: WebGLUniformLocation | null = null;
let uDirection: WebGLUniformLocation | null = null;
let uRadius: WebGLUniformLocation | null = null;

function compileShader(
  ctx: WebGLRenderingContext,
  type: number,
  src: string,
): WebGLShader {
  const s = ctx.createShader(type)!;
  ctx.shaderSource(s, src);
  ctx.compileShader(s);
  return s;
}

function initGL() {
  if (gl) return;
  glCanvas = document.createElement("canvas");
  gl = glCanvas.getContext("webgl", {
    premultipliedAlpha: false,
    preserveDrawingBuffer: true,
  })!;
  if (!gl) throw new Error("WebGL not supported");

  const vs = compileShader(gl, gl.VERTEX_SHADER, VERT);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
  program = gl.createProgram()!;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.useProgram(program);

  posBuf = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW,
  );
  const aPos = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  uTexture = gl.getUniformLocation(program, "u_texture");
  uDirection = gl.getUniformLocation(program, "u_direction");
  uRadius = gl.getUniformLocation(program, "u_radius");
}

function ensureSize(w: number, h: number) {
  if (!gl || !glCanvas) return;
  if (w === lastW && h === lastH) return;
  lastW = w;
  lastH = h;
  glCanvas.width = w;
  glCanvas.height = h;
  gl.viewport(0, 0, w, h);

  const createFBTex = () => {
    const tex = gl!.createTexture()!;
    gl!.bindTexture(gl!.TEXTURE_2D, tex);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
    gl!.texImage2D(
      gl!.TEXTURE_2D, 0, gl!.RGBA, w, h, 0, gl!.RGBA, gl!.UNSIGNED_BYTE, null,
    );
    return tex;
  };

  if (fbTex1) gl.deleteTexture(fbTex1);
  if (fbTex2) gl.deleteTexture(fbTex2);
  if (fb1) gl.deleteFramebuffer(fb1);
  if (fb2) gl.deleteFramebuffer(fb2);

  fbTex1 = createFBTex();
  fb1 = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb1);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fbTex1, 0);

  fbTex2 = createFBTex();
  fb2 = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb2);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fbTex2, 0);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

/**
 * Apply a Gaussian blur to a canvas and return the blurred result.
 *
 * For large radii, multiple H+V iterations are used (stacking Gaussians).
 * Each iteration uses a per-pass radius capped at 10px for smooth results.
 * Stacking N passes of radius r gives effective radius ≈ r√N.
 */
export function blurCanvas(
  source: HTMLCanvasElement,
  radius: number,
): HTMLCanvasElement {
  initGL();
  if (!gl || !glCanvas || !program) return source;

  const w = source.width;
  const h = source.height;
  ensureSize(w, h);

  // Determine iterations: cap per-pass radius at 10px for quality
  const MAX_PER_PASS = 10;
  // Effective radius = perPass * sqrt(iterations), so iterations = (radius/perPass)²
  const iterations = Math.max(1, Math.ceil((radius / MAX_PER_PASS) * (radius / MAX_PER_PASS)));
  // Per-pass radius to achieve target: radius / sqrt(iterations)
  const perPass = radius / Math.sqrt(iterations);

  // Upload source as texture
  const srcTex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, srcTex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);

  gl.useProgram(program);
  gl.uniform1i(uTexture, 0);

  // Ping-pong between fb1/fbTex1 and fb2/fbTex2
  // First pass reads from srcTex, subsequent passes read from previous output
  let readTex = srcTex;

  for (let i = 0; i < iterations; i++) {
    const r = perPass / Math.max(w, h); // normalize to texel units
    gl.uniform1f(uRadius, perPass);

    // Horizontal pass → fb1
    gl.bindTexture(gl.TEXTURE_2D, readTex);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb1);
    gl.viewport(0, 0, w, h);
    gl.uniform2f(uDirection, 1.0 / w, 0.0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // Vertical pass → fb2 (or screen on last iteration)
    gl.bindTexture(gl.TEXTURE_2D, fbTex1);
    if (i === iterations - 1) {
      // Last iteration: render to screen
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    } else {
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb2);
    }
    gl.viewport(0, 0, w, h);
    gl.uniform2f(uDirection, 0.0, 1.0 / h);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // Next iteration reads from fb2's texture
    readTex = fbTex2!;
  }

  gl.deleteTexture(srcTex);

  // Flip Y: WebGL is Y-up, canvas 2D is Y-down
  const outCanvas = document.createElement("canvas");
  outCanvas.width = w;
  outCanvas.height = h;
  const outCtx = outCanvas.getContext("2d")!;
  outCtx.translate(0, h);
  outCtx.scale(1, -1);
  outCtx.drawImage(glCanvas, 0, 0);

  return outCanvas;
}
