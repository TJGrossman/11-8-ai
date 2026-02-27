import Link from "next/link";
import { ArrowRight, MapPin, Briefcase, Target, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — 11-8 AI",
  description:
    "10 years of enterprise Salesforce experience, now helping Santa Cruz businesses harness AI automation.",
};

export default function About() {
  return (
    <>
      {/* Header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.1),transparent)]" />
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">
              About 11-8 AI
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Enterprise experience, <br className="hidden sm:block" />
              local focus
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              The name says it all: 11-8 → elevate. The 8, tilted, becomes ∞ —
              infinite possibility. We&apos;re here to help you reach it.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="border-t border-border/40">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
          <div className="grid gap-12 md:grid-cols-5">
            <div className="md:col-span-3">
              <h2 className="text-2xl font-bold sm:text-3xl">The story</h2>
              <div className="mt-6 space-y-4 leading-relaxed text-muted-foreground">
                <p>
                  After 10 years as a Solutions Engineer at Salesforce — working
                  with enterprise and strategic accounts — I saw the same pattern
                  over and over: businesses drowning in manual work, spending
                  six figures on technology they barely used, and still relying on
                  spreadsheets and sticky notes for their most critical workflows.
                </p>
                <p>
                  AI changes that equation. The automations that used to require
                  massive budgets and months of implementation? They can now be
                  built in weeks at a fraction of the cost. But most business
                  owners don&apos;t know where to start — and they shouldn&apos;t have to
                  take on all the risk of figuring it out.
                </p>
                <p>
                  That&apos;s why 11-8 AI exists. I believe the best way to prove AI
                  works is to put my own time on the line. No retainers, no
                  hourly billing, no long proposals. We find the opportunity
                  together, I build the solution, and you only pay when the
                  results show up in your numbers.
                </p>
              </div>
            </div>
            <div className="space-y-6 md:col-span-2">
              {[
                {
                  icon: Briefcase,
                  label: "Background",
                  value: "10 years at Salesforce — Enterprise & Strategic SE",
                },
                {
                  icon: MapPin,
                  label: "Location",
                  value: "Santa Cruz, CA",
                },
                {
                  icon: Target,
                  label: "Focus",
                  value: "AI automation for local businesses",
                },
                {
                  icon: Heart,
                  label: "Philosophy",
                  value: "We only succeed when you do",
                },
              ].map((item) => (
                <div key={item.label} className="flex gap-4">
                  <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Value-Based */}
      <section className="border-t border-border/40 bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            Why the value-based model?
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              {
                title: "Traditional consulting",
                description:
                  "Pay by the hour. The longer it takes, the more you pay. Incentives are misaligned.",
                highlight: false,
              },
              {
                title: "The 11-8 AI model",
                description:
                  "Pay a percentage of measurable results. If we don't create value, we don't earn. Our success is your success.",
                highlight: true,
              },
              {
                title: "SaaS subscriptions",
                description:
                  "Pay monthly whether you use it or not. Generic tools that don't fit your exact workflow.",
                highlight: false,
              },
            ].map((item) => (
              <Card
                key={item.title}
                className={`border-border/40 ${
                  item.highlight
                    ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                    : "bg-card/50"
                }`}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Help */}
      <section className="border-t border-border/40">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            Who we work with
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            We&apos;re starting local in Santa Cruz and expanding from there.
            If your business has repetitive manual work, we can probably help.
          </p>
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {[
              "Property Management — tenant communication, maintenance triage, lease renewals",
              "Construction & Trades — quote follow-ups, scheduling, invoice reminders",
              "Real Estate — lead response, listing content, buyer/seller follow-ups",
              "Professional Services — intake, scheduling, client communication",
            ].map((item) => (
              <div
                key={item}
                className="rounded-lg border border-border/40 bg-card/50 p-4 text-sm"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/40 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Let&apos;s find your biggest opportunity
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              One conversation. No commitment. Just an honest look at how AI
              could help your business.
            </p>
            <div className="mt-8">
              <Button asChild size="lg" className="gap-2">
                <Link href="/book">
                  Book Your Free Session
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
