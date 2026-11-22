/** Formats a byte count as a short human-readable string, e.g. 1536 -> "1.5 KB". Shared by PDF and Image tools so there's one implementation, not one per category. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
