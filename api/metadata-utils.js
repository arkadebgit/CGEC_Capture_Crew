/**
 * Formats a URL slug into a readable title.
 * e.g., "esperanza-fest" -> "Esperanza Fest"
 */
function formatSlug(slug) {
  if (!slug) return "";
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Generates SEO metadata based on the requested URL path.
 */
export function generateMetadataForPath(path) {
  // Default base metadata
  const baseTitle = "Capture Crew";
  const baseDescription = "Capture Crew is the official photography club of CGEC. Explore our gallery, college events, and the stories behind the lens.";
  const defaultImage = "https://capturecrew.site/logo.jpg"; // Replace with actual absolute URL if possible, or relative to be resolved later

  // Remove trailing slash and split path
  const cleanPath = path.replace(/\/$/, "");
  const segments = cleanPath.split("/").filter(Boolean);

  let title = baseTitle;
  let description = baseDescription;
  let image = defaultImage;
  let ogType = "website";

  if (segments.length === 0) {
    // Home page
    title = `Home | ${baseTitle}`;
  } else if (segments[0] === "events") {
    if (segments.length > 1) {
      // e.g., /events/esperanza-fest
      const eventName = formatSlug(decodeURIComponent(segments[1]));
      title = `${eventName} | ${baseTitle}`;
      description = `Check out the gallery and moments from ${eventName} captured by ${baseTitle}.`;
      ogType = "article";
    } else {
      title = `Events | ${baseTitle}`;
      description = `Explore college events and milestones immortalized through our lenses.`;
    }
  } else if (segments[0] === "gallery") {
    if (segments.length > 1) {
      // e.g., /gallery/annual-fest-2026
      const galleryName = formatSlug(decodeURIComponent(segments[1]));
      title = `${galleryName} Gallery | ${baseTitle}`;
      description = `View the curated captures from the ${galleryName} gallery by ${baseTitle}.`;
    } else {
      title = `Gallery | ${baseTitle}`;
      description = `Curated captures from our photographers.`;
    }
  } else if (segments[0] === "team") {
    if (segments.length > 1) {
      // e.g., /team/john-doe
      const memberName = formatSlug(decodeURIComponent(segments[1]));
      title = `${memberName} | ${baseTitle} Team`;
      description = `Meet ${memberName}, a valued member of the ${baseTitle} team.`;
      ogType = "profile";
    } else {
      title = `Team | ${baseTitle}`;
      description = `Meet the dedicated photographers, editors, and organizers behind ${baseTitle}.`;
    }
  } else {
    // Fallback for other pages like /about, /join, /contact
    const pageName = formatSlug(segments[0]);
    title = `${pageName} | ${baseTitle}`;
  }

  return {
    title,
    description,
    image,
    urlPath: cleanPath || "/",
    ogType,
  };
}
