import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-4xl font-bold gradient-text">404</h1>
      <p className="text-muted-foreground">This page could not be found.</p>
      <Link href="/" className="text-primary hover:underline font-medium">
        Back to homepage
      </Link>
    </div>
  );
}
