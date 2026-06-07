import React, { useState } from "react";

/**
 * SmoothImage component replaces standard img elements to provide:
 * 1. Native lazy loading.
 * 2. Cloudinary f_auto,q_auto optimized full image.
 * 3. Prevention of layout shifts using an invisible micro-thumbnail spacer.
 * 4. Smooth fade-in & scale transitions.
 * 5. Native original aspect ratio without forced cropping.
 */
export default function BlurUpImage({
  src,
  alt,
  className = "",
  onClick,
  aspectRatio, // Can be used as a fallback
  style = {},
  ...props
}) {
  const [fullLoaded, setFullLoaded] = useState(false);

  // Parse Cloudinary URLs to inject transformations
  const getCloudinaryUrls = (url) => {
    if (!url || typeof url !== "string" || !url.includes("res.cloudinary.com")) {
      return { thumbUrl: null, fullUrl: url };
    }
    const uploadIndex = url.indexOf("/upload");
    if (uploadIndex === -1) {
      return { thumbUrl: null, fullUrl: url };
    }
    const prefix = url.substring(0, uploadIndex + 7);
    const suffix = url.substring(uploadIndex + 7);
    return {
      // Fetch a tiny 10px image (extremely fast, ~1KB) to establish the layout space instantly
      thumbUrl: `${prefix}/w_10,q_10${suffix}`,
      fullUrl: `${prefix}/f_auto,q_auto${suffix}`,
    };
  };

  const { thumbUrl, fullUrl } = getCloudinaryUrls(src);

  // Use spacer trick if it's a Cloudinary URL to get the perfect original ratio instantly.
  const useSpacer = !!thumbUrl;

  const containerStyle = {
    ...style,
    // Only apply hardcoded aspect ratio if we can't use the native spacer trick
    ...(!useSpacer && aspectRatio ? { aspectRatio } : {})
  };

  return (
    <div
      className={`blur-up-container ${className}`}
      style={containerStyle}
      onClick={onClick}
      {...props}
    >
      {useSpacer && (
        <img
          src={thumbUrl}
          alt=""
          style={{ width: "100%", height: "auto", display: "block", visibility: "hidden" }}
          aria-hidden="true"
        />
      )}
      <img
        src={fullUrl}
        alt={alt}
        loading="lazy"
        className={`blur-up-full ${fullLoaded ? "loaded" : ""}`}
        onLoad={() => setFullLoaded(true)}
        referrerPolicy="no-referrer"
        style={useSpacer ? { position: "absolute", top: 0, left: 0 } : {}}
      />
    </div>
  );
}
