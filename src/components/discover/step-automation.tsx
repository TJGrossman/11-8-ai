"use client";

import { useEffect } from "react";
import { useSession } from "@/lib/discovery-store";
import type { AutomationOpportunity } from "@/lib/discovery-types";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Bot, Clock, TrendingUp, Zap } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

// Template-based automation suggestions keyed by pain point ID patterns
const AUTOMATION_TEMPLATES: Record<
  string,
  Omit<AutomationOpportunity, "id" | "painPointId" | "estimatedTimeSavingsPercent" | "estimatedRevenuImpact">
> = {
  "lead-response": {
    title: "AI Lead Response Agent",
    description:
      "An AI agent that monitors incoming inquiries and responds instantly with personalized messages, qualification questions, and scheduling links.",
    whatAgentDoes: [
      "Monitors email, web forms, and texts for new inquiries",
      "Sends a personalized response within 60 seconds",
      "Asks qualifying questions and captures key info",
      "Books meetings directly on your calendar",
      "Hands off hot leads with context for your follow-up",
    ],
    difficulty: "simple",
  },
  scheduling: {
    title: "Smart Scheduling Coordinator",
    description:
      "An AI agent that handles the back-and-forth of scheduling, coordinates availability across your team, and sends reminders.",
    whatAgentDoes: [
      "Manages your team's availability in real-time",
      "Handles rescheduling requests automatically",
      "Sends confirmation and reminder sequences",
      "Coordinates multi-party meetings",
      "Syncs with your existing calendar tools",
    ],
    difficulty: "simple",
  },
  "data-entry": {
    title: "Automated Data Capture Agent",
    description:
      "An AI agent that extracts information from emails, forms, and documents, then updates your CRM and systems automatically.",
    whatAgentDoes: [
      "Reads incoming emails and documents for key data",
      "Updates CRM records automatically",
      "Creates tasks and follow-ups from conversation context",
      "Flags inconsistencies or missing information",
      "Generates weekly data quality reports",
    ],
    difficulty: "moderate",
  },
  "client-comms": {
    title: "Client Communication Agent",
    description:
      "An AI agent that handles routine client communications — status updates, responses to common questions, and proactive outreach.",
    whatAgentDoes: [
      "Responds to routine questions with accurate, personalized answers",
      "Sends proactive status updates and check-ins",
      "Escalates complex issues to you with full context",
      "Maintains communication logs and history",
      "Generates monthly client communication summaries",
    ],
    difficulty: "moderate",
  },
  invoicing: {
    title: "Invoice & Follow-Up Agent",
    description:
      "An AI agent that generates invoices, sends reminders, tracks payments, and follows up on overdue accounts.",
    whatAgentDoes: [
      "Generates invoices from completed work records",
      "Sends payment reminders on a smart schedule",
      "Follows up on overdue invoices with escalating urgency",
      "Reconciles payments with records",
      "Sends you a weekly AR summary",
    ],
    difficulty: "simple",
  },
  reporting: {
    title: "Automated Reporting Agent",
    description:
      "An AI agent that pulls data from your systems, generates reports, and flags important trends and anomalies.",
    whatAgentDoes: [
      "Aggregates data from multiple sources automatically",
      "Generates weekly and monthly reports",
      "Highlights trends, anomalies, and action items",
      "Distributes reports to the right stakeholders",
      "Creates compliance-ready documentation",
    ],
    difficulty: "moderate",
  },
};

function generateOpportunities(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session: any
): AutomationOpportunity[] {
  return session.valueMap
    .sort(
      (a: { annualCost: number }, b: { annualCost: number }) =>
        b.annualCost - a.annualCost
    )
    .slice(0, 3)
    .map((item: { painPointId: string; annualCost: number; hoursPerWeek: number; label: string }) => {
      const template = AUTOMATION_TEMPLATES[item.painPointId];
      const base = template || {
        title: `${item.label} Automation Agent`,
        description: `An AI agent that automates the manual work involved in ${item.label.toLowerCase()}, saving your team significant time each week.`,
        whatAgentDoes: [
          `Handles routine ${item.label.toLowerCase()} tasks automatically`,
          "Responds to incoming requests within minutes",
          "Escalates complex situations to your team with context",
          "Tracks all activity and generates weekly summaries",
          "Learns and improves from your feedback over time",
        ],
        difficulty: "moderate" as const,
      };

      const timeSavings = item.hoursPerWeek > 10 ? 70 : item.hoursPerWeek > 5 ? 60 : 50;

      return {
        id: uuidv4(),
        painPointId: item.painPointId,
        ...base,
        estimatedTimeSavingsPercent: timeSavings,
        estimatedRevenuImpact: Math.round(item.annualCost * (timeSavings / 100)),
      };
    });
}

export function StepAutomation({ onNext, onBack }: StepProps) {
  const { session, dispatch } = useSession();

  useEffect(() => {
    if (session.valueMap.length > 0 && session.automationOpportunities.length === 0) {
      const opps = generateOpportunities(session);
      dispatch({ type: "SET_OPPORTUNITIES", opportunities: opps });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.valueMap.length]);

  const totalSavings = session.automationOpportunities.reduce(
    (sum, opp) => sum + opp.estimatedRevenuImpact,
    0
  );

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Your top automation opportunities
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Based on your pain points, here&apos;s where AI agents could make the
          biggest impact. These are real solutions we can build.
        </p>
      </div>

      {/* Total savings banner */}
      <div className="mb-10 rounded-xl border border-primary/30 bg-primary/5 p-6 text-center">
        <div className="text-sm font-medium uppercase tracking-wider text-primary">
          Estimated total annual savings
        </div>
        <div className="mt-2 text-4xl font-bold text-primary">
          ${totalSavings.toLocaleString()}
        </div>
        <div className="mt-1 text-sm text-muted-foreground">
          across {session.automationOpportunities.length} automations
        </div>
      </div>

      {/* Opportunity cards */}
      <div className="mb-10 space-y-6">
        {session.automationOpportunities.map((opp, i) => {
          const valueMapItem = session.valueMap.find(
            (v) => v.painPointId === opp.painPointId
          );
          const currentHours = valueMapItem?.hoursPerWeek ?? 0;
          const savedHours = Math.round(
            currentHours * (opp.estimatedTimeSavingsPercent / 100)
          );

          return (
            <div
              key={opp.id}
              className="overflow-hidden rounded-xl border border-border bg-card"
            >
              {/* Header */}
              <div className="border-b border-border/40 bg-muted/30 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{opp.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Zap className="h-3.5 w-3.5" />
                        {opp.difficulty}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <TrendingUp className="h-3.5 w-3.5" />$
                        {opp.estimatedRevenuImpact.toLocaleString()}/yr savings
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {opp.description}
                </p>

                {/* Before / After */}
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-border bg-background p-4">
                    <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Before (Today)
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <span className="text-2xl font-bold">{currentHours}</span>
                      <span className="text-sm text-muted-foreground">hrs/week</span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                    <div className="mb-2 text-xs font-medium uppercase tracking-wider text-primary">
                      After (With AI)
                    </div>
                    <div className="flex items-center gap-2">
                      <Bot className="h-5 w-5 text-primary" />
                      <span className="text-2xl font-bold text-primary">
                        {currentHours - savedHours}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        hrs/week ({savedHours} hrs saved)
                      </span>
                    </div>
                  </div>
                </div>

                {/* What the agent does */}
                <div className="mt-6">
                  <h4 className="mb-3 text-sm font-medium">
                    What the AI agent does:
                  </h4>
                  <ul className="space-y-2">
                    {opp.whatAgentDoes.map((item, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <Bot className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" size="lg" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button size="lg" onClick={onNext} className="gap-2">
          Define Success Metrics
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
