export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function todayString(): string {
  return formatDate(new Date());
}

export function extractVideoUrl(text: string): string | null {
  const match = text.match(/https?:\/\/[^\s]*(meet\.google\.com|zoom\.us|teams\.microsoft\.com)[^\s]*/i);
  return match ? match[0] : null;
}

export function truncate(text: string, maxChars: number): string {
  return text.length <= maxChars ? text : text.slice(0, maxChars) + '…';
}
