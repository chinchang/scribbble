import Img from "next/image";
import { personas } from "@/lib/personas";
import { comparisons } from "@/lib/comparisons";
import { listicles } from "@/lib/listicles";

export default function SiteFooter() {
  return (
    <footer className="border-t-2 border-primary/20 py-16 px-4 bg-gradient-to-br from-card to-background">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center space-x-4 mb-12">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center">
            <Img
              src="/icon.png"
              alt="Scribbble Logo"
              width={40}
              height={40}
            />
          </div>
          <span className="text-3xl font-bold gradient-text">Scribbble</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          <div>
            <h3 className="font-bold text-foreground mb-4">Tools</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="/tools/screenshot-annotate"
                  className="text-muted-foreground hover:text-primary transition font-medium"
                >
                  Screenshot Annotate
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-foreground mb-4">For</h3>
            <ul className="space-y-3">
              {personas.map((p) => (
                <li key={p.slug}>
                  <a
                    href={`/for/${p.slug}`}
                    className="text-muted-foreground hover:text-primary transition font-medium"
                  >
                    {p.audience}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-foreground mb-4">Guides</h3>
            <ul className="space-y-3">
              {listicles.map((l) => (
                <li key={l.slug}>
                  <a
                    href={`/best/${l.slug}`}
                    className="text-muted-foreground hover:text-primary transition font-medium"
                  >
                    {l.h1}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-foreground mb-4">Compare</h3>
            <ul className="space-y-3">
              {comparisons.map((c) => (
                <li key={c.slug}>
                  <a
                    href={`/vs/${c.slug}`}
                    className="text-muted-foreground hover:text-primary transition font-medium"
                  >
                    Scribbble vs {c.competitor}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-foreground mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://kushagragour.lemonsqueezy.com/buy/7a5d045f-63fa-409e-b0ff-5c90b9020575"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition font-medium"
                >
                  Buy License
                </a>
              </li>
              <li>
                <a
                  href="mailto:chinchang457@gmail.com"
                  className="text-muted-foreground hover:text-primary transition font-medium"
                >
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border text-center">
          <p className="text-muted-foreground text-lg">
            © 2025 Kushagra Gour. Scribbbling worldwide since 2025.
          </p>
        </div>
      </div>
    </footer>
  );
}
