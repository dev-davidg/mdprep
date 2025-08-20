export function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
}

export function allowedFreeQuestions(total: number): number {
  return Math.max(1, Math.ceil(total * 0.10));
}