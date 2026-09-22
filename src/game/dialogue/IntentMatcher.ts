const INTENTS: Record<string, string[]> = {
  ORDER_COFFEE: ['koffie','een koffie','ik wil koffie','koffie alsjeblieft','koffie graag'],
  ORDER_TEA: ['thee','hebben jullie thee','ik wil thee'],
  NOT_SURE: ['ik weet het niet','ik weet het nog niet','weet ik niet'],
  WITH_MILK: ['met melk','melk graag'],
  BLACK: ['zwart','zonder melk','zwart graag']
};

export function normalizeText(value: string): string {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z\s]/g,' ').replace(/\s+/g,' ').trim();
}

export function matchIntent(value: string): string | null {
  const n=normalizeText(value);
  for(const [intent,phrases] of Object.entries(INTENTS)) {
    if(phrases.some(p => n===normalizeText(p) || n.includes(normalizeText(p)))) return intent;
  }
  return null;
}
