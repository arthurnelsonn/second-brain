import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, incrementCallCount } from '@/lib/ai/rateLimit';
import { getGeminiFlash } from '@/lib/ai/gemini';

interface ExtractedIngredient {
  name: string;
  quantity: number | null;
  unit: string | null;
  category: string;
}

const SYSTEM = `You are a personal productivity assistant. Extract all ingredients from the recipe.
Return ONLY a JSON array with objects: [{"name": string, "quantity": number | null, "unit": string | null, "category": string}].
Categories must be one of: Produce, Dairy, Meat, Bakery, Frozen, Pantry, Beverages, Household, Other.
No markdown, no explanation, no code fences. Raw JSON array only.`;

export async function POST(req: NextRequest) {
  try {
    checkRateLimit();
    const { recipeText } = await req.json() as { recipeText: string };

    const model = getGeminiFlash();
    incrementCallCount();

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: `Extract ingredients from this recipe:\n\n${recipeText}` }] }],
      systemInstruction: SYSTEM,
    });

    const raw = result.response.text().trim();
    // Strip markdown code fences if model adds them anyway
    const json = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    const ingredients = JSON.parse(json) as ExtractedIngredient[];

    return NextResponse.json({ ingredients });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
