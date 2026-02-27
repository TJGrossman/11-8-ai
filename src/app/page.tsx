import Link from "next/link";
import { ArrowRight, BarChart3, Bot, Handshake, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.15),transparent)]" />
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:py-40">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">
              Value-Based AI Automation
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              AI agents that pay for themselves
              <span className="text-muted-foreground"> — or you don&apos;t pay at all</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
              We find the manual work costing your business the most, automate it
              with AI, measure the results, and split the value we create together.
              No upfront fees. No risk.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="gap-2">
                <Link href="/book">
                  Book a Free Discovery Session
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/how-it-works">See How It Works</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="border-t border-border/40">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              A model that makes sense
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              We only succeed when you do. Our value-share model means our
              incentives are perfectly aligned with yours.
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Shield,
                title: "Zero Risk",
                description:
                  "No upfront fees. We invest our time and expertise to build your automations before we ever send an invoice.",
              },
              {
                icon: BarChart3,
                title: "Measurable Results",
                description:
                  "Every automation is tied to clear metrics we agree on together — hours saved, leads converted, revenue gained.",
              },
              {
                icon: Handshake,
                title: "Fair Value Share",
                description:
                  "You keep 85-90% of the value created. We take a small percentage — only after we've proven the results.",
              },
              {
                icon: Bot,
                title: "AI That Works 24/7",
                description:
                  "Your AI agents respond to leads, handle follow-ups, and manage routine tasks around the clock.",
              },
              {
                icon: Zap,
                title: "Fast Deployment",
                description:
                  "Most automations are live within 30 days. You start seeing measurable results within 60.",
              },
              {
                icon: ArrowRight,
                title: "Local & Personal",
                description:
                  "Based in Santa Cruz, CA. We sit down with you, understand your business, and build solutions face-to-face.",
              },
            ].map((item) => (
              <Card key={item.title} className="border-border/40 bg-card/50">
                <CardHeader>
                  <item.icon className="mb-2 h-6 w-6 text-primary" />
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {item.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Preview */}
      <section className="border-t border-border/40 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Five steps to automation
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              A transparent process from first conversation to measurable results.
            </p>
          </div>
          <div className="mt-16 grid gap-0 md:grid-cols-5">
            {[
              { step: "01", label: "Discovery", desc: "We sit down and find your biggest time sinks" },
              { step: "02", label: "Baseline", desc: "Measure current performance together" },
              { step: "03", label: "Build", desc: "Deploy AI agents tailored to your workflow" },
              { step: "04", label: "Measure", desc: "Track results against agreed metrics" },
              { step: "05", label: "Share Value", desc: "You pay a percentage of what we saved you" },
            ].map((item, i) => (
              <div key={item.step} className="relative flex flex-col items-center px-4 py-6 text-center">
                {i < 4 && (
                  <div className="absolute right-0 top-1/2 hidden h-px w-full -translate-y-1/2 bg-border/60 md:block" />
                )}
                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {item.step}
                </div>
                <h3 className="mt-4 font-semibold">{item.label}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button asChild variant="outline" size="lg">
              <Link href="/how-it-works">
                Learn more about our process
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/40">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to see what AI can do for your business?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Book a free discovery session. No commitment, no pitch — just an
              honest look at where automation could save you time and money.
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
