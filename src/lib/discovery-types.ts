export interface BusinessSnapshot {
  businessName: string;
  industry: string;
  teamSize: string;
  revenueRange: string;
  typicalDay: string;
}

export interface PainPoint {
  id: string;
  label: string;
  isCustom: boolean;
  selected: boolean;
  rank: number | null;
  hoursPerWeek: number | null;
  consequence: string;
}

export interface ValueMapItem {
  painPointId: string;
  label: string;
  hoursPerWeek: number;
  hourlyRate: number;
  revenueLostPerYear: number;
  customerImpact: "low" | "medium" | "high" | "critical";
  annualCost: number;
}

export interface AutomationOpportunity {
  id: string;
  painPointId: string;
  title: string;
  description: string;
  whatAgentDoes: string[];
  estimatedTimeSavingsPercent: number;
  estimatedRevenuImpact: number;
  difficulty: "simple" | "moderate" | "complex";
}

export interface SuccessMetric {
  id: string;
  name: string;
  description: string;
  dataSource: string;
  baselinePeriod: string;
  targetImprovement: string;
}

export interface Agreement {
  metrics: SuccessMetric[];
  valueSharePercent: number;
  baselineDays: number;
  measurementDays: number;
  agreedAt: string | null;
  clientName: string;
  clientEmail: string;
}

export interface DiscoverySession {
  id: string;
  createdAt: string;
  currentStep: number;
  businessSnapshot: BusinessSnapshot;
  painPoints: PainPoint[];
  valueMap: ValueMapItem[];
  automationOpportunities: AutomationOpportunity[];
  agreement: Agreement;
}

export const DEFAULT_PAIN_POINTS: Omit<PainPoint, "rank">[] = [
  { id: "lead-response", label: "Lead / inquiry response", isCustom: false, selected: false, hoursPerWeek: null, consequence: "" },
  { id: "scheduling", label: "Scheduling & coordination", isCustom: false, selected: false, hoursPerWeek: null, consequence: "" },
  { id: "data-entry", label: "Data entry & CRM updates", isCustom: false, selected: false, hoursPerWeek: null, consequence: "" },
  { id: "client-comms", label: "Client / tenant communication", isCustom: false, selected: false, hoursPerWeek: null, consequence: "" },
  { id: "invoicing", label: "Invoicing & follow-ups", isCustom: false, selected: false, hoursPerWeek: null, consequence: "" },
  { id: "reporting", label: "Reporting & compliance", isCustom: false, selected: false, hoursPerWeek: null, consequence: "" },
];

export const INDUSTRY_OPTIONS = [
  "Property Management",
  "Construction / Trades",
  "Real Estate",
  "Professional Services",
  "Retail / E-commerce",
  "Healthcare",
  "Agriculture / Farming",
  "Nonprofit",
  "Other",
];

export const TEAM_SIZE_OPTIONS = [
  "Just me",
  "2-5 people",
  "6-15 people",
  "16-50 people",
  "50+ people",
];

export const REVENUE_RANGE_OPTIONS = [
  "Prefer not to say",
  "Under $100K",
  "$100K - $500K",
  "$500K - $1M",
  "$1M - $5M",
  "$5M+",
];

export function createDefaultSession(id: string): DiscoverySession {
  return {
    id,
    createdAt: new Date().toISOString(),
    currentStep: 0,
    businessSnapshot: {
      businessName: "",
      industry: "",
      teamSize: "",
      revenueRange: "",
      typicalDay: "",
    },
    painPoints: DEFAULT_PAIN_POINTS.map((pp) => ({ ...pp, rank: null })),
    valueMap: [],
    automationOpportunities: [],
    agreement: {
      metrics: [],
      valueSharePercent: 12,
      baselineDays: 30,
      measurementDays: 30,
      agreedAt: null,
      clientName: "",
      clientEmail: "",
    },
  };
}
