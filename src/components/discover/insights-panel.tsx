"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { InsightData } from "@/app/api/discover/chat/route";
import { DollarSign, Clock, Bot, CheckCircle2 } from "lucide-react";

interface InsightsPanelProps {
  insights: InsightData;
  businessName: string;
}

const STAGE_LABELS: Record<InsightData["stage"], string> = {
  intro: "Getting acquainted",
  discovery: "Discovering pain points",
  quantification: "Measuring impact",
  automation: "Exploring solutions",
  agreement: "Reviewing proposal",
  complete: "Session complete",
};

export function InsightsPanel({ insights, businessName }: InsightsPanelProps) {
  const totalHoursPerWeek = insights.painPoints.reduce(
    (sum, p) => sum + p.hoursPerWeek,
    0
  );

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto">
      {/* Stage */}
      <div className="rounded-xl border border-border/40 bg-card/50 p-4">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Session stage
        </div>
        <div className="mt-1 font-semibold text-primary">
          {STAGE_LABELS[insights.stage]}
        </div>
        <div className="mt-3 flex gap-1">
          {(["intro", "discovery", "quantification", "automation", "agreement", "complete"] as const).map(
            (s, i) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= (["intro", "discovery", "quantification", "automation", "agreement", "complete"] as const).indexOf(insights.stage)
                    ? "bg-primary"
                    : "bg-border"
                }`}
              />
            )
          )}
        </div>
      </div>

      {/* Summary numbers */}
      {totalHoursPerWeek > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-3"
        >
          <div className="rounded-xl border border-border/40 bg-card/50 p-4">
            <Clock className="mb-1 h-4 w-4 text-muted-foreground" />
            <div className="text-2xl font-bold">{totalHoursPerWeek}</div>
            <div className="text-xs text-muted-foreground">hrs/week lost</div>
          </div>
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
            <DollarSign className="mb-1 h-4 w-4 text-primary" />
            <div className="text-2xl font-bold text-primary">
              ${(insights.estimatedAnnualCost / 1000).toFixed(0)}k
            </div>
            <div className="text-xs text-muted-foreground">est. annual cost</div>
          </div>
        </motion.div>
      )}

      {/* Pain points */}
      {insights.painPoints.length > 0 && (
        <div>
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Pain points uncovered
          </div>
          <div className="space-y-2">
            <AnimatePresence>
              {insights.painPoints.map((point, i) => (
                <motion.div
                  key={point.label}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-lg border border-border/40 bg-card/50 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-medium text-sm">{point.label}</div>
                    {point.hoursPerWeek > 0 && (
                      <div className="shrink-0 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {point.hoursPerWeek}h/wk
                      </div>
                    )}
                  </div>
                  {point.consequence && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {point.consequence}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Automation suggestions */}
      {insights.automationSuggestions.length > 0 && (
        <div>
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Automation opportunities
          </div>
          <div className="space-y-2">
            <AnimatePresence>
              {insights.automationSuggestions.map((suggestion, i) => (
                <motion.div
                  key={suggestion.title}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-lg border border-border/40 bg-card/50 p-3"
                >
                  <div className="flex items-start gap-2">
                    <Bot className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <div className="font-medium text-sm">{suggestion.title}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {suggestion.description}
                      </div>
                      {suggestion.estimatedSavings > 0 && (
                        <div className="mt-1 text-xs font-medium text-primary">
                          ~${suggestion.estimatedSavings.toLocaleString()}/yr saved
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Agreement */}
      {insights.readyForAgreement && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-primary/40 bg-primary/5 p-4"
        >
          <div className="text-xs font-medium uppercase tracking-wider text-primary">
            Value-share proposal
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-primary">
              {insights.valueSharePercent}%
            </span>
            <span className="ml-1 text-sm text-muted-foreground">of value created</span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            You keep {100 - insights.valueSharePercent}% —&nbsp;
            ~$
            {(
              (insights.estimatedAnnualCost *
                (1 - insights.valueSharePercent / 100)) /
              1000
            ).toFixed(0)}
            k/yr
          </div>
        </motion.div>
      )}

      {/* Agreed */}
      {insights.agreedToTerms && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-center"
        >
          <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-green-500" />
          <div className="font-semibold text-green-500">Agreement confirmed</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {businessName} has agreed to move forward
          </div>
        </motion.div>
      )}
    </div>
  );
}
