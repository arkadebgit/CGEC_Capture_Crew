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
export async function generateMetadataForPath(path) {
  // Default base metadata
  const baseTitle = "Capture Crew";
  const baseDescription = "Capture Crew is the official photography club of CGEC. Explore our gallery, college events, and the stories behind the lens.";
  const defaultImage = "https://capturecrew.site/logo.jpg";

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
      // Dynamic Event Page
      const decodedParam = decodeURIComponent(segments[1]);
      
      // Try to fetch event from Firestore to get custom image and description
      try {
        const res = await fetch('https://firestore.googleapis.com/v1/projects/capture-crew-web/databases/(default)/documents/events');
        if (res.ok) {
          const data = await res.json();
          const events = data.documents || [];
          
          let matchedEvent = null;
          for (const doc of events) {
            const fields = doc.fields || {};
            const eventId = fields.id?.stringValue || "";
            const eventName = fields.name?.stringValue || "";
            
            if (eventId === decodedParam || eventName === decodedParam) {
              matchedEvent = fields;
              break;
            }
          }

          if (matchedEvent) {
            title = `${matchedEvent.name?.stringValue || formatSlug(decodedParam)} | ${baseTitle}`;
            description = matchedEvent.desc?.stringValue || matchedEvent.highlight?.stringValue || `Check out the gallery and moments from ${title} captured by ${baseTitle}.`;
            if (matchedEvent.iconUrl?.stringValue) {
              image = matchedEvent.iconUrl.stringValue;
            }
          } else {
            // Fallback if not found in Firestore
            const eventName = formatSlug(decodedParam);
            title = `${eventName} | ${baseTitle}`;
            description = `Check out the gallery and moments from ${eventName} captured by ${baseTitle}.`;
          }
        }
      } catch (err) {
        console.error("Failed to fetch events from Firestore for metadata:", err);
        const eventName = formatSlug(decodedParam);
        title = `${eventName} | ${baseTitle}`;
      }
      ogType = "article";
    } else {
      title = `Events | ${baseTitle}`;
      description = `Explore college events and milestones immortalized through our lenses.`;
    }
  } else if (segments[0] === "gallery") {
    if (segments.length > 1) {
      const galleryName = formatSlug(decodeURIComponent(segments[1]));
      title = `${galleryName} Gallery | ${baseTitle}`;
      description = `View the curated captures from the ${galleryName} gallery by ${baseTitle}.`;
    } else {
      title = `Gallery | ${baseTitle}`;
      description = `Curated captures from our photographers.`;
    }
  } else if (segments[0] === "team") {
    if (segments.length > 1) {
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
