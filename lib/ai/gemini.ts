import 'server-only';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { GenerativeModel } from '@google/generative-ai';

let _pro: GenerativeModel | null = null;
let _flash: GenerativeModel | null = null;

function client(): GoogleGenerativeAI {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not set');
  return new GoogleGenerativeAI(key);
}

export function getGeminiPro(): GenerativeModel {
  if (!_pro) _pro = client().getGenerativeModel({ model: 'gemini-3.6-flash' });
  return _pro;
}

export function getGeminiFlash(): GenerativeModel {
  if (!_flash) _flash = client().getGenerativeModel({ model: 'gemini-3.6-flash' });
  return _flash;
}
