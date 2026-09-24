export class IntentMatcher {
  normalize(text: string): string {
    return text
      .toLocaleLowerCase('nl-NL')
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  match(input: string, candidates: Record<string, readonly string[]>): string | null {
    const normalized = this.normalize(input);
    if (!normalized) return null;
    let best: { intent: string; score: number } | null = null;
    for (const [intent, variants] of Object.entries(candidates)) {
      for (const variant of variants) {
        const score = this.similarity(normalized, this.normalize(variant));
        if (!best || score > best.score) best = { intent, score };
      }
    }
    return best && best.score >= 0.82 ? best.intent : null;
  }

  matchAllowed(input: string, allowedIntentIds: readonly string[], candidates: Record<string, readonly string[]>): string | null {
    const filtered = Object.fromEntries(allowedIntentIds.filter((id) => candidates[id]).map((id) => [id, candidates[id]]));
    return this.match(input, filtered);
  }

  private similarity(a: string, b: string): number {
    if (a === b) return 1;
    if (a.length >= 4 && (a.includes(b) || b.includes(a))) return Math.min(a.length, b.length) / Math.max(a.length, b.length) + 0.12;
    const distance = this.levenshtein(a, b);
    return 1 - distance / Math.max(a.length, b.length, 1);
  }

  private levenshtein(a: string, b: string): number {
    const row = Array.from({ length: b.length + 1 }, (_, index) => index);
    for (let i = 1; i <= a.length; i += 1) {
      let previous = row[0];
      row[0] = i;
      for (let j = 1; j <= b.length; j += 1) {
        const old = row[j];
        row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
        previous = old;
      }
    }
    return row[b.length];
  }
}
