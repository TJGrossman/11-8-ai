import Link from "next/link";
import { Logo } from "./logo";
import { Separator } from "./ui/separator";

export function Footer() {
  return (
    <footer className="border-t border-border/40">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
          <div className="flex flex-col items-center gap-2 md:items-start">
            <Logo className="text-lg" />
            <p className="text-sm text-muted-foreground">
              Elevate your business with AI
            </p>
          </div>
          <div className="flex gap-8 text-sm text-muted-foreground">
            <Link href="/how-it-works" className="hover:text-foreground transition-colors">
              How It Works
            </Link>
            <Link href="/about" className="hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="/book" className="hover:text-foreground transition-colors">
              Book a Session
            </Link>
          </div>
        </div>
        <Separator className="my-8" />
        <div className="flex flex-col items-center justify-between gap-4 text-xs text-muted-foreground sm:flex-row">
          <p>&copy; {new Date().getFullYear()} 11-8 AI. All rights reserved.</p>
          <p>Santa Cruz, CA</p>
        </div>
      </div>
    </footer>
  );
}
