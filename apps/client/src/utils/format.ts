export function formatSize(bytes: number): string {
  return `${(bytes / 1024 / 1024).toLocaleString('pl-PL', { maximumFractionDigits: 1 })} MB`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('pl-PL', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}
