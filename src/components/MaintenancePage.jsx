import React, { useEffect } from 'react';

const DEFAULT_MAINTENANCE_TEXT = `# Official Notice

### Capture Crew & Other Student Clubs Temporarily Inactive

Due to ongoing administrative circumstances, the existing Student Body and student representative committee of Cooch Behar Government Engineering College has been dissolved.

As a result, all student-managed cultural and technical clubs, including Capture Crew, are currently inactive and will not be organizing events, activities, or official programs until further notice.

This website has been placed in maintenance mode during this period.

We appreciate your patience and understanding.

For official updates, please follow college notifications and announcements.

— CGEC Student Body`;

export default function MaintenancePage({ config, siteConfig }) {
  useEffect(() => {
    // Add noindex meta tag dynamically
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.name = "robots";
      document.head.appendChild(metaRobots);
    }
    metaRobots.content = "noindex, nofollow";

    document.title = "Maintenance | " + (siteConfig?.siteName || "Capture Crew");

    return () => {
      // Cleanup when unmounting (e.g. admin logs in)
      if (metaRobots) {
        metaRobots.content = "index, follow"; // Restore default
      }
    };
  }, [siteConfig]);

  const rawMessage = config?.message || DEFAULT_MAINTENANCE_TEXT;

  // Extremely basic markdown-to-HTML parser for the specific formatting
  const parseMarkdown = (text) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('### ')) {
        return <h3 key={index} style={{ color: 'var(--gold)', margin: '1.5rem 0 1rem 0' }}>{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('# ')) {
        return <h1 key={index} style={{ color: 'var(--white)', margin: '0 0 1.5rem 0', fontSize: '2.5rem' }}>{line.replace('# ', '')}</h1>;
      }
      if (line.trim() === '') {
        return <br key={index} />;
      }
      return <p key={index} style={{ marginBottom: '1rem', lineHeight: '1.6', fontSize: '1.1rem', opacity: 0.9 }}>{line}</p>;
    });
  };

  return (
    <div className="maintenance-wrapper" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'var(--surface)',
      backgroundImage: 'linear-gradient(rgba(10, 14, 26, 0.9), rgba(10, 14, 26, 0.95)), url("https://capturecrew.site/covers/image.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      color: 'var(--white)',
      padding: '2rem',
      textAlign: 'center',
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 9999,
      overflowY: 'auto'
    }}>
      <div className="maintenance-content" style={{
        maxWidth: '800px',
        width: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(10px)',
        border: '1px solid var(--gold)',
        borderRadius: '12px',
        padding: '3rem 2rem',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
      }}>
        <img 
          src={siteConfig?.logoUrl || "/logo.jpg"} 
          alt="Capture Crew Logo" 
          style={{ width: '120px', height: '120px', borderRadius: '50%', marginBottom: '2rem', border: '3px solid var(--gold)', padding: '5px' }} 
        />
        
        {config?.title && config.title !== "Official Notice" && (
          <h1 style={{ color: 'var(--gold)', marginBottom: '1.5rem' }}>{config.title}</h1>
        )}

        <div className="maintenance-message" style={{ textAlign: 'left', margin: '0 auto', maxWidth: '650px' }}>
          {parseMarkdown(rawMessage)}
        </div>

        {config?.expectedReturnDate && (
          <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'rgba(201, 169, 110, 0.1)', borderRadius: '8px', display: 'inline-block' }}>
            <span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>Expected Return:</span> {new Date(config.expectedReturnDate).toLocaleDateString()}
          </div>
        )}

        <div className="maintenance-footer" style={{ marginTop: '3rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
          <p style={{ opacity: 0.7, fontSize: '0.9rem', marginBottom: '1rem' }}>Contact us at <a href={`mailto:${siteConfig?.emailSenderAddress || "admin@capturecrew.site"}`} style={{ color: 'var(--gold)', textDecoration: 'none' }}>{siteConfig?.emailSenderAddress || "admin@capturecrew.site"}</a></p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            {siteConfig?.instaLink && <a href={siteConfig.instaLink} target="_blank" rel="noreferrer" style={{ color: 'var(--white)', opacity: 0.8, textDecoration: 'none' }}>Instagram</a>}
            {siteConfig?.waLink && <a href={siteConfig.waLink} target="_blank" rel="noreferrer" style={{ color: 'var(--white)', opacity: 0.8, textDecoration: 'none' }}>WhatsApp</a>}
            {siteConfig?.fbLink && <a href={siteConfig.fbLink} target="_blank" rel="noreferrer" style={{ color: 'var(--white)', opacity: 0.8, textDecoration: 'none' }}>Facebook</a>}
          </div>
        </div>
      </div>
    </div>
  );
}
