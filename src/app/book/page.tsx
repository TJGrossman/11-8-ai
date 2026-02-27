import { ArrowLeft, Clock, MapPin, Video, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book a Discovery Session — 11-8 AI",
  description:
    "Book a free discovery session to find where AI automation can save your business time and money.",
};

export default function Book() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.1),transparent)]" />
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left side — info */}
            <div>
              <Button asChild variant="ghost" size="sm" className="mb-6 -ml-3 gap-2 text-muted-foreground">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4" />
                  Back to home
                </Link>
              </Button>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Book a free discovery session
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                In about an hour, we&apos;ll map out your biggest time sinks, estimate
                their cost, and identify where AI automation could make the biggest
                impact — all with zero obligation.
              </p>

              <div className="mt-10 space-y-6">
                <h3 className="font-semibold">What to expect:</h3>
                <ul className="space-y-4">
                  {[
                    "Walk through your day-to-day operations together",
                    "Identify the top 2-3 automation opportunities",
                    "See estimated time and cost savings",
                    "Get a clear picture of what AI agents could handle for you",
                    "No pressure, no hard sell — just an honest conversation",
                  ].map((item) => (
                    <li key={item} className="flex gap-3 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-10 flex flex-wrap gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>~60 minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>In person (Santa Cruz) or remote</span>
                </div>
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  <span>Zoom available</span>
                </div>
              </div>
            </div>

            {/* Right side — Calendar embed placeholder */}
            <div className="flex items-center justify-center rounded-xl border border-border/40 bg-card/50 p-8 lg:min-h-[500px]">
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Calendar coming soon</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
                  We&apos;re setting up online booking. In the meantime, reach out
                  directly to schedule your session.
                </p>
                <div className="mt-6 space-y-3">
                  <Button asChild size="lg" className="w-full">
                    <a href="mailto:hello@11-8.ai">
                      Email hello@11-8.ai
                    </a>
                  </Button>
                </div>
                {/*
                  TODO: Replace this placeholder with Cal.com embed:
                  <Cal calLink="your-cal-link" />
                */}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
