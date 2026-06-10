/**
 * Universal slug generator for SEO-friendly URLs.
 * - Converts to lowercase.
 * - Replaces spaces with hyphens.
 * - Removes non-alphanumeric characters (keeps hyphens and numbers).
 * - Removes duplicate hyphens.
 * - Trims leading and trailing hyphens.
 */
export function generateSlug(text) {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")           // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, "")       // Remove all non-word chars except hyphens
    .replace(/\-\-+/g, "-")         // Replace multiple hyphens with a single one
    .replace(/^-+/, "")             // Trim hyphens from start
    .replace(/-+$/, "");            // Trim hyphens from end
}
