import React, { useState } from "react";

/**
 * SmoothImage component replaces standard img elements to provide:
 * 1. Native lazy loading.
 * 2. Cloudinary f_auto,q_auto optimized full image.
 * 3. Prevention of layout shifts by reserving aspect ratio space statically.
 * 4. Smooth fade-in & scale transitions.
 */
export default function BlurUpImage({
  src,
  alt,
  className = "",
  onClick,
  aspectRatio,
  style = {},
  ...props
}) {
  const [fullLoaded, setFullLoaded] = useState(false);

  // Parse Cloudinary URLs to inject transformations
  const getOptimizedUrl = (url) => {
    if (!url || typeof url !== "string" || !url.includes("res.cloudinary.com")) {
      return url;
    }
    const uploadIndex = url.indexOf("/upload");
    if (uploadIndex === -1) {
      return url;
    }
    const prefix = url.substring(0, uploadIndex + 7);
    const suffix = url.substring(uploadIndex + 7);
    return `${prefix}/f_auto,q_auto${suffix}`;
  };

  const optimizedUrl = getOptimizedUrl(src);

  // Use the provided aspectRatio or a default to prevent layout shift before image loads
  const currentAspect = aspectRatio || 1.5;

  const containerStyle = {
    ...style,
    aspectRatio: currentAspect,
  };

  return (
    <div
      className={`blur-up-container ${className}`}
      style={containerStyle}
      onClick={onClick}
      {...props}
    >
      <img
        src={optimizedUrl}
        alt={alt}
        loading="lazy"
        className={`blur-up-full ${fullLoaded ? "loaded" : ""}`}
        onLoad={() => setFullLoaded(true)}
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
