import Link from "next/link";
import {
  ArrowRight,
  Search,
  Ruler,
  Wrench,
  BarChart3,
  Handshake,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works — 11-8 AI",
  description:
    "Our 5-step process: Discovery, Baseline, Build, Measure, Share Value. Zero risk AI automation.",
};

const steps = [
  {
    icon: Search,
    number: "01",
    title: "Discovery",
    subtitle: "Find the biggest opportunities",
    description:
      "We sit down together — in person or on a call — and walk through your day-to-day operations. Using our interactive discovery tool, we identify the manual tasks costing you the most time, money, and missed opportunities.",
    details: [
      "Map your daily workflows and pain points",
      "Identify which tasks are best suited for AI automation",
      "Estimate the time and revenue impact of each bottleneck",
      "Prioritize the top 2-3 highest-value automations",
    ],
    duration: "1-2 hours",
  },
  {
    icon: Ruler,
    number: "02",
    title: "Baseline",
    subtitle: "Measure where you are today",
    description:
      "Before we change anything, we establish clear baseline metrics so we both know exactly what 'better' looks like. This 30-day period lets us capture honest data on current performance.",
    details: [
      "Track response times, conversion rates, hours spent",
      "Document current workflows and their outcomes",
      "Agree on the specific KPIs we'll improve",
      "Set the measurement methodology together",
    ],
    duration: "30 days",
  },
  {
    icon: Wrench,
    number: "03",
    title: "Build",
    subtitle: "Deploy your AI agents",
    description:
      "We build and deploy custom AI agents tailored to your specific workflows. These agents handle the tasks we identified — responding to leads, managing follow-ups, processing data, and more.",
    details: [
      "Custom AI agents built for your exact workflows",
      "Integrated with your existing tools and systems",
      "Tested thoroughly before going live",
      "You review and approve everything before launch",
    ],
    duration: "2-4 weeks",
  },
  {
    icon: BarChart3,
    number: "04",
    title: "Measure",
    subtitle: "Track real results",
    description:
      "For 30 days after deployment, we track the same KPIs against your baseline. No assumptions or estimates — just clear, verifiable data showing exactly what changed.",
    details: [
      "Side-by-side comparison with baseline metrics",
      "Transparent dashboard you can check anytime",
      "Weekly check-ins to review progress",
      "Clear calculation of value created",
    ],
    duration: "30 days",
  },
  {
    icon: Handshake,
    number: "05",
    title: "Share Value",
    subtitle: "Pay only for results",
    description:
      "Based on the measurable value created — hours saved, revenue gained, costs reduced — you pay a percentage (typically 10-15%). If the automation didn't create value, you don't pay. Simple.",
    details: [
      "Value-share percentage agreed on upfront",
      "Invoice based on verified, measurable results",
      "Monthly billing with full transparency",
      "Adjust or cancel anytime — no lock-in",
    ],
    duration: "Ongoing",
  },
];

export default function HowItWorks() {
  return (
    <>
      {/* Header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.1),transparent)]" />
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">
              Our Process
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              From discovery to measurable results
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              A transparent, collaborative process designed so you never feel like
              you&apos;re taking a leap of faith. You see every step, approve every
              decision, and only pay for real results.
            </p>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="border-t border-border/40">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
          <div className="space-y-16">
            {steps.map((step, i) => (
              <div key={step.number} className="relative">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="absolute bottom-0 left-6 top-20 w-px translate-x-[0.5px] bg-border/60 sm:left-8" />
                )}

                <div className="flex gap-6 sm:gap-8">
                  {/* Step number */}
                  <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground sm:h-16 sm:w-16 sm:text-base">
                    {step.number}
                  </div>

                  <div className="flex-1 pb-4">
                    <div className="flex items-baseline gap-3">
                      <h2 className="text-2xl font-bold sm:text-3xl">{step.title}</h2>
                      <span className="text-sm text-muted-foreground">
                        {step.duration}
                      </span>
                    </div>
                    <p className="mt-1 text-lg text-primary">{step.subtitle}</p>
                    <p className="mt-4 leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>

                    <Card className="mt-6 border-border/40 bg-card/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                          What happens in this step
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {step.details.map((detail) => (
                            <li key={detail} className="flex gap-3 text-sm">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ-like section */}
      <section className="border-t border-border/40 bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Common questions
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            {[
              {
                q: "What if the automation doesn't work?",
                a: "Then you don't pay. We take on the risk of building and deploying. If we can't create measurable value, we haven't earned anything.",
              },
              {
                q: "What types of businesses is this for?",
                a: "Any business with repetitive manual tasks — property management, construction, real estate, professional services, retail, and more. If your team spends time on work a well-trained AI could handle, we can help.",
              },
              {
                q: "How do you measure 'value created'?",
                a: "We define this together during Discovery. It could be hours saved, faster response times, more leads converted, or direct revenue gains. We use your real data, not estimates.",
              },
              {
                q: "What's the typical value-share percentage?",
                a: "Usually 10-15% of the measurable value created. The exact percentage depends on the complexity and scale. You keep the vast majority of the savings.",
              },
            ].map((item) => (
              <div key={item.q}>
                <h3 className="font-semibold">{item.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/40">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Sound fair? Let&apos;s talk.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              A discovery session takes about an hour. We&apos;ll map your biggest
              time sinks and show you exactly where AI can help — no strings attached.
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
