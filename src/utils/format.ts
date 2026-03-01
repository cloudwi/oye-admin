export function formatDate(date: string | Date, includeTime?: boolean): string {
  const d = new Date(date);
  const dateStr = d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  if (!includeTime) return dateStr;
  const timeStr = d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  return `${dateStr} ${timeStr}`;
}
