"use client";

import { useEffect } from "react";
import { useSession } from "@/lib/discovery-store";
import type { ValueMapItem } from "@/lib/discovery-types";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, DollarSign, Clock, AlertTriangle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

const IMPACT_COLORS = {
  low: "hsl(var(--chart-2))",
  medium: "hsl(var(--chart-4))",
  high: "hsl(var(--chart-3))",
  critical: "hsl(var(--destructive))",
};

const IMPACT_LABELS = {
  low: "Minimal",
  medium: "Noticeable",
  high: "Significant",
  critical: "Severe",
};

function estimateHourlyRate(revenueRange: string, teamSize: string): number {
  const revMap: Record<string, number> = {
    "Under $100K": 25,
    "$100K - $500K": 35,
    "$500K - $1M": 50,
    "$1M - $5M": 65,
    "$5M+": 85,
  };
  const sizeMultiplier: Record<string, number> = {
    "Just me": 1.2,
    "2-5 people": 1.0,
    "6-15 people": 0.9,
    "16-50 people": 0.85,
    "50+ people": 0.8,
  };
  const base = revMap[revenueRange] ?? 40;
  const mult = sizeMultiplier[teamSize] ?? 1.0;
  return Math.round(base * mult);
}

export function StepValueMapping({ onNext, onBack }: StepProps) {
  const { session, dispatch } = useSession();

  const selectedPainPoints = session.painPoints
    .filter((p) => p.selected && p.hoursPerWeek && p.hoursPerWeek > 0)
    .sort((a, b) => (b.hoursPerWeek ?? 0) - (a.hoursPerWeek ?? 0));

  const hourlyRate = estimateHourlyRate(
    session.businessSnapshot.revenueRange,
    session.businessSnapshot.teamSize
  );

  // Build value map on mount / when pain points change
  useEffect(() => {
    const map: ValueMapItem[] = selectedPainPoints.map((pp) => {
      const hrs = pp.hoursPerWeek ?? 0;
      const annualHours = hrs * 52;
      const laborCost = annualHours * hourlyRate;
      const revenueLost = hrs > 10 ? laborCost * 0.3 : hrs > 5 ? laborCost * 0.15 : 0;
      const annualCost = laborCost + revenueLost;

      let impact: ValueMapItem["customerImpact"] = "low";
      if (annualCost > 100000) impact = "critical";
      else if (annualCost > 50000) impact = "high";
      else if (annualCost > 20000) impact = "medium";

      return {
        painPointId: pp.id,
        label: pp.label,
        hoursPerWeek: hrs,
        hourlyRate,
        revenueLostPerYear: Math.round(revenueLost),
        customerImpact: impact,
        annualCost: Math.round(annualCost),
      };
    });
    dispatch({ type: "SET_VALUE_MAP", valueMap: map });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPainPoints.length, hourlyRate]);

  const totalAnnualCost = session.valueMap.reduce(
    (sum, item) => sum + item.annualCost,
    0
  );
  const totalHoursPerWeek = session.valueMap.reduce(
    (sum, item) => sum + item.hoursPerWeek,
    0
  );

  const updateImpact = (painPointId: string, impact: ValueMapItem["customerImpact"]) => {
    dispatch({
      type: "SET_VALUE_MAP",
      valueMap: session.valueMap.map((v) =>
        v.painPointId === painPointId ? { ...v, customerImpact: impact } : v
      ),
    });
  };

  const updateHourlyRate = (painPointId: string, rate: number) => {
    dispatch({
      type: "SET_VALUE_MAP",
      valueMap: session.valueMap.map((v) => {
        if (v.painPointId !== painPointId) return v;
        const annualHours = v.hoursPerWeek * 52;
        const laborCost = annualHours * rate;
        const revenueLost =
          v.hoursPerWeek > 10 ? laborCost * 0.3 : v.hoursPerWeek > 5 ? laborCost * 0.15 : 0;
        return {
          ...v,
          hourlyRate: rate,
          revenueLostPerYear: Math.round(revenueLost),
          annualCost: Math.round(laborCost + revenueLost),
        };
      }),
    });
  };

  const chartData = session.valueMap.map((item) => ({
    name: item.label.length > 18 ? item.label.slice(0, 18) + "..." : item.label,
    cost: item.annualCost,
    impact: item.customerImpact,
  }));

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          The cost of manual work
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Here&apos;s what these bottlenecks are costing your business every year.
          Adjust the numbers if anything looks off.
        </p>
      </div>

      {/* Summary cards */}
      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Hours / week
          </div>
          <div className="mt-2 text-3xl font-bold">{totalHoursPerWeek}</div>
          <div className="text-sm text-muted-foreground">
            {Math.round(totalHoursPerWeek * 52)} hours / year
          </div>
        </div>
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            Estimated annual cost
          </div>
          <div className="mt-2 text-3xl font-bold text-primary">
            ${totalAnnualCost.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">
            Labor + opportunity cost
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="h-4 w-4" />
            Pain points
          </div>
          <div className="mt-2 text-3xl font-bold">{session.valueMap.length}</div>
          <div className="text-sm text-muted-foreground">
            Automation candidates
          </div>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="mb-10 rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Annual cost by pain point
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                type="number"
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={140}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip
                formatter={(value) => [`$${Number(value).toLocaleString()}`, "Annual cost"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
              />
              <Bar dataKey="cost" radius={[0, 6, 6, 0]}>
                {chartData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={IMPACT_COLORS[entry.impact as keyof typeof IMPACT_COLORS]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Detail cards */}
      <div className="mb-10 space-y-4">
        {session.valueMap.map((item) => (
          <div
            key={item.painPointId}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{item.label}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.hoursPerWeek} hrs/week &middot; {item.hoursPerWeek * 52} hrs/year
                </p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold">
                  ${item.annualCost.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">per year</div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  Effective hourly rate ($)
                </label>
                <input
                  type="number"
                  min={10}
                  max={200}
                  value={item.hourlyRate}
                  onChange={(e) =>
                    updateHourlyRate(item.painPointId, Number(e.target.value))
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  Customer experience impact
                </label>
                <div className="flex gap-1">
                  {(
                    Object.keys(IMPACT_LABELS) as Array<
                      keyof typeof IMPACT_LABELS
                    >
                  ).map((level) => (
                    <button
                      key={level}
                      onClick={() => updateImpact(item.painPointId, level)}
                      className={`flex-1 rounded-md border px-2 py-1.5 text-xs transition-all ${
                        item.customerImpact === level
                          ? "border-primary bg-primary/10 text-primary font-medium"
                          : "border-border text-muted-foreground hover:border-foreground/30"
                      }`}
                    >
                      {IMPACT_LABELS[level]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" size="lg" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button size="lg" onClick={onNext} disabled={session.valueMap.length === 0} className="gap-2">
          See Automation Opportunities
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
