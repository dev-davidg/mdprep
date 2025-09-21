export function parseLongExplanationImages(longText?: string) {
  if (!longText) return [];
  const lines = longText.split(/\r?\n/);
  const imgs: { src: string; caption?: string }[] = [];
  for (const line of lines) {
    const m = line.match(/^IMG:\s*(.+?)(?:\s*\|\s*(.+))?$/i);
    if (m) {
      const src = m[1].trim();
      const caption = (m[2] || "").trim();
      imgs.push({ src, caption });
    }
  }
  return imgs;
}
