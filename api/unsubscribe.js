import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle GET requests (redirect to frontend unsubscribe page)
  if (req.method === 'GET') {
    const urlParams = new URL(req.url, 'http://localhost');
    const email = urlParams.searchParams.get('email') || '';
    
    // Redirect to the frontend unsubscribe route
    res.writeHead(302, {
      Location: `https://www.capturecrew.site/unsubscribe?email=${encodeURIComponent(email)}`
    });
    res.end();
    return;
  }

  // Handle POST requests (one-click unsubscribe compliant with RFC 8058)
  if (req.method === 'POST') {
    const urlParams = new URL(req.url, 'http://localhost');
    let email = urlParams.searchParams.get('email') || '';

    // If body contains parameters, parse it
    if (!email && req.body) {
      if (typeof req.body === 'string') {
        try {
          const bodyData = JSON.parse(req.body);
          email = bodyData.email;
        } catch (e) {
          // Check query parameters fallback
        }
      } else {
        email = req.body.email;
      }
    }

    if (!email) {
      return res.status(400).json({ error: 'Missing email address parameter.' });
    }

    const emailLower = email.trim().toLowerCase();

    try {
      const q = query(collection(db, "subscribers"), where("email", "==", emailLower));
      const querySnap = await getDocs(q);

      if (querySnap.empty) {
        return res.status(404).json({ error: 'Subscriber not found.' });
      }

      // Mark all matched subscriber records as inactive
      const batchPromises = querySnap.docs.map(document => {
        const docRef = doc(db, "subscribers", document.id);
        return updateDoc(docRef, { 
          active: false, 
          unsubscribedAt: new Date().toISOString() 
        });
      });

      await Promise.all(batchPromises);

      return res.status(200).json({ message: 'Successfully unsubscribed from Capture Crew updates.' });
    } catch (err) {
      return res.status(500).json({ error: err.message || 'Database error occurred during unsubscription.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
