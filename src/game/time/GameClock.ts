export class GameClock {
  public day: number;
  public minutes: number;
  constructor(day: number, minutes: number) { this.day = day; this.minutes = minutes; }
  advance(deltaMinutes: number): void {
    this.minutes += deltaMinutes;
    while (this.minutes >= 1440) { this.minutes -= 1440; this.day += 1; }
  }
  label(): string {
    const h = Math.floor(this.minutes / 60).toString().padStart(2, '0');
    const m = (this.minutes % 60).toString().padStart(2, '0');
    return `Dag ${this.day} · ${h}:${m}`;
  }
}
