import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';

export const getUpgradedYear = (yr) => {
  if (!yr || typeof yr !== 'string') return yr;
  const clean = yr.trim().toLowerCase();
  if (clean.includes('1st')) return '2nd Year';
  if (clean.includes('2nd')) return '3rd Year';
  if (clean.includes('3rd')) return '4th Year';
  if (clean.includes('4th')) return 'Passout';
  return yr; // Return as-is if Passout, Alumni, or unmapped
};

export default function AdminSessionUpgrade({ db }) {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [successResult, setSuccessResult] = useState(null);

  const fetchAndCalculateStats = async () => {
    setLoading(true);
    setSuccessResult(null);
    try {
      const collectionsToScan = [
        { name: 'team_members', label: 'Team Members' },
        { name: 'members', label: 'Contributors' },
        { name: 'gallery', label: 'Gallery Captures (Home & Gallery)' },
        { name: 'admins', label: 'Admin Accounts' },
        { name: 'cc_events', label: 'Event Winners' }
      ];

      let firstYearCount = 0;
      let secondYearCount = 0;
      let thirdYearCount = 0;
      let fourthYearCount = 0;
      let passoutCount = 0;
      let totalUpdatesToPerform = 0;
      let totalDocsScanned = 0;

      const updateTasks = [];

      for (const colDef of collectionsToScan) {
        const snap = await getDocs(collection(db, colDef.name));
        snap.forEach((d) => {
          totalDocsScanned++;
          const data = d.data();
          const docRef = doc(db, colDef.name, d.id);

          if (colDef.name === 'cc_events') {
            // Handle event winners structure: winners: { "1st": { year: ... }, "2nd": { year: ... }, "3rd": { year: ... } }
            if (data.winners && typeof data.winners === 'object') {
              let winnersChanged = false;
              const updatedWinners = { ...data.winners };

              ['1st', '2nd', '3rd'].forEach((rank) => {
                if (updatedWinners[rank] && updatedWinners[rank].year) {
                  const currentYr = updatedWinners[rank].year;
                  const newYr = getUpgradedYear(currentYr);
                  if (currentYr !== newYr) {
                    winnersChanged = true;
                    updatedWinners[rank] = { ...updatedWinners[rank], year: newYr };

                    const clean = currentYr.trim().toLowerCase();
                    if (clean.includes('1st')) firstYearCount++;
                    else if (clean.includes('2nd')) secondYearCount++;
                    else if (clean.includes('3rd')) thirdYearCount++;
                    else if (clean.includes('4th')) fourthYearCount++;
                  } else {
                    passoutCount++;
                  }
                }
              });

              if (winnersChanged) {
                totalUpdatesToPerform++;
                updateTasks.push({ ref: docRef, data: { winners: updatedWinners } });
              }
            }
          } else {
            // Document has direct `year` property
            if (data.year && typeof data.year === 'string') {
              const currentYr = data.year;
              const newYr = getUpgradedYear(currentYr);
              const clean = currentYr.trim().toLowerCase();

              if (clean.includes('1st')) firstYearCount++;
              else if (clean.includes('2nd')) secondYearCount++;
              else if (clean.includes('3rd')) thirdYearCount++;
              else if (clean.includes('4th')) fourthYearCount++;
              else passoutCount++;

              if (currentYr !== newYr) {
                totalUpdatesToPerform++;
                updateTasks.push({ ref: docRef, data: { year: newYr } });
              }
            }
          }
        });
      }

      setStats({
        firstYearCount,
        secondYearCount,
        thirdYearCount,
        fourthYearCount,
        passoutCount,
        totalUpdatesToPerform,
        totalDocsScanned,
        updateTasks
      });
    } catch (err) {
      console.error("Error calculating session upgrade stats:", err);
      alert("Failed to analyze session upgrade data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndCalculateStats();
  }, [db]);

  const executeSessionUpgrade = async () => {
    if (!stats || !stats.updateTasks || stats.updateTasks.length === 0) {
      alert("No student year updates to perform.");
      setShowConfirmModal(false);
      return;
    }

    setUpgrading(true);
    const tasks = stats.updateTasks;
    const chunkSize = 400;
    const totalBatches = Math.ceil(tasks.length / chunkSize);
    let completedUpdates = 0;

    try {
      for (let i = 0; i < tasks.length; i += chunkSize) {
        const batchNum = Math.floor(i / chunkSize) + 1;
        setProgressMsg(`Processing Batch ${batchNum} of ${totalBatches}...`);

        const chunk = tasks.slice(i, i + chunkSize);
        const batch = writeBatch(db);

        chunk.forEach(task => {
          batch.update(task.ref, task.data);
        });

        await batch.commit();
        completedUpdates += chunk.length;
      }

      setSuccessResult({
        updatedDocsCount: completedUpdates,
        timestamp: new Date().toLocaleTimeString()
      });

      setShowConfirmModal(false);
      await fetchAndCalculateStats();
    } catch (err) {
      console.error("Session upgrade execution failed:", err);
      alert("Error upgrading session: " + err.message);
    } finally {
      setUpgrading(false);
      setProgressMsg("");
    }
  };

  return (
    <div className="session-upgrade-card glass-form" style={{ padding: '2rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ color: 'var(--gold)', fontSize: '1.4rem', margin: '0 0 0.5rem 0' }}>🎓 Academic Session Upgrade</h3>
          <p style={{ fontSize: '0.85rem', opacity: 0.8, margin: 0, maxWidth: '600px' }}>
            Promote student academic years across the entire website in one click. Upgrades <strong>1st Year → 2nd Year</strong>, <strong>2nd Year → 3rd Year</strong>, <strong>3rd Year → 4th Year</strong>, and <strong>4th Year → Passout</strong> across Team Members, Contributors, Admin Records, and Gallery Captures (Home & Gallery sections).
          </p>
        </div>

        <button
          type="button"
          className="admin-nav-btn"
          onClick={fetchAndCalculateStats}
          disabled={loading || upgrading}
          style={{ padding: '0.6rem 1.2rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          🔄 {loading ? "Scanning..." : "Refresh Breakdown"}
        </button>
      </div>

      {successResult && (
        <div style={{ background: 'rgba(76, 175, 80, 0.15)', border: '1px solid #4CAF50', color: '#81C784', padding: '1rem 1.5rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          <strong>✅ Academic Session Upgrade Complete!</strong> Updated <strong>{successResult.updatedDocsCount}</strong> student records at {successResult.timestamp}. Changes are synced live across the Home & Gallery pages.
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', opacity: 0.7 }}>
          <div className="broadcast-spinner" style={{ margin: '0 auto 1rem auto', width: '30px', height: '30px' }}></div>
          <p style={{ fontSize: '0.9rem' }}>Scanning database records across all collections...</p>
        </div>
      ) : stats ? (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="stat-card-box">
              <span className="stat-card-label">1st Year → 2nd Year</span>
              <span className="stat-card-value">{stats.firstYearCount}</span>
            </div>

            <div className="stat-card-box">
              <span className="stat-card-label">2nd Year → 3rd Year</span>
              <span className="stat-card-value">{stats.secondYearCount}</span>
            </div>

            <div className="stat-card-box">
              <span className="stat-card-label">3rd Year → 4th Year</span>
              <span className="stat-card-value">{stats.thirdYearCount}</span>
            </div>

            <div className="stat-card-box">
              <span className="stat-card-label">4th Year → Passout</span>
              <span className="stat-card-value">{stats.fourthYearCount}</span>
            </div>

            <div className="stat-card-box" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.1)' }}>
              <span className="stat-card-label">Passout / Unchanged</span>
              <span className="stat-card-value" style={{ color: 'var(--white)' }}>{stats.passoutCount}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(201,169,110,0.08)', padding: '1.2rem 1.5rem', borderRadius: '12px', border: '1px solid rgba(201,169,110,0.2)', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.9rem', color: 'var(--gold)', fontWeight: 'bold' }}>
                Pending Updates: {stats.totalUpdatesToPerform} Documents
              </span>
              <span style={{ fontSize: '0.8rem', opacity: 0.7, marginLeft: '0.8rem' }}>
                (Out of {stats.totalDocsScanned} total database records scanned)
              </span>
            </div>

            <button
              type="button"
              className="form-submit"
              disabled={stats.totalUpdatesToPerform === 0 || upgrading}
              onClick={() => setShowConfirmModal(true)}
              style={{
                padding: '0.7rem 1.8rem',
                fontSize: '0.9rem',
                backgroundColor: stats.totalUpdatesToPerform > 0 ? 'var(--gold)' : 'gray',
                color: 'var(--ink)',
                fontWeight: 'bold',
                cursor: stats.totalUpdatesToPerform > 0 ? 'pointer' : 'not-allowed'
              }}
            >
              🚀 Upgrade Academic Session
            </button>
          </div>
        </div>
      ) : null}

      {/* CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="lightbox open" style={{ color: '#fff', background: 'rgba(0,0,0,0.85)', zIndex: 3000 }}>
          <div className="lightbox-content admin-modal" style={{ maxWidth: '550px', background: 'var(--ink)', border: '1px solid var(--gold)', borderRadius: '20px', padding: '2.5rem' }}>
            <button className="lightbox-close" onClick={() => !upgrading && setShowConfirmModal(false)}>✕</button>
            <div className="section-label" style={{ color: 'var(--gold)' }}>Batch Session Progression</div>
            <h2 className="section-title" style={{ fontSize: '1.8rem', margin: '0.5rem 0 1.5rem 0', color: '#fff' }}>
              Confirm Academic Upgrade
            </h2>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.2rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.88rem', lineHeight: '1.6' }}>
              <p style={{ margin: '0 0 0.8rem 0' }}>
                Are you sure you want to promote all student academic years?
              </p>
              <ul style={{ paddingLeft: '1.2rem', margin: 0, opacity: 0.9 }}>
                <li><strong>{stats?.firstYearCount || 0}</strong> members: 1st Year → 2nd Year</li>
                <li><strong>{stats?.secondYearCount || 0}</strong> members: 2nd Year → 3rd Year</li>
                <li><strong>{stats?.thirdYearCount || 0}</strong> members: 3rd Year → 4th Year</li>
                <li><strong>{stats?.fourthYearCount || 0}</strong> members: 4th Year → Passout</li>
              </ul>
              <p style={{ margin: '1rem 0 0 0', opacity: 0.7, fontSize: '0.8rem', color: 'var(--gold)' }}>
                ℹ️ This will immediately sync and update featured captures on the Home section, Gallery, Team, and Member lists across the entire site.
              </p>
            </div>

            {upgrading && (
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div className="broadcast-spinner" style={{ margin: '0 auto 0.8rem auto' }}></div>
                <p style={{ fontSize: '0.85rem', color: 'var(--gold)' }}>{progressMsg}</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="admin-nav-btn"
                disabled={upgrading}
                onClick={() => setShowConfirmModal(false)}
                style={{ padding: '0.7rem 1.5rem', opacity: 0.7 }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="form-submit"
                disabled={upgrading}
                onClick={executeSessionUpgrade}
                style={{ padding: '0.7rem 1.8rem', backgroundColor: 'var(--gold)', color: 'var(--ink)' }}
              >
                {upgrading ? "Upgrading..." : "Confirm & Run Upgrade"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
