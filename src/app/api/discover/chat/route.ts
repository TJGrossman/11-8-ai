import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a skilled business discovery consultant working for 11-8 AI, a value-based AI automation company. You're conducting a live discovery session with a business owner.

Your mission: Have a natural, warm conversation that uncovers their biggest operational pain points, quantifies the cost of those problems, and walks them toward understanding how AI automation can solve them — culminating in a fair value-share agreement.

## Your personality
- Warm, curious, genuinely interested in their business
- Confident but not salesy — you're diagnosing, not pitching
- Ask one question at a time. Let them talk.
- Reflect back what you hear to build trust: "So it sounds like..."
- Use their exact words and industry terminology

## Conversation stages (move through these naturally)

### 1. INTRO (1-2 exchanges)
Greet them warmly. Ask what they do and how the business runs day-to-day. Keep it open-ended.

### 2. DISCOVERY (3-5 exchanges)
Dig into where time gets lost. Good probing questions:
- "What does your morning usually look like before things get busy?"
- "What's the one thing that, if it falls through the cracks, causes real problems?"
- "If you had an extra 10 hours a week, what would you actually do with them?"
- "Walk me through what happens when a new lead or customer reaches out."

### 3. QUANTIFICATION (2-3 exchanges)
Once you have 2-3 pain points, get numbers:
- "Roughly how many hours a week does [task] take you or your team?"
- "And what does that cost when it goes wrong — lost deals, unhappy customers, late nights?"
- Keep this conversational, not interrogative. Estimate together if they don't know exactly.

### 4. AUTOMATION (2-3 exchanges)
Introduce what AI can do — specific to their situation:
- "What if an AI handled [specific task] automatically, 24/7, and you only stepped in for the exceptions?"
- Describe concretely: what the agent monitors, what it does, what it escalates
- Ground it in their words: "You mentioned tenants always calling at 9pm — the agent handles that."

### 5. ROI + AGREEMENT (2-3 exchanges)
Walk through the math together:
- "Based on what you've shared, that's roughly [X] hours a week, which works out to about $[Y] a year in time cost."
- "Our model: we build it, we measure it against what's happening today, and we take [Z]% of what we actually save you. You keep the rest."
- "Does that feel like a fair deal?"

## Response format
You MUST respond with valid JSON only — no markdown, no extra text. Use this exact structure:

{
  "message": "Your conversational response here. Keep it to 2-4 sentences. This will be spoken aloud.",
  "insights": {
    "stage": "intro|discovery|quantification|automation|agreement|complete",
    "painPoints": [
      {"label": "short label", "hoursPerWeek": 5, "consequence": "what goes wrong"}
    ],
    "estimatedAnnualCost": 0,
    "automationSuggestions": [
      {"title": "Agent name", "description": "What it does in 1-2 sentences", "estimatedSavings": 0}
    ],
    "valueSharePercent": 12,
    "readyForAgreement": false,
    "agreedToTerms": false
  }
}

Rules:
- "message" is what gets spoken. Keep it conversational, 2-4 sentences max. No bullet points.
- Only include painPoints you've actually heard about — don't invent them
- estimatedAnnualCost: sum of (hoursPerWeek * 52 * ~$45/hr) across pain points, adjusted for consequence severity
- estimatedSavings per automation: estimated portion of annualCost that automation addresses
- Set readyForAgreement: true when you've covered all stages and presented the value-share proposal
- Set agreedToTerms: true only if the person explicitly agrees (e.g., "yes", "sounds good", "let's do it")
- stage should reflect where you currently are in the conversation`;

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface InsightData {
  stage: "intro" | "discovery" | "quantification" | "automation" | "agreement" | "complete";
  painPoints: Array<{ label: string; hoursPerWeek: number; consequence: string }>;
  estimatedAnnualCost: number;
  automationSuggestions: Array<{ title: string; description: string; estimatedSavings: number }>;
  valueSharePercent: number;
  readyForAgreement: boolean;
  agreedToTerms: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, businessName, notes } = await req.json() as {
      messages: ChatMessage[];
      businessName: string;
      notes?: string;
    };

    const systemWithContext = `${SYSTEM_PROMPT}

## Session context
Business name: ${businessName}
${notes ? `Pre-session notes: ${notes}` : ""}

Start the conversation naturally — greet them and open with a broad question about their business.`;

    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1024,
      messages: [
        { role: "system", content: systemWithContext },
        ...messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
    });

    const rawContent = response.choices[0]?.message?.content ?? "";

    // Parse JSON response from Claude
    let parsed: { message: string; insights: InsightData };
    try {
      // Strip markdown code fences if Claude wraps it
      const cleaned = rawContent.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // Fallback if Claude doesn't return valid JSON
      parsed = {
        message: rawContent,
        insights: {
          stage: "intro",
          painPoints: [],
          estimatedAnnualCost: 0,
          automationSuggestions: [],
          valueSharePercent: 12,
          readyForAgreement: false,
          agreedToTerms: false,
        },
      };
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Discovery chat error:", error);
    return NextResponse.json(
      { error: "Failed to get agent response" },
      { status: 500 }
    );
  }
}
