import React, { useState, useEffect } from 'react';
import MaintenancePage from './MaintenancePage';

const DEFAULT_MAINTENANCE_TEXT = `# Official Notice

### Capture Crew & Other Student Clubs Temporarily Inactive

Due to ongoing administrative circumstances, the existing Student Body and student representative committee of Cooch Behar Government Engineering College has been dissolved.

As a result, all student-managed cultural and technical clubs, including Capture Crew, are currently inactive and will not be organizing events, activities, or official programs until further notice.

This website has been placed in maintenance mode during this period.

We appreciate your patience and understanding.

For official updates, please follow college notifications and announcements.

— CGEC Student Body`;

export default function AdminMaintenance({ config, onSave, user, siteConfig }) {
  const [formData, setFormData] = useState({
    enabled: false,
    title: "Official Notice",
    message: DEFAULT_MAINTENANCE_TEXT,
    expectedReturnDate: ""
  });
  
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (config) {
      setFormData({
        enabled: !!config.enabled,
        title: config.title || "Official Notice",
        message: config.message || DEFAULT_MAINTENANCE_TEXT,
        expectedReturnDate: config.expectedReturnDate || ""
      });
    }
  }, [config]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        ...formData,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.email || "Unknown Admin"
      });
      alert("Maintenance settings saved successfully.");
    } catch (err) {
      alert("Failed to save settings: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isPreview) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 100000 }}>
        <MaintenancePage config={formData} siteConfig={siteConfig} />
        <button 
          onClick={() => setIsPreview(false)}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            padding: '10px 20px',
            backgroundColor: 'var(--gold)',
            color: '#000',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold',
            zIndex: 100001
          }}
        >
          Exit Preview
        </button>
      </div>
    );
  }

  return (
    <div className="visible" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h3 className="subcategory-title" style={{ margin: 0 }}>Global <em>Maintenance Mode</em></h3>
        <div style={{ 
          padding: '0.5rem 1rem', 
          borderRadius: '50px', 
          backgroundColor: formData.enabled ? 'rgba(220, 20, 60, 0.2)' : 'rgba(80, 200, 120, 0.2)',
          color: formData.enabled ? '#DC143C' : '#50C878',
          border: `1px solid ${formData.enabled ? '#DC143C' : '#50C878'}`,
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: formData.enabled ? '#DC143C' : '#50C878' }}></div>
          Status: {formData.enabled ? "MAINTENANCE ACTIVE" : "ONLINE"}
        </div>
      </div>

      <div className="admin-card" style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
          <div>
            <h4 style={{ margin: 0, color: 'var(--white)' }}>Current Status</h4>
            <p style={{ margin: '5px 0 0 0', opacity: 0.6, fontSize: '0.9rem' }}>
              {config?.updatedAt ? `Last updated: ${new Date(config.updatedAt).toLocaleString()}` : "Never updated"}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ opacity: 0.6, fontSize: '0.9rem' }}>Modified by</span>
            <div style={{ color: 'var(--gold)' }}>{config?.updatedBy || "N/A"}</div>
          </div>
        </div>

        <div className="feedback-form" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
              <input 
                type="checkbox" 
                checked={formData.enabled} 
                onChange={(e) => setFormData({...formData, enabled: e.target.checked})} 
                style={{ width: '20px', height: '20px', accentColor: 'var(--gold)' }}
              />
              <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Enable Maintenance Mode</span>
            </label>
            <p style={{ margin: 0, opacity: 0.7, fontSize: '0.85rem', flex: 2 }}>
              When enabled, all visitors will be redirected to the Maintenance Page. Admins will still have full access.
            </p>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--gold)' }}>Page Title</label>
            <input 
              className="form-input" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              placeholder="e.g. Official Notice"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--gold)' }}>Maintenance Message (Supports basic Markdown: # Header, ### Subheader)</label>
            <textarea 
              className="form-input" 
              value={formData.message} 
              onChange={e => setFormData({...formData, message: e.target.value})} 
              rows={12}
              style={{ width: '100%', resize: 'vertical', fontFamily: 'monospace' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--gold)' }}>Expected Return Date (Optional)</label>
            <input 
              type="date"
              className="form-input" 
              value={formData.expectedReturnDate} 
              onChange={e => setFormData({...formData, expectedReturnDate: e.target.value})} 
              style={{ width: '100%', maxWidth: '300px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button 
              className="form-submit" 
              onClick={handleSave}
              disabled={isSaving}
              style={{ flex: 2 }}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
            <button 
              className="form-submit" 
              onClick={() => setIsPreview(true)}
              style={{ flex: 1, backgroundColor: 'transparent', border: '1px solid var(--gold)', color: 'var(--gold)' }}
            >
              Preview Page
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
