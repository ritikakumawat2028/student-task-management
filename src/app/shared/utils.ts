// Utility function for class name merging (similar to React's cn utility)
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
