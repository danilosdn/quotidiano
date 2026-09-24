export class IntentMatcher {
  private normalize(text: string): string {
    return text.toLocaleLowerCase('nl-NL').normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9\s]/g, '').trim();
  }
  match(input: string, candidates: Record<string, string[]>): string | null {
    const normalized = this.normalize(input);
    for (const [intent, variants] of Object.entries(candidates)) {
      if (variants.some((v) => this.normalize(v) === normalized)) return intent;
    }
    return null;
  }
}
