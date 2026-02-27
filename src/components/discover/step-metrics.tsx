"use client";

import { useEffect } from "react";
import { useSession } from "@/lib/discovery-store";
import type { SuccessMetric } from "@/lib/discovery-types";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

function generateDefaultMetrics(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session: any
): SuccessMetric[] {
  const metrics: SuccessMetric[] = [];

  for (const opp of session.automationOpportunities) {
    if (opp.painPointId === "lead-response" || opp.title.toLowerCase().includes("lead")) {
      metrics.push({
        id: uuidv4(),
        name: "Lead Response Time",
        description: "Average time from inquiry received to first response",
        dataSource: "Email/CRM timestamps",
        baselinePeriod: "30 days",
        targetImprovement: "< 5 minutes (from current average)",
      });
      metrics.push({
        id: uuidv4(),
        name: "Lead Conversion Rate",
        description: "Percentage of inquiries that become customers",
        dataSource: "CRM pipeline data",
        baselinePeriod: "30 days",
        targetImprovement: "20%+ improvement over baseline",
      });
    } else if (opp.painPointId === "scheduling") {
      metrics.push({
        id: uuidv4(),
        name: "Scheduling Time Saved",
        description: "Hours per week spent on scheduling coordination",
        dataSource: "Time tracking / self-report",
        baselinePeriod: "30 days",
        targetImprovement: "60%+ reduction",
      });
    } else if (opp.painPointId === "client-comms") {
      metrics.push({
        id: uuidv4(),
        name: "Client Response Time",
        description: "Average time to respond to client inquiries",
        dataSource: "Communication platform logs",
        baselinePeriod: "30 days",
        targetImprovement: "< 15 minutes for routine questions",
      });
    } else {
      metrics.push({
        id: uuidv4(),
        name: `${opp.title} — Hours Saved`,
        description: `Weekly hours spent on ${opp.title.toLowerCase()} tasks`,
        dataSource: "Time tracking / self-report",
        baselinePeriod: "30 days",
        targetImprovement: `${opp.estimatedTimeSavingsPercent}%+ reduction`,
      });
    }
  }

  return metrics;
}

export function StepMetrics({ onNext, onBack }: StepProps) {
  const { session, dispatch } = useSession();

  // Generate default metrics if none exist
  useEffect(() => {
    if (
      session.agreement.metrics.length === 0 &&
      session.automationOpportunities.length > 0
    ) {
      const defaults = generateDefaultMetrics(session);
      dispatch({ type: "UPDATE_AGREEMENT", data: { metrics: defaults } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.automationOpportunities.length]);

  const updateMetric = (id: string, updates: Partial<SuccessMetric>) => {
    dispatch({
      type: "UPDATE_AGREEMENT",
      data: {
        metrics: session.agreement.metrics.map((m) =>
          m.id === id ? { ...m, ...updates } : m
        ),
      },
    });
  };

  const removeMetric = (id: string) => {
    dispatch({
      type: "UPDATE_AGREEMENT",
      data: {
        metrics: session.agreement.metrics.filter((m) => m.id !== id),
      },
    });
  };

  const addMetric = () => {
    dispatch({
      type: "UPDATE_AGREEMENT",
      data: {
        metrics: [
          ...session.agreement.metrics,
          {
            id: uuidv4(),
            name: "",
            description: "",
            dataSource: "",
            baselinePeriod: "30 days",
            targetImprovement: "",
          },
        ],
      },
    });
  };

  const isValid =
    session.agreement.metrics.length > 0 &&
    session.agreement.metrics.every((m) => m.name.trim() !== "");

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          How we&apos;ll measure success
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Let&apos;s agree on the specific metrics we&apos;ll track. These are
          the numbers that determine the value we create together.
        </p>
      </div>

      {/* Value share slider */}
      <div className="mb-10 rounded-xl border border-primary/30 bg-primary/5 p-6">
        <h3 className="font-semibold">Value-share percentage</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          You keep{" "}
          <span className="font-semibold text-foreground">
            {100 - session.agreement.valueSharePercent}%
          </span>{" "}
          of the measurable value created. 11-8 AI receives{" "}
          <span className="font-semibold text-primary">
            {session.agreement.valueSharePercent}%
          </span>
          .
        </p>
        <div className="mt-4 flex items-center gap-4">
          <span className="text-sm text-muted-foreground">5%</span>
          <input
            type="range"
            min={5}
            max={25}
            step={1}
            value={session.agreement.valueSharePercent}
            onChange={(e) =>
              dispatch({
                type: "UPDATE_AGREEMENT",
                data: { valueSharePercent: Number(e.target.value) },
              })
            }
            className="flex-1 accent-primary"
          />
          <span className="text-sm text-muted-foreground">25%</span>
        </div>
        <div className="mt-2 text-center text-2xl font-bold text-primary">
          {session.agreement.valueSharePercent}%
        </div>
      </div>

      {/* Timeline */}
      <div className="mb-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <label className="mb-2 block text-sm font-medium">
            Baseline period (days)
          </label>
          <p className="mb-3 text-xs text-muted-foreground">
            How long we measure current performance before making changes
          </p>
          <input
            type="number"
            min={14}
            max={90}
            value={session.agreement.baselineDays}
            onChange={(e) =>
              dispatch({
                type: "UPDATE_AGREEMENT",
                data: { baselineDays: Number(e.target.value) },
              })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <label className="mb-2 block text-sm font-medium">
            Measurement period (days)
          </label>
          <p className="mb-3 text-xs text-muted-foreground">
            How long we track results after deployment to calculate value
          </p>
          <input
            type="number"
            min={14}
            max={90}
            value={session.agreement.measurementDays}
            onChange={(e) =>
              dispatch({
                type: "UPDATE_AGREEMENT",
                data: { measurementDays: Number(e.target.value) },
              })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Metrics */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Success metrics</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Edit, remove, or add metrics until this feels right for both of us.
        </p>
      </div>

      <div className="mb-6 space-y-4">
        {session.agreement.metrics.map((metric) => (
          <div
            key={metric.id}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  value={metric.name}
                  onChange={(e) =>
                    updateMetric(metric.id, { name: e.target.value })
                  }
                  placeholder="Metric name"
                  className="w-full border-0 bg-transparent p-0 text-base font-semibold focus:outline-none focus:ring-0 placeholder:text-muted-foreground/50"
                />
                <input
                  type="text"
                  value={metric.description}
                  onChange={(e) =>
                    updateMetric(metric.id, { description: e.target.value })
                  }
                  placeholder="What are we measuring?"
                  className="w-full border-0 bg-transparent p-0 text-sm text-muted-foreground focus:outline-none focus:ring-0 placeholder:text-muted-foreground/30"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">
                      Data source
                    </label>
                    <input
                      type="text"
                      value={metric.dataSource}
                      onChange={(e) =>
                        updateMetric(metric.id, {
                          dataSource: e.target.value,
                        })
                      }
                      placeholder="e.g. CRM data, email logs"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">
                      Target improvement
                    </label>
                    <input
                      type="text"
                      value={metric.targetImprovement}
                      onChange={(e) =>
                        updateMetric(metric.id, {
                          targetImprovement: e.target.value,
                        })
                      }
                      placeholder="e.g. 50% reduction"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={() => removeMetric(metric.id)}
                className="ml-4 mt-1 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" onClick={addMetric} className="mb-10 gap-2">
        <Plus className="h-4 w-4" />
        Add a metric
      </Button>

      <div className="flex justify-between">
        <Button variant="ghost" size="lg" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button size="lg" onClick={onNext} disabled={!isValid} className="gap-2">
          Review Agreement
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
