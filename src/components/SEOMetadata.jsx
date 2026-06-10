import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Formats a URL slug into a readable title.
 */
function formatSlug(slug) {
  if (!slug) return "";
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Client-side SEO Metadata updater
 * Automatically updates document.title and meta tags when navigating in the SPA.
 */
export default function SEOMetadata() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname.replace(/\/$/, "");
    const segments = path.split("/").filter(Boolean);

    const baseTitle = "Capture Crew";
    const baseDescription = "Capture Crew is the official photography club of CGEC. Explore our gallery, college events, and the stories behind the lens.";
    const defaultImage = "https://capturecrew.site/logo.jpg";

    let title = baseTitle;
    let description = baseDescription;
    let image = defaultImage;

    if (segments.length === 0) {
      title = `Home | ${baseTitle}`;
    } else if (segments[0] === "events") {
      if (segments.length > 1) {
        const eventName = formatSlug(decodeURIComponent(segments[1]));
        title = `${eventName} | ${baseTitle}`;
        description = `Check out the gallery and moments from ${eventName} captured by ${baseTitle}.`;
      } else {
        title = `Events | ${baseTitle}`;
      }
    } else if (segments[0] === "gallery") {
      if (segments.length > 1) {
        const galleryName = formatSlug(decodeURIComponent(segments[1]));
        title = `${galleryName} Gallery | ${baseTitle}`;
      } else {
        title = `Gallery | ${baseTitle}`;
      }
    } else if (segments[0] === "team") {
      if (segments.length > 1) {
        const memberName = formatSlug(decodeURIComponent(segments[1]));
        title = `${memberName} | ${baseTitle} Team`;
      } else {
        title = `Team | ${baseTitle}`;
      }
    } else {
      const pageName = formatSlug(segments[0]);
      title = `${pageName} | ${baseTitle}`;
    }

    // Update document title
    document.title = title;

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", description);
    }

    // Update OG tags
    const setMetaProperty = (property, content) => {
      let element = document.querySelector(`meta[property="${property}"]`);
      if (element) {
        element.setAttribute("content", content);
      }
    };

    setMetaProperty("og:title", title);
    setMetaProperty("og:description", description);
    setMetaProperty("og:url", window.location.href);

    // Update Twitter tags
    const setMetaName = (name, content) => {
      let element = document.querySelector(`meta[name="${name}"]`);
      if (element) {
        element.setAttribute("content", content);
      }
    };

    setMetaName("twitter:title", title);
    setMetaName("twitter:description", description);
    
    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute("href", window.location.href);
    }

  }, [location.pathname]);

  return null; // This component doesn't render anything
}
