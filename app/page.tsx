import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Pen,
  Users,
  Presentation,
  Video,
  Star,
  DollarSign,
  Download,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  Palette,
  Eye,
  Layers,
} from "lucide-react";
import Img from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <header className="relative border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="absolute inset-0 blob-bg"></div>
        <div className="container mx-auto px-4 py-6 flex items-center justify-between relative">
          <div className="flex items-center space-x-3">
            <div className=" puls-glow transform rotate-12">
              <Img
                src="/icon.png"
                alt="Scribbble Logo"
                className=""
                width={40}
                height={40}
              />
            </div>
            <span className="text-2xl font-bold gradient-text">Scribbble</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="https://kushagragour.lemonsqueezy.com/buy/7a5d045f-63fa-409e-b0ff-5c90b9020575"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-110 font-medium"
            >
              Buy License
            </a>
            {/* <a
              href="#features"
              className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-110 font-medium"
            >
              Features
            </a>
            <a
              href="#demo"
              className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-110 font-medium"
            >
              Demo
            </a> */}
            {/* <a
              href="#testimonials"
              className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-110 font-medium"
            >
              Reviews
            </a> */}
          </nav>
          <Button
            asChild
            className="bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <a
              href="https://github.com/chinchang/scribbble/releases/latest/download/Scribbble.dmg"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="w-4 h-4 mr-2" />
              Get Scribbble
            </a>
          </Button>
        </div>
      </header>

      <section className="relative py-32 px-4 blob-bg">
        <div className="absolute top-20 left-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl float-animation"></div>
        <div
          className="absolute bottom-20 right-10 w-48 h-48 bg-primary/20 rounded-full blur-3xl float-animation"
          style={{ animationDelay: "2s" }}
        ></div>

        <div className="container mx-auto text-center max-w-6xl relative">
          <div className="flex items-center justify-center gap-3 mb-8 flex-wrap">
            <Badge
              variant="secondary"
              className="bg-gradient-to-r from-red-100/10 to-accent/10 text-primary border-primary/30 px-6 py-2 text-lg font-semibold"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              The "Just works" Screen Annotation
            </Badge>
            <Badge className="bg-gradient-to-r from-red-600 to-orange-600 text-white border-0 px-4 py-2 text-lg font-bold animate-pulse shadow-lg">
              ON BFCM SALE
            </Badge>
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
            <span className="gradient-text">Draw</span> over{" "}
            <span className="relative">
              anything
              <svg
                className="absolute -bottom-4 left-0 w-full h-6 text-accent draw-animation"
                viewBox="0 0 300 20"
              >
                <path
                  d="M5 15 Q150 5 295 15"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
            The most <span className="text-primary font-bold">intuitive</span>{" "}
            screen annotation tool for educators, presenters, and creators who
            want to make an impact on the screen.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Button
              size="lg"
              asChild
              className="bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-white px-12 py-6 text-xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300"
            >
              <a
                href="https://github.com/chinchang/scribbble/releases/latest/download/Scribbble.dmg"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="w-6 h-6 mr-3" />
                Download Free
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="px-12 py-6 text-xl font-bold border-2 border-primary text-primary hover:bg-primary hover:text-white transform hover:scale-105 transition-all duration-300 bg-transparent"
            >
              <a
                href="https://kushagragour.lemonsqueezy.com/buy/7a5d045f-63fa-409e-b0ff-5c90b9020575"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Star className="w-6 h-6 mr-3" />
                Buy License
                <ArrowRight className="w-5 h-5 ml-3" />
              </a>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-3 bg-card/50 backdrop-blur rounded-2xl p-6 border border-primary/20">
              <Zap className="w-8 h-8 text-accent" />
              <span className="text-lg font-semibold">Zero Setup</span>
            </div>
            <div className="flex items-center justify-center space-x-3 bg-card/50 backdrop-blur rounded-2xl p-6 border border-primary/20">
              <DollarSign className="w-8 h-8 text-primary" />
              <span className="text-lg font-semibold">Pay One-time </span>
            </div>
            <div className="flex items-center justify-center space-x-3 bg-card/50 backdrop-blur rounded-2xl p-6 border border-primary/20">
              <Palette className="w-8 h-8 text-accent" />
              <span className="text-lg font-semibold">Multiple tools</span>
            </div>
          </div>
        </div>
      </section>

      <section
        id="demo"
        className="py-32 px-4 bg-gradient-to-br from-card to-background"
      >
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              See it in <span className="gradient-text">action</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Watch how Scribbble transforms ordinary presentations into
              extraordinary experiences
            </p>
          </div>

          <div className="relative bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl p-12 border-2 border-primary/20">
            <div className="aspect-video bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl flex items-center justify-center relative overflow-hidden">
              <iframe
                style={{ aspectRatio: "560 / 315", width: "100%" }}
                src="https://www.youtube.com/embed/Ghcb4ElDlF4?si=H30vDZti0-W2OmJ2"
                title="YouTube video player"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin"
                allowfullscreen
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* <section id="features" className="py-32 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              Built for <span className="gradient-text">creators</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Every feature designed to amplify your creativity and engage your audience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5 hover:border-primary/40 hover:shadow-2xl transform hover:scale-105 transition-all duration-500 group">
              <CardHeader className="text-center pb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center mb-6 mx-auto group-hover:rotate-12 transition-transform duration-500">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-foreground mb-4">Educators Love It</CardTitle>
                <CardDescription className="text-lg text-muted-foreground leading-relaxed">
                  Transform boring lectures into interactive experiences. Highlight, circle, and draw to keep students
                  engaged.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-accent/20 bg-gradient-to-br from-card to-accent/5 hover:border-accent/40 hover:shadow-2xl transform hover:scale-105 transition-all duration-500 group">
              <CardHeader className="text-center pb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-accent to-primary rounded-3xl flex items-center justify-center mb-6 mx-auto group-hover:rotate-12 transition-transform duration-500">
                  <Presentation className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-foreground mb-4">Presenters Thrive</CardTitle>
                <CardDescription className="text-lg text-muted-foreground leading-relaxed">
                  Make every presentation memorable. Emphasize key points and guide your audience's attention
                  effortlessly.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5 hover:border-primary/40 hover:shadow-2xl transform hover:scale-105 transition-all duration-500 group">
              <CardHeader className="text-center pb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center mb-6 mx-auto group-hover:rotate-12 transition-transform duration-500">
                  <Video className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-foreground mb-4">Creators Shine</CardTitle>
                <CardDescription className="text-lg text-muted-foreground leading-relaxed">
                  Elevate your content creation. Add visual flair to tutorials and make complex concepts crystal clear.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section> */}
      {/* 
      <section id="testimonials" className="py-32 px-4 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              <span className="gradient-text">Thousands</span> love it
            </h2>
            <p className="text-xl text-muted-foreground">Real stories from real creators making real impact</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <Card className="border-2 border-primary/20 bg-card/80 backdrop-blur hover:shadow-2xl transform hover:scale-105 transition-all duration-500">
              <CardContent className="pt-8">
                <div className="flex items-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 fill-accent text-accent mr-1" />
                  ))}
                </div>
                <p className="text-xl text-foreground mb-8 leading-relaxed font-medium">
                  "Scribbble completely transformed my online teaching. My students are 10x more engaged when I can draw
                  and highlight directly on screen!"
                </p>
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-xl">SM</span>
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-lg">Sarah Martinez</p>
                    <p className="text-muted-foreground">High School Math Teacher</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-accent/20 bg-card/80 backdrop-blur hover:shadow-2xl transform hover:scale-105 transition-all duration-500">
              <CardContent className="pt-8">
                <div className="flex items-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 fill-accent text-accent mr-1" />
                  ))}
                </div>
                <p className="text-xl text-foreground mb-8 leading-relaxed font-medium">
                  "As a content creator, Scribbble is absolutely essential. It's intuitive, powerful, and makes my
                  tutorials incredibly engaging!"
                </p>
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-xl">DJ</span>
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-lg">David Johnson</p>
                    <p className="text-muted-foreground">YouTube Creator (2M+ subs)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section> */}

      <section
        id="download"
        className="py-32 px-4 bg-gradient-to-br from-background to-card"
      >
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-5xl md:text-7xl font-black mb-8">
            Ready to <span className="gradient-text">scribble</span>?
          </h2>
          <p className="text-2xl text-muted-foreground mb-12 leading-relaxed">
            Join billions of users who are already transforming their screen
            shares with Scribbble!
          </p>
          <Button
            size="lg"
            asChild
            className="bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-white px-16 py-8 text-2xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 mb-8"
          >
            <a
              href="https://github.com/chinchang/scribbble/releases/latest/download/Scribbble.dmg"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="w-8 h-8 mr-4" />
              Download Scribbble Free
            </a>
          </Button>
          <div className="flex items-center justify-center space-x-8 text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-primary" />
              <span>macOS 11.0+ (Intel/Silicon)</span>
            </div>
            {/* <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-accent" />
              <span>Free Forever</span>
            </div> */}
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-primary" />
              <span>No Signup Required</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t-2 border-primary/20 py-16 px-4 bg-gradient-to-br from-card to-background">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div className="flex items-center space-x-4 mb-8 md:mb-0">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center">
                <Img
                  src="/icon.png"
                  alt="Scribbble Logo"
                  className=""
                  width={40}
                  height={40}
                />
              </div>
              <span className="text-3xl font-bold gradient-text">
                Scribbble
              </span>
            </div>
            <div className="flex items-center space-x-8">
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-110 font-medium"
              >
                Privacy
              </a>

              <a
                href="mailto:chinchang457@gmail.com"
                className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-110 font-medium"
              >
                Support
              </a>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center">
            <p className="text-muted-foreground text-lg">
              © 2025 Kushagra Gour. Scribbbling worldwide since 2025.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
