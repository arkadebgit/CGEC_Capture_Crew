import React, { useState, useEffect, useRef } from "react";

/**
 * BlurUpImage component replaces standard img elements to provide:
 * 1. Intersection Observer based lazy loading.
 * 2. Cloudinary Blur-Up technique: w_100,q_10,e_blur:800 thumbnail and f_auto,q_auto optimized full image.
 * 3. Animated shimmering skeleton placeholder.
 * 4. Prevention of layout shifts by reserving aspect ratio space dynamically.
 * 5. Smooth fade-in & scale transitions.
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
  const [isInView, setIsInView] = useState(false);
  const [thumbLoaded, setThumbLoaded] = useState(false);
  const [fullLoaded, setFullLoaded] = useState(false);
  const [measuredAspect, setMeasuredAspect] = useState(null);

  const containerRef = useRef(null);

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
      thumbUrl: `${prefix}/w_100,q_10,e_blur:800${suffix}`,
      fullUrl: `${prefix}/f_auto,q_auto${suffix}`,
    };
  };

  const { thumbUrl, fullUrl } = getCloudinaryUrls(src);

  useEffect(() => {
    // Setup intersection observer to only load when approaching viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "200px 0px 200px 0px", // Load slightly ahead of scroll for seamless feel
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // Determine aspect ratio for reserving space (default to 1.5 if not known)
  const currentAspect = aspectRatio || measuredAspect || 1.5;

  const isFixedGalleryThumb = className.includes("gallery-thumb");
  const isWeekOrMonthImg = className.includes("week-img") || className.includes("month-img");

  const containerStyle = {
    ...style,
  };

  // Only apply inline aspectRatio if this isn't a fixed aspect/height grid item
  if (!isFixedGalleryThumb && !isWeekOrMonthImg) {
    containerStyle.aspectRatio = currentAspect;
  }

  // Handle low-quality image loading to measure its natural aspect ratio
  const handleThumbLoad = (e) => {
    setThumbLoaded(true);
    if (!aspectRatio && e.target.naturalWidth && e.target.naturalHeight) {
      setMeasuredAspect(e.target.naturalWidth / e.target.naturalHeight);
    }
  };

  const handleFullLoad = () => {
    setFullLoaded(true);
  };

  return (
    <div
      ref={containerRef}
      className={`blur-up-container ${className}`}
      style={containerStyle}
      onClick={onClick}
      {...props}
    >
      {/* 1. Shimmer Skeleton Placeholder */}
      {!fullLoaded && <div className="skeleton-placeholder" />}

      {/* 2. Low-Quality Blurred Thumbnail (Cloudinary specific) */}
      {isInView && thumbUrl && (
        <img
          src={thumbUrl}
          alt=""
          className={`blur-up-thumb ${thumbLoaded ? "loaded" : ""} ${fullLoaded ? "hidden" : ""}`}
          onLoad={handleThumbLoad}
          referrerPolicy="no-referrer"
        />
      )}

      {/* 3. Full-Resolution Image (or fallback for non-Cloudinary images) */}
      {isInView && (
        <img
          src={fullUrl}
          alt={alt}
          className={`blur-up-full ${fullLoaded ? "loaded" : ""}`}
          onLoad={handleFullLoad}
          referrerPolicy="no-referrer"
        />
      )}
    </div>
  );
}
