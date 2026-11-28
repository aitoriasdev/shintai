/** Score colors are paired with the number itself, so meaning never relies on color alone (1.4.1). */
export function scoreColor(score: number): string {
  if (score >= 8) return 'bg-completed text-on-status'
  if (score >= 5) return 'bg-score text-on-status'
  return 'bg-destructive text-on-status'
}
