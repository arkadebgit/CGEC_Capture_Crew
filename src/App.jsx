import { useState, useEffect, useRef } from "react";
import { db, auth } from "./firebase";
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc, getDoc, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import placeholderImg from "./assets/placeholder.png";

// ─── PLACEHOLDER DATA ───────────────────────────────────────────────────────

const TEAM_DATA = {
  founders: [
    { name: "Rishad Hoque", role: "Founder", dept: "Batch '24 Passout, CE", img: "/team/Rishad.png", insta: "https://www.instagram.com/rishad_hoque/" },
    { name: "Arman Mia", role: "Founder", dept: "4th Yr. CSE", img: "/team/Arman.png", insta: "https://www.instagram.com/arman_ansari.13/" },
  ],
  incharge: [
    { name: "Jyotirmoy Mondal", role: "Incharge", dept: "3rd Yr. EE", img: "/team/Jyotirmoy.png", insta: "https://www.instagram.com/flybyfifteen/" },
    { name: "Saikat Saha", role: "Incharge", dept: "3rd Yr. CE", img: "/team/Saikat.png", insta: "https://www.instagram.com/_riz_saha_/" },
  ],
  coordinators: [
    { name: "Samprada Adhikari", role: "Co-Ordinator", dept: "2nd Yr. ME", img: "/team/Samprada.png" },
    { name: "Nirupam Konar", role: "Co-Ordinator", dept: "2nd Yr. ECE", img: "/team/Nirupam konar.png", insta: "https://www.instagram.com/itsnirupam07_/" },
  ],
  core: [
    { name: "Indrakshi Ghosh", role: "Moderator", dept: "1st Yr. CE", img: "/team/Indrakshi.png", insta: "https://www.instagram.com/indrakshi.______/" },
    { name: "Nabanita Barman", role: "Photography Lead", dept: "1st Yr. CE", img: "/team/Nabanita.png", insta: "https://www.instagram.com/nabonitaaaaaaa/" },
    { name: "Shreejan Roy", role: "Photographer & Editor", dept: "1st Yr. EE", img: "/team/Shreejan.png", insta: "https://www.instagram.com/snapbyjaan/" },
    { name: "Arkadeb Thokdar", role: "Photographer & Editor", dept: "1st Yr. ME", img: "/team/Arkadeb.png", insta: "https://www.instagram.com/destructive_antagonist/" },
    { name: "MD Kaif", role: "Photographer", dept: "1st Yr. ECE", img: "/team/MD Kaif.png", insta: "https://www.instagram.com/k4if_28/" },
    { name: "Akash Ghara", role: "Photo Editor", dept: "1st Yr. ME", img: "/team/Akash.png", insta: "https://www.instagram.com/akash_ghara_/" },
    { name: "Ramanath Hansda", role: "Videography Lead", dept: "1st Yr. CSE", img: "/team/Ramanath.png", insta: "https://www.instagram.com/_jubatus._09/" },
    { name: "Irfan Ahmed", role: "Videographer", dept: "3rd Yr. CE", img: "/team/Irfan.png", insta: "https://www.instagram.com/irfan.a.verse/" },
    { name: "Biswajyoti Deb", role: "Videographer & PR", dept: "1st Yr. CSE", img: "/team/Biswajyoti.png", insta: "https://www.instagram.com/kami.oni_/" },
    { name: "Priyanshu Mondal", role: "Videographer", dept: "1st Yr. ME", img: "/team/Priyanshu Mondal.png" },
    { name: "Snehashis Ghosh", role: "Video Editor", dept: "2nd Yr. EE", img: "/team/Snehashish.png", insta: "https://www.instagram.com/mr_shinchan_editzs/" },
    { name: "Harasundar Patra", role: "Video Editor & Designer", dept: "2nd Yr. ME", img: "/team/Harasundar.png", insta: "https://www.instagram.com/harasundar_/" },
    { name: "Balaram Mardi", role: "Video Editor", dept: "3rd Yr. EE", img: "/team/Balaram Mardi.png", insta: "https://www.instagram.com/balaram_mardi1/" },
    { name: "Dibyendu Kumar Kundu", role: "Video Editor & Designer", dept: "1st Yr. ECE", img: "/team/Dibyendu.png", insta: "https://www.instagram.com/_dibyen.du_k_/" },
    { name: "Sampreety Swarnakar", role: "Content Writer", dept: "2nd Yr. ECE", img: "/team/Sampreety.png", insta: "https://www.instagram.com/koli.forever/" },
    { name: "Ankur Shit", role: "Content Writer & PR", dept: "1st Yr. CSE", img: "/team/Ankur.png", insta: "https://www.instagram.com/_ankur_shit/" },
    { name: "Priyanshu Dhara", role: "Authenticity Verifier", dept: "3rd Yr. ME", img: "/team/Priyanshu Dhara.png", insta: "https://www.instagram.com/iam_priyansu.12/" },
    { name: "Sabarno Mondal", role: "PR Manager", dept: "1st Yr. EE", img: "/team/Sabarno Mondal.png", insta: "https://www.instagram.com/culer_mariner_sabarno_10/" },
  ],
  members: []
};

// This will be populated from Firestore
let STATIC_EVENTS = [
  { id: "varnakriti", name: "VARNAKRITI", subtitle: "Annual Photo Exhibition", date: "February 2026", color: "#C9A96E", desc: "Our flagship photo exhibition where the finest captures of the year are displayed on a gallery wall. Features a Top 3 Winners showcase with award ceremony.", highlight: "Top 3 Winners crowned. 30+ photos on display.", emoji: "🏆", order: 1 },
  { id: "esperanza", name: "ESPERANZA 2k26", subtitle: "Annual Tech Cum Cultural Fest", date: "June 2026", color: "#7EB8D4", desc: "The grand annual celebration of Capture Crew — a full-day photo walk, workshop, and exhibition bringing together photography enthusiasts from across the campus.", highlight: "500+ attendees. Campus-wide photo walk.", emoji: "🌟", comingSoon: true, order: 2 },
  { id: "republic", name: "Republic Day", subtitle: "Patriotic Documentation", date: "January 2026", color: "#FF9933", desc: "Celebrating the 77th Republic Day of India on campus. A day of pride, patriotism, and honoring the constitution through our lenses.", highlight: "Tricolor flag hoisting and cultural documentation.", emoji: "🇮🇳", order: 3 },
  { id: "croeso", name: "CROESO 2k25", subtitle: "Freshers' Welcome", date: "February 2026", color: "#A8D8A8", desc: "A warm welcome for first-year students. Introductory sessions, camera handling workshops, and a mini photo-walk across campus.", highlight: "Welcome to the frame. New eyes, new stories.", emoji: "🎓", order: 4 },
  { id: "holi", name: "Holi Event", subtitle: "Festival of Colors", date: "March 2026", color: "#FF69B4", desc: "Celebrating the vibrant festival of colors with the Capture Crew family. A day of joy and splash of colors.", highlight: "Vibrance in every splash.", emoji: "🎨", order: 5 },
  { id: "saraswati", name: "Saraswati Puja", subtitle: "Festival Documentation", date: "January 2026", color: "#DEB8D0", desc: "Documenting the beauty and devotion of Saraswati Puja on campus — from rituals to the procession.", highlight: "Devotion in every frame.", emoji: "🌸", order: 6 },
  { id: "independence", name: "Independence Day", subtitle: "15th August Special", date: "August 2026", color: "#FF9933", desc: "Capturing the spirit of patriotism — flag hoisting ceremonies and special themed photo series.", highlight: "Tricolor through the lens.", emoji: "🇮🇳", comingSoon: true, order: 7 }
];

const GALLERY_CATEGORIES = ["All", "Weekly Captures", "Monthly Captures", "The Extra Frame"];

const GALLERY = [
  {
    id: 1,
    category: "Weekly Captures",
    title: "A quiet river, but it speaks louder than noise",
    photographer: "Pritam Ghosh",
    dept: "CSE",
    year: "1st Year",
    url: "/gallery/week/week_1.jpg",
    aspect: 1.5,
    hue: 200,
    story: "Silence turns into beauty.",
    captureDate: "2024-05-01"
  },
  {
    id: 2,
    category: "Weekly Captures",
    title: "Bridges connect stories",
    photographer: "Raj Samannay Bag",
    dept: "Electrical Engineering",
    year: "1st Year",
    url: "/gallery/week/week_2.jpg",
    aspect: 1.4,
    hue: 45,
    story: "Bridges don't just connect places, they connect stories.",
    captureDate: "2024-05-02"
  },
  {
    id: 3,
    category: "Weekly Captures",
    title: "Dark wings, soft bloom",
    photographer: "Rahul Sheet",
    dept: "Mechanical Engineering",
    year: "1st Year",
    url: "/gallery/week/week_3.webp",
    aspect: 1.5,
    hue: 210,
    story: "Where silence turns into beauty.",
    captureDate: "2024-05-03"
  },
  {
    id: 4,
    category: "Weekly Captures",
    title: "Nature painted this morning",
    photographer: "Akash Ghara",
    dept: "Mechanical Engineering",
    year: "1st Year",
    url: "/gallery/week/week_4.heic",
    aspect: 1.2,
    hue: 45,
    story: "Nature painted this morning with rays of gold.",
    captureDate: "2024-05-04"
  },
  {
    id: 5,
    category: "Weekly Captures",
    title: "Royal Vibes",
    photographer: "Indrakshi Ghosh",
    dept: "Civil Engineering",
    year: "1st Year",
    url: "/gallery/week/week_5.heic",
    aspect: 1.4,
    hue: 30,
    story: "Timeless elegance at Cooch Behar Rajbari.",
    captureDate: "2024-05-05"
  },
  {
    id: 6,
    category: "Weekly Captures",
    title: "Dil ki har khushi",
    photographer: "Shreejan Roy",
    dept: "Electrical Engineering",
    year: "1st Year",
    url: "/gallery/week/week_6.jpg",
    aspect: 1.1,
    hue: 340,
    story: "Saath saath woh hai mere.",
    captureDate: "2024-05-06"
  },
  {
    id: 7,
    category: "Weekly Captures",
    title: "The Train Memories",
    photographer: "Sabarno Mondal",
    dept: "Electrical Engineering",
    year: "1st Year",
    url: "/gallery/week/week_7.heic",
    aspect: 1.0,
    hue: 190,
    story: "The train may be late, but the memories arrive on time.",
    captureDate: "2024-05-07"
  },
  {
    id: 8,
    category: "Weekly Captures",
    title: "Classroom Silence",
    photographer: "Anupam Das",
    dept: "Electrical Engineering",
    year: "1st Year",
    url: "/gallery/week/week_8.webp",
    aspect: 1.3,
    hue: 160,
    story: "Where dreams once sat in classrooms, now the silence writes its own story.",
    captureDate: "2024-05-08"
  },
  {
    id: 9,
    category: "Weekly Captures",
    title: "Water Whispers",
    photographer: "Debasis Biswas",
    dept: "CSE",
    year: "3rd Year",
    url: "/gallery/week/week_9.jpg",
    aspect: 1.5,
    hue: 200,
    story: "Where the water whispers and the hills smile back.",
    captureDate: "2024-05-09"
  },
  {
    id: 10,
    category: "Weekly Captures",
    title: "শূন্যতার কোলাহল",
    photographer: "Subhajit Sil",
    dept: "ECE",
    year: "1st Year",
    url: "/gallery/week/week_10.webp",
    aspect: 0.8,
    hue: 280,
    story: "Capturing the void.",
    captureDate: "2024-05-10"
  },
  {
    id: 11,
    category: "Weekly Captures",
    title: "Nature's Rhythm",
    photographer: "Sumon Mondal",
    dept: "ECE",
    year: "1st Year",
    url: "/gallery/week/week_11.webp",
    aspect: 1.1,
    hue: 120,
    story: "Nature doesn't rush, yet everything feels perfect here.",
    captureDate: "2024-05-11"
  },
  {
    id: 12,
    category: "Monthly Captures",
    title: "Lone Tree Dreams",
    photographer: "Prince Mahato",
    dept: "ECE",
    year: "1st Year",
    url: "/gallery/month/month_1.heic",
    aspect: 1.6,
    hue: 320,
    story: "A lone tree, a golden field, and a sky that feels like a dream.",
    captureDate: "2024-05-12"
  },
  {
    id: 13,
    category: "Monthly Captures",
    title: "Tastes Like Summer",
    photographer: "Jyotirmoy Mondal",
    dept: "Electrical Engineering",
    year: "3rd Year",
    url: "/gallery/month/month_2.webp",
    aspect: 1.5,
    hue: 45,
    story: "Summer vibes in a frame.",
    captureDate: "2024-05-13"
  },
  {
    id: 14,
    category: "Monthly Captures",
    title: "Celebration Night",
    photographer: "Akash Ghara",
    dept: "Mechanical Engineering",
    year: "1st Year",
    url: "/gallery/month/month_3.jpg",
    aspect: 1.5,
    hue: 40,
    story: "Under a sky of fairy lights and whispered wishes.",
    captureDate: "2024-05-14"
  }
];

const WEEK_CAPTURE = GALLERY[3]; // Akash Ghara's "Nature painted"

const MONTH_CAPTURES = [
  GALLERY[13], // Akash Ghara's "Celebration Night"
  GALLERY[12], // Jyotirmoy Mondal
  GALLERY[11]  // Prince Mahato
];

const HERO_COVERS = [
  "covers/image.png",
  "covers/image (1).png",
  "covers/image (2).png",
  "covers/image (3).png",
  "covers/image (4).png",
  "covers/image (5).png",
  "covers/image (6).png",
  "covers/image (7).png",
  "covers/image (8).png"
].map(path => (import.meta.env.BASE_URL || "/") + path);

// ─── APP ────────────────────────────────────────────────────────────────────

export default function App() {
  const [navScrolled, setNavScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [galleryFilter, setGalleryFilter] = useState("All");
  const [lightboxItem, setLightboxItem] = useState(null);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(() => {
    const last = localStorage.getItem("lastHeroIndex");
    let next = Math.floor(Math.random() * HERO_COVERS.length);
    if (last !== null && HERO_COVERS.length > 1) {
      while (next === parseInt(last)) {
        next = Math.floor(Math.random() * HERO_COVERS.length);
      }
    }
    localStorage.setItem("lastHeroIndex", next);
    return next;
  });

  useEffect(() => {
    console.log("Hero Image Change:", currentHeroIndex, HERO_COVERS[currentHeroIndex]);
    const timer = setInterval(() => {
      setCurrentHeroIndex(prev => (prev + 1) % HERO_COVERS.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [currentHeroIndex]);
  
  // Certificate State
  const [certId, setCertId] = useState("");
  const [verifyResult, setVerifyResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [adminSection, setAdminSection] = useState("certificates");

  // Live Data State
  const [gallery, setGallery] = useState(GALLERY);
  const [weekCapture, setWeekCapture] = useState(null);
  const [monthCapture, setMonthCapture] = useState(null);
  const [extraFrameCapture, setExtraFrameCapture] = useState(null);
  const [showRecruitment, setShowRecruitment] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [expandedGallery, setExpandedGallery] = useState(false);
  const [expandedEvents, setExpandedEvents] = useState(false);
  const [expandedTeam, setExpandedTeam] = useState(false);
  const [expandedMembers, setExpandedMembers] = useState(false);
  const [shuffledCore, setShuffledCore] = useState([]);
  const [shuffledMembers, setShuffledMembers] = useState([]);
  const [dynamicMembers, setDynamicMembers] = useState([]);
  const [liveEvents, setLiveEvents] = useState({});
  const [liveEventsList, setLiveEventsList] = useState([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showGlobalGallery, setShowGlobalGallery] = useState(false);

  // Initial Shuffles
  useEffect(() => {
    const shuffle = (array) => {
      const s = [...array];
      for (let i = s.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [s[i], s[j]] = [s[j], s[i]];
      }
      return s;
    };
    setShuffledCore(shuffle(TEAM_DATA.core));
  }, []);

  useEffect(() => {
    const shuffle = (array) => {
      const s = [...array];
      for (let i = s.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [s[i], s[j]] = [s[j], s[i]];
      }
      return s;
    };
    const combinedMembers = [...dynamicMembers];
    setShuffledMembers(shuffle(combinedMembers));
  }, [dynamicMembers]);

  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(false);

  // Parallel Real-time & Data Fetching
  useEffect(() => {
    // 1. Members Snapshot (Start immediately)
    const qMembers = query(collection(db, "members"), orderBy("createdAt", "desc"));
    const unsubMembers = onSnapshot(qMembers, (snap) => {
      const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setDynamicMembers(fetched);
    });

    // 2. Fetch Gallery & Events (Independent of Members)
    const fetchData = async () => {
      try {
        const [gallerySnap] = await Promise.all([
          getDocs(collection(db, "gallery"))
        ]);

        if (!gallerySnap.empty) {
          const liveGallery = gallerySnap.docs.map(d => ({ id: d.id, ...d.data() }));
          const sorted = [...liveGallery].sort((a, b) => {
            const dateA = a.captureDate || "";
            const dateB = b.captureDate || "";
            if (dateB !== dateA) return dateB.localeCompare(dateA);
            return (b.createdAt || "").localeCompare(a.createdAt || "");
          });
        setGallery(liveGallery);
        const latestWeek = sorted.find(g => g.category === "Weekly Captures");
        const latestMonth = sorted.find(g => g.category === "Monthly Captures");
        const latestExtra = sorted.find(g => g.category === "The Extra Frame");
        if (latestWeek) setWeekCapture(latestWeek);
        if (latestMonth) setMonthCapture(latestMonth);
        if (latestExtra) setExtraFrameCapture(latestExtra);
        
        }
        
        // Finalize initialization
        setTimeout(() => setIsInitializing(false), 800);
      } catch (err) { 
        console.error("Fetch error:", err);
        setIsInitializing(false); 
      }
    };
    
    // 3. Events Snapshot (Real-time Management)
    const unsubEvents = onSnapshot(collection(db, "events"), async (snap) => {
      const eventsMap = {};
      const eventList = [];
      snap.forEach(d => {
        const data = d.data();
        eventsMap[d.id] = data.photos || [];
        eventList.push({ id: d.id, ...data });
      });

      // Seeding: ensure all static events exist in DB
      for (const ev of STATIC_EVENTS) {
        if (!eventList.find(e => e.id === ev.id)) {
          await setDoc(doc(db, "events", ev.id), ev);
          // snap will fire again due to this write
        }
      }

      setLiveEvents(eventsMap);
      setLiveEventsList(eventList.sort((a,b) => (a.order || 99) - (b.order || 99)));
    });

    fetchData();
    return () => {
      unsubMembers();
      unsubEvents();
    };
  }, []);


  // Nav scroll & Mobile detection
  useEffect(() => {
    const fn = () => {
      setNavScrolled(window.scrollY > 60);
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("scroll", fn);
    window.addEventListener("resize", fn);
    return () => {
      window.removeEventListener("scroll", fn);
      window.removeEventListener("resize", fn);
    };
  }, []);

  // Fade-in observer
  useEffect(() => {
    const els = document.querySelectorAll(".fade-in");
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && e.target.classList.add("visible")),
      { threshold: 0.1 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [galleryFilter, gallery, weekCapture, monthCapture, extraFrameCapture, expandedGallery, expandedEvents, expandedTeam, expandedMembers]);

  // Lightbox esc
  useEffect(() => {
    const fn = e => e.key === "Escape" && setLightboxItem(null);
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  // Auth Listener with Admin Check
  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        setIsAuthChecking(true);
        try {
          const adminDoc = await getDoc(doc(db, "admins", u.email));
          if (adminDoc.exists()) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
            // Auto sign out if not in admin list to keep it clean
            // await signOut(auth); 
          }
        } catch (err) {
          console.error("Admin check error:", err);
          setIsAdmin(false);
        }
        setIsAuthChecking(false);
      } else {
        setIsAdmin(false);
      }
    });
  }, []);
  // Intersection Observer for fade-in animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    const elements = document.querySelectorAll('.fade-in');
    elements.forEach(el => observer.observe(el));

    // Re-observe when components might re-render or expand
    const timer = setInterval(() => {
      const newElements = document.querySelectorAll('.fade-in:not(.visible)');
      newElements.forEach(el => observer.observe(el));
    }, 1000);

    return () => {
      observer.disconnect();
      clearInterval(timer);
    };
  }, [gallery, liveEvents, shuffledMembers, isInitializing]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!certId.trim()) return;
    setIsVerifying(true);
    setVerifyResult(null);
    try {
      const q = query(collection(db, "certificates"), where("serialNo", "==", certId.trim()));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setVerifyResult(snap.docs[0].data());
      } else {
        setVerifyResult({ error: "Certificate not found. Please check the serial number." });
      }
    } catch (err) {
      console.error(err);
      setVerifyResult({ error: "Verification service unavailable." });
    }
    setIsVerifying(false);
  };
  const scrollTo = (id) => {
    if (selectedEvent) setSelectedEvent(null);
    setMobileMenuOpen(false);
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      setActiveSection(id);
    }, 100);
  };

  const sortedGallery = [...gallery].sort((a, b) => {
    const dateA = a.captureDate || "";
    const dateB = b.captureDate || "";
    return dateB.localeCompare(dateA);
  });

  const filteredGallery = galleryFilter === "All"
    ? sortedGallery
    : sortedGallery.filter(g => g.category === galleryFilter);

  if (isInitializing) {
    return (
      <div className="splash-screen">
        <div className="splash-content">
          <div className="shutter-icon">
            <img src="/logo.jpg" alt="Logo" style={{ width: '100px', height: '100px', borderRadius: '50%', border: '2px solid var(--gold)', padding: '5px' }} />
          </div>
          <h1 className="splash-logo">CAPTURE <span>CREW</span></h1>
          <div className="splash-loader">
            <div className="loader-bar"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* NAV */}
      <nav className={`nav ${navScrolled ? "scrolled" : ""}`}>
        <div className="nav-brand" onClick={() => scrollTo("home")}>
          <div className="nav-logo">
            <img src="/logo.jpg" alt="Capture Crew Logo" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          </div>
          <div className="nav-name">Capture Crew</div>
        </div>
        
        <button className={`nav-toggle ${mobileMenuOpen ? "active" : ""}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <span></span><span></span><span></span>
        </button>

        <ul className={`nav-links ${mobileMenuOpen ? "mobile-open" : ""}`}>
          {[["home","Home"],["gallery","Gallery"],["events","Events"],["team","Team"],["verify","Verify"]].map(([id, label]) => (
            <li key={id} className={activeSection === id ? "active" : ""} onClick={() => scrollTo(id)}>{label}</li>
          ))}
          <li className="nav-btn-wrapper">
            <button className="admin-nav-btn" onClick={() => setShowLogin(true)}>Admin Console</button>
          </li>
        </ul>
      </nav>

      {/* HERO */}
      <section id="home" className="hero">
        <div className="hero-bg">
          {HERO_COVERS.map((img, idx) => (
            (idx === currentHeroIndex || idx === (currentHeroIndex + 1) % HERO_COVERS.length) && (
              <div
                key={idx}
                className={`hero-slide ${idx === currentHeroIndex ? "active" : ""}`}
                style={{ backgroundImage: `url("${img}")`, backgroundColor: '#111' }}
              />
            )
          ))}
          <div className="hero-overlay" />
        </div>
        <div className="hero-content">
          <div className="hero-eyebrow">Capture Crew · CGEC Photography Club</div>
          <h1 className="hero-title">
            CAPTURING <em>MOMENTS,</em><br />
            CREATING <em>MEMORIES.</em>
          </h1>
          <p className="hero-tagline">Exploring the World through the CGEC lens</p>
          <button className="hero-cta" onClick={() => scrollTo("gallery")}>
            Explore the Gallery ↓
          </button>
        </div>
        <div className="hero-scroll">Scroll</div>
      </section>

      {/* CAPTURE OF THE WEEK */}
      <section id="week" className="week-section">
        <div className="container">
          <div className="fade-in" style={{ marginBottom: "4rem" }}>
            <div className="section-label">✦ Featured</div>
            <h2 className="section-title">Capture of the <em>Week</em></h2>
            <p className="section-sub">Hand-picked by the core team — one photograph that stopped us in our tracks.</p>
          </div>
          <div className="week-inner fade-in">
            <div className="week-image-wrap">
              <img src={weekCapture?.url || "/placeholder.jpg"} alt={weekCapture?.title} className="week-img" referrerPolicy="no-referrer" />
              <div className="week-badge">This Week's Pick</div>
            </div>
            <div className="week-info">
              <div className="week-date">Featured</div>
              <p className="week-story">{weekCapture?.title || "Fetching the latest capture..."}</p>
              <div className="month-photographer" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                By <span>{weekCapture?.photographer}</span> ({weekCapture?.dept} · {weekCapture?.year})
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CAPTURE OF THE MONTH */}
      <section id="month" className="month-section">
        <div className="container">
          <div className="month-header fade-in">
            <div>
              <div className="section-label">✦ Premium Showcase</div>
              <h2 className="section-title">Capture of the <em>Month</em></h2>
            </div>
          </div>
          <div className="month-slide fade-in">
            <div className="month-image-wrap">
              <img src={monthCapture?.url || "/placeholder.jpg"} alt={monthCapture?.title} className="month-img" referrerPolicy="no-referrer" />
              <div className="month-frame" />
              <div className="month-award">
                <div className="month-award-text">BEST<br/>OF<br/>MONTH</div>
              </div>
            </div>
            <div className="month-info">
              <div className="month-of">Premium Selection</div>
              <h3 className="week-title" style={{ fontSize: '2.2rem', marginBottom: '1.2rem' }}>{monthCapture?.title}</h3>
              <div className="month-photographer" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                By <span>{monthCapture?.photographer}</span> ({monthCapture?.dept} · {monthCapture?.year})
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE EXTRA FRAME */}
      {extraFrameCapture && (
        <section id="extra" className="week-section" style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", padding: '8rem 0' }}>
          <div className="container">
            <div className="fade-in" style={{ marginBottom: "4rem" }}>
              <div className="section-label">✦ Bonus Frame</div>
              <h2 className="section-title">The <em>Extra Frame</em></h2>
            </div>
            <div className="week-inner fade-in">
              <div className="week-image-wrap" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                <img src={extraFrameCapture.url} alt={extraFrameCapture.title} className="week-img" style={{ borderRadius: '0' }} referrerPolicy="no-referrer" />
                <div className="week-badge" style={{ background: "var(--gold)", color: "var(--ink)", padding: '0.5rem 1.2rem', fontSize: '0.7rem' }}>Special Moments</div>
              </div>
              <div className="week-info" style={{ padding: '0' }}>
                <div className="week-date">Bonus Feature</div>
                <h3 className="week-title" style={{ fontSize: '2.2rem', marginBottom: '1.2rem' }}>{extraFrameCapture.title}</h3>
                <div className="month-photographer" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                  By <span>{extraFrameCapture.photographer}</span> ({extraFrameCapture.dept} · {extraFrameCapture.year})
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* GALLERY */}
      <section id="gallery" className="gallery-section">
        <div className="container">
          <div className="fade-in" style={{ marginBottom: "3rem" }}>
            <div className="section-label">✦ Our Work</div>
            <h2 className="section-title">The <em>Gallery</em></h2>
            <p className="section-sub">Curated captures from our photographers — click any image to view full screen.</p>
          </div>
          <div className="gallery-filter fade-in">
            {GALLERY_CATEGORIES.map(cat => (
              <button key={cat} className={`filter-btn ${galleryFilter === cat ? "active" : ""}`} onClick={() => setGalleryFilter(cat)}>{cat}</button>
            ))}
          </div>
          <div className="gallery-masonry fade-in">
            {filteredGallery.slice(0, !expandedGallery ? (isMobile ? 3 : 12) : undefined).map(item => (
              <div
                key={item.id}
                className="gallery-item"
                onClick={() => setLightboxItem(item)}
              >
                <img 
                  src={item.url} 
                  alt={item.title} 
                  className="gallery-thumb" 
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <div className="gallery-overlay">
                  <div>
                    <div className="gallery-item-title">{item.title}</div>
                    <div className="gallery-item-photo">by {item.photographer} · {item.dept}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {!expandedGallery && filteredGallery.length > (isMobile ? 3 : 12) && (
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <button className="event-dive-btn" onClick={() => setExpandedGallery(true)}>View All Captures →</button>
            </div>
          )}
        </div>
      </section>

      {/* EVENTS */}
      <section id="events" className="events-section">
        <div className="container">
          <div className="fade-in" style={{ marginBottom: "3rem" }}>
            <div className="section-label">✦ Milestones</div>
            <h2 className="section-title">Club <em>Events</em></h2>
            <p className="section-sub">From intimate workshops to grand exhibitions — every event, immortalized through our lenses.</p>
          </div>
          <div className="events-grid">
            {liveEventsList.slice(0, (isMobile && !expandedEvents) ? 3 : undefined).map(ev => (
              <div
                key={ev.id}
                className="event-card fade-in"
                style={{ "--c": ev.color }}
              >
                <span className="event-emoji">{ev.emoji}</span>
                <div className="event-name">{ev.name}</div>
                <div className="event-subtitle" style={{ color: ev.color }}>{ev.subtitle}</div>
                <div className="event-date">{ev.date}</div>
                <div className="event-desc">{ev.desc}</div>
                <div className="event-highlight">{ev.highlight}</div>
                <button 
                  className="event-dive-btn" 
                  onClick={() => ev.comingSoon ? alert("Coming Soon!") : setSelectedEvent(ev)}
                >
                  {ev.comingSoon ? "Coming Soon →" : "Dive In →"}
                </button>
              </div>
            ))}
            
            {/* Global Gallery Card */}
            <div 
              className="event-card global-gallery-card fade-in" 
              onClick={() => setShowGlobalGallery(true)}
              style={{ cursor: 'pointer' }}
            >
              <div className="global-card-content">
                <span className="event-emoji">📂</span>
                <div className="event-name">Dive into Event <em>Archive</em></div>
                <div className="event-subtitle" style={{ color: 'var(--gold)' }}>Universal Gallery</div>
                <div className="event-desc">Explore every capture from every event we've ever hosted, all in one immersive timeline.</div>
                <div className="global-card-badge">✨ IMMERSIVE VIEW</div>
                <button className="event-dive-btn" style={{ marginTop: 'auto' }}>Open Archive →</button>
              </div>
              <div className="global-card-bg"></div>
            </div>
          </div>
          {isMobile && !expandedEvents && liveEventsList.length > 3 && (
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <button className="event-dive-btn" onClick={() => setExpandedEvents(true)}>View All Events →</button>
            </div>
          )}
        </div>
      </section>

      {/* TEAM */}
      <section id="team" className="team-section">
        <div className="container">
          <div className="fade-in" style={{ marginBottom: "3rem" }}>
            <div className="section-label">✦ The People Behind the Lens</div>
            <h2 className="section-title">Core <em>Team</em></h2>
            <p className="section-sub">The dedicated photographers, editors, and organizers who keep Capture Crew alive.</p>
          </div>
          <div className="team-container">
            {/* FOUNDERS */}
            <div className="team-subcategory">
              <h3 className="subcategory-title"><em>Founders</em></h3>
              <div className="team-grid">
                {TEAM_DATA.founders.map(m => (
                  <div key={m.name} className="team-card fade-in" onClick={() => m.insta && window.open(m.insta, "_blank")} style={{ cursor: m.insta ? 'pointer' : 'default' }}>
                    <div className="team-avatar">
                      <img src={m.img} alt={m.name} loading="lazy" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    </div>
                    <div className="team-name">{m.name}</div>
                    <div className="team-role">{m.role}</div>
                    <div className="team-dept">{m.dept}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* INCHARGE */}
            <div className="team-subcategory">
              <h3 className="subcategory-title"><em>Incharge</em></h3>
              <div className="team-grid incharge-grid">
                {TEAM_DATA.incharge.map(m => (
                  <div key={m.name} className="team-card incharge-card fade-in" onClick={() => m.insta && window.open(m.insta, "_blank")} style={{ cursor: m.insta ? 'pointer' : 'default' }}>
                    <div className="team-avatar highlight-silver">
                      <img src={m.img} alt={m.name} loading="lazy" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    </div>
                    <div className="team-name">{m.name}</div>
                    <div className="team-role">{m.role}</div>
                    <div className="team-dept">{m.dept}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* COORDINATORS */}
            <div className="team-subcategory">
              <h3 className="subcategory-title"><em>Co-Ordinators</em></h3>
              <div className="team-grid">
                {TEAM_DATA.coordinators.map(m => (
                  <div key={m.name} className="team-card fade-in" onClick={() => m.insta && window.open(m.insta, "_blank")} style={{ cursor: m.insta ? 'pointer' : 'default' }}>
                    <div className="team-avatar">
                      <img src={m.img} alt={m.name} loading="lazy" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    </div>
                    <div className="team-name">{m.name}</div>
                    <div className="team-role">{m.role}</div>
                    <div className="team-dept">{m.dept}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* CORE TEAM */}
            <div className="team-subcategory">
              <h3 className="subcategory-title">Core <em>Team</em></h3>
              <div className="team-grid">
                {shuffledCore.slice(0, (isMobile && !expandedTeam) ? 3 : undefined).map(m => (
                  <div key={m.name} className="team-card fade-in" onClick={() => m.insta && window.open(m.insta, "_blank")} style={{ cursor: m.insta ? 'pointer' : 'default' }}>
                    <div className="team-avatar">
                      {m.img ? (
                        <img src={m.img} alt={m.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        m.emoji
                      )}
                    </div>
                    <div className="team-name">{m.name}</div>
                    <div className="team-role">{m.role}</div>
                    <div className="team-dept">{m.dept}</div>
                  </div>
                ))}
                
                {isMobile && !expandedTeam && shuffledCore.length > 3 && (
                  <div className="team-card fade-in" style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }} onClick={() => setExpandedTeam(true)}>
                    <div className="team-avatar" style={{ background: 'var(--gold)', color: 'var(--ink)' }}>
                      📂
                    </div>
                    <div className="team-name" style={{ color: 'var(--gold)' }}>Show All</div>
                    <div className="team-role">Full Core Team</div>
                    <div className="team-dept">{shuffledCore.length} Members Total</div>
                  </div>
                )}
                
                {/* RECRUITMENT CARD - Always show or show after expansion? Let's always show it or show it at end */}
                {(expandedTeam || !isMobile) && (
                  <div className="team-card fade-in" style={{ cursor: 'pointer', border: '1px dashed var(--gold)', background: 'rgba(201,169,110,0.03)' }} onClick={() => setShowRecruitment(true)}>
                    <div className="team-avatar" style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold2))', color: 'var(--ink)' }}>
                      ➕
                    </div>
                    <div className="team-name" style={{ color: 'var(--gold)' }}>Join Our Crew</div>
                    <div className="team-role">Become a Member</div>
                    <div className="team-dept">Apply for Core Team</div>
                    <button className="event-dive-btn" style={{ marginTop: '1rem', width: '100%' }}>Apply Now →</button>
                  </div>
                )}
              </div>
            </div>

            {/* MEMBERS */}
            <div className="team-subcategory" style={{ marginTop: '4rem' }}>
              <h3 className="subcategory-title"><em>Members</em></h3>
              <p className="section-sub" style={{ fontSize: '0.8rem', marginBottom: '2rem', fontStyle: 'italic', opacity: 0.8 }}>
                *Data collected from this year only. To get featured here, upload pictures with the mentioned format (Name, Dept, Year); otherwise, they will not be selected. Updates every week.
              </p>
              <div className="team-grid">
                {shuffledMembers.slice(0, expandedMembers ? undefined : (isMobile ? 6 : 8)).map(m => (
                  <div key={m.name} className="team-card fade-in" style={{ padding: '1.5rem 1rem', minHeight: '180px' }}>
                    <div className="team-avatar" style={{ width: '50px', height: '50px', fontSize: '1rem', background: 'rgba(255,255,255,0.05)', marginBottom: '0.8rem' }}>
                      📷
                    </div>
                    <div className="team-name" style={{ fontSize: '0.95rem' }}>{m.name}</div>
                    <div className="team-role" style={{ fontSize: '0.65rem', color: 'var(--gold)', marginBottom: '0.3rem' }}>{m.role || 'Member'}</div>
                    <div className="team-dept" style={{ fontSize: '0.65rem', opacity: 0.8 }}>{m.dept}</div>
                    <div className="team-dept" style={{ fontSize: '0.65rem', opacity: 0.6, marginTop: '2px' }}>{m.year}</div>
                  </div>
                ))}

                {!expandedMembers && shuffledMembers.length > (isMobile ? 6 : 8) && (
                  <div className="team-card fade-in" style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', padding: '1.5rem 1rem' }} onClick={() => setExpandedMembers(true)}>
                    <div className="team-avatar" style={{ background: 'var(--gold)', color: 'var(--ink)', width: '50px', height: '50px', fontSize: '1rem' }}>
                      📂
                    </div>
                    <div className="team-name" style={{ color: 'var(--gold)', fontSize: '0.95rem' }}>Show All</div>
                    <div className="team-role" style={{ fontSize: '0.65rem' }}>Full Member List</div>
                    <div className="team-dept" style={{ fontSize: '0.65rem' }}>{shuffledMembers.length} Members</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VERIFY SECTION */}
      <section id="verify" className="verify-section">
        <div className="container">
          <div className="verify-box fade-in">
            <div className="section-label">✦ Authenticity</div>
            <h2 className="section-title">Verify <em>Certificate</em></h2>
            <p className="section-sub">Enter your certificate serial number to verify its authenticity and details.</p>
            
            <form className="verify-form" onSubmit={handleVerify}>
              <input 
                type="text" 
                placeholder="Enter Serial Number (e.g. CC-2024-001)" 
                value={certId}
                onChange={(e) => setCertId(e.target.value)}
                className="form-input"
              />
              <button type="submit" className="form-submit" disabled={isVerifying}>
                {isVerifying ? "Verifying..." : "Verify Now →"}
              </button>
            </form>

            {verifyResult && (
              <div className="verify-result fade-in visible">
                {verifyResult.error ? (
                  <div className="result-error">{verifyResult.error}</div>
                ) : (
                  <div className="result-success">
                    <div className="result-badge">✓ Verified Authenticity</div>
                    <div className="result-grid">
                      <div className="result-item">
                        <span className="label">Issued To</span>
                        <span className="value">{verifyResult.name}</span>
                      </div>
                      <div className="result-item">
                        <span className="label">Date Issued</span>
                        <span className="value">{verifyResult.date}</span>
                      </div>
                      <div className="result-item">
                        <span className="label">Event</span>
                        <span className="value">{verifyResult.event}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>


      <footer className="footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">Capture <span>Crew</span></div>
            <p className="footer-college">Cooch Behar Government Engineering College</p>
          </div>
          
          <div className="footer-mid">
            <div className="footer-links">
              {[["home","Home"],["gallery","Gallery"],["events","Events"],["team","Team"],["verify","Verify"]].map(([id, label]) => (
                <a key={id} onClick={() => scrollTo(id)} className="footer-link">{label}</a>
              ))}
              <a onClick={() => setShowLogin(true)} className="footer-link">Admin Console</a>
            </div>
            
            <div className="footer-socials">
              <a href="https://instagram.com/cgec_capture_crew?igshid=NGVhN2U2NjQ0Yg==" target="_blank" rel="noreferrer" className="social-icon">Instagram</a>
              <a href="https://chat.whatsapp.com/BSV9q40j6EN2B5sQz47eYK?mode=gi_t" target="_blank" rel="noreferrer" className="social-icon">WhatsApp</a>
              <a href="https://www.facebook.com/profile.php?id=61551537531538&mibextid=V3Yony" target="_blank" rel="noreferrer" className="social-icon">Facebook</a>
            </div>
          </div>
          
          <div className="footer-bottom">
            <div className="footer-copy">© 2026 Capture Crew · All Rights Reserved</div>
            <div className="footer-credit">
              Crafted with ❤️ by <a href="https://www.instagram.com/destructive_antagonist/" target="_blank" rel="noopener noreferrer">Arkadeb</a>
            </div>
          </div>
        </div>
      </footer>

      {/* LIGHTBOX */}
      <div className={`lightbox ${lightboxItem ? "open" : ""}`} onClick={() => setLightboxItem(null)}>
        <button className="lightbox-close" onClick={() => setLightboxItem(null)}>✕</button>
        {lightboxItem && (
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <img
              src={lightboxItem.url}
              alt={lightboxItem.title}
              className="lightbox-img-tag"
              referrerPolicy="no-referrer"
              style={{
                width: "auto",
                maxWidth: "90vw",
                maxHeight: "80vh",
                borderRadius: "12px",
                boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
              }}
            />
            <div className="lightbox-title">{lightboxItem.title}</div>
            <div className="lightbox-credit">by {lightboxItem.photographer} · {lightboxItem.dept} ({lightboxItem.year})</div>
          </div>
        )}
      </div>
      {/* MODALS */}
      {selectedEvent && (
        <EventPage 
          event={selectedEvent} 
          onClose={() => {
            setSelectedEvent(null);
            setTimeout(() => scrollTo("events"), 50);
          }}
          setLightboxItem={setLightboxItem} 
          liveEvents={liveEvents}
        />
      )}
      {showGlobalGallery && (
        <EventPage 
          isGlobal={true}
          event={{ id: 'global', name: 'Event Archive', desc: 'A universal journey through all our club milestones and collective memories.' }}
          onClose={() => setShowGlobalGallery(false)}
          setLightboxItem={setLightboxItem}
          liveEvents={liveEvents}
        />
      )}
      {showLogin && !user && (
        <LoginModal onClose={() => setShowLogin(false)} />
      )}
      {showLogin && user && isAuthChecking && (
        <div className="lightbox open"><div className="lightbox-content">Verifying Authorization...</div></div>
      )}
      {showLogin && user && !isAuthChecking && !isAdmin && (
        <LoginModal user={user} onClose={() => setShowLogin(false)} isUnauthorized={true} />
      )}
      {showLogin && user && !isAuthChecking && isAdmin && (
        <AdminDashboard user={user} onClose={() => setShowLogin(false)} liveEvents={liveEvents} liveEventsList={liveEventsList} dynamicMembers={dynamicMembers} />
      )}
      {showRecruitment && (
        <RecruitmentModal onClose={() => setShowRecruitment(false)} />
      )}
    </div>
  );
}

// ─── ADMIN COMPONENTS ───────────────────────────────────────────────────────

function LoginModal({ onClose, user, isUnauthorized }) {
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // Once logged in, the dashboard will show because user exists and showLogin is true
    } catch (err) {
      setError("Failed to sign in with Google.");
    }
  };

  return (
    <div className="lightbox open" onClick={onClose}>
      <div className="lightbox-content admin-modal" onClick={e => e.stopPropagation()}>
        <button className="lightbox-close" onClick={onClose}>✕</button>
        <div className="section-label">Restricted Access</div>
        <h2 className="section-title">Team <em>{isUnauthorized ? "Unauthorized" : "Login"}</em></h2>
        <p className="section-sub" style={{ fontSize: '0.8rem', margin: '1.5rem 0' }}>
          {isUnauthorized 
            ? `Your email (${user?.email}) is not authorized to access the Admin Console. Please contact the lead.`
            : "Access is restricted to authorized Core Team members only."}
        </p>
        
        {isUnauthorized ? (
          <button className="form-submit" onClick={() => signOut(auth)} style={{ width: '100%' }}>Sign Out & Try Again</button>
        ) : (
          <button className="form-submit" onClick={handleGoogleLogin} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '18px' }} />
            Continue with Google
          </button>
        )}
        {error && <p style={{ color: '#ff4d4d', fontSize: '0.8rem', marginTop: '1rem' }}>{error}</p>}
      </div>
    </div>
  );
}

function AdminDashboard({ user, onClose, liveEvents, liveEventsList, dynamicMembers }) {
  const [tab, setTab] = useState("week");
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventFormData, setEventFormData] = useState({
    id: "", name: "", subtitle: "", date: "", color: "#C9A96E",
    desc: "", highlight: "", emoji: "📅", comingSoon: false, order: 99
  });
  const [newEventPhoto, setNewEventPhoto] = useState("");
  const [bulkInput, setBulkInput] = useState("");
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  const [certs, setCerts] = useState([]);
  const [newCert, setNewCert] = useState({ name: "", serialNo: "", date: "", event: "" });
  
  const [featuredData, setFeaturedData] = useState({ 
    url: "", title: "", photographer: "", captureDate: new Date().toISOString().split('T')[0], 
    dept: "Computer Science & Engineering", year: "1st Year" 
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const handleGlobalCleanup = async () => {
    if (!window.confirm("This will deduplicate and format ALL members. Proceed?")) return;
    try {
      const q = query(collection(db, "members"));
      const snap = await getDocs(q);
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const namesSeen = new Set();
      const deptMap = {
        "CE": "Civil Engineering", "ME": "Mechanical Engineering", "EE": "Electrical Engineering",
        "ECE": "Electronics & Communication Engineering", "CSE": "Computer Science & Engineering"
      };
      for (const m of all) {
        const cleanName = m.name?.trim();
        if (namesSeen.has(cleanName)) {
          await deleteDoc(doc(db, "members", m.id));
          continue;
        }
        let fixedDept = m.dept || "";
        let fixedYear = m.year || "";
        if (!fixedYear && fixedDept.includes("Yr.")) {
          const parts = fixedDept.split("Yr.");
          fixedYear = parts[0].trim() + " Year";
          fixedDept = parts[1].trim().replace(".", "").replace(",", "");
        }
        const upperDept = fixedDept.toUpperCase();
        if (deptMap[upperDept]) fixedDept = deptMap[upperDept];
        else {
          if (upperDept.includes("CIVIL")) fixedDept = "Civil Engineering";
          if (upperDept.includes("MECHANICAL")) fixedDept = "Mechanical Engineering";
          if (upperDept.includes("ELECTRICAL")) fixedDept = "Electrical Engineering";
          if (upperDept.includes("ELECTRONICS")) fixedDept = "Electronics & Communication Engineering";
          if (upperDept.includes("COMPUTER")) fixedDept = "Computer Science & Engineering";
        }
        if (fixedYear.includes("1st")) fixedYear = "1st Year";
        if (fixedYear.includes("2nd")) fixedYear = "2nd Year";
        if (fixedYear.includes("3rd")) fixedYear = "3rd Year";
        if (fixedYear.includes("4th")) fixedYear = "4th Year";
        if (fixedDept !== m.dept || fixedYear !== m.year || cleanName !== m.name) {
          await updateDoc(doc(db, "members", m.id), { dept: fixedDept, year: fixedYear, name: cleanName });
        }
        namesSeen.add(cleanName);
      }
      alert("System Cleanup Complete!");
    } catch (err) { alert("Cleanup Failed: " + err.message); }
  };

  const DEPTS = [
    "Computer Science & Engineering",
    "Electronics & Communication Engineering",
    "Mechanical Engineering",
    "Electrical Engineering",
    "Civil Engineering"
  ];
  const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

  const handleDragStart = (e, index) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // Set a ghost image or just styling
    e.target.style.opacity = "0.5";
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = "1";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetIndex) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === targetIndex) return;

    const photos = [...(liveEvents[editingEvent] || [])];
    const draggedItem = photos[draggedItemIndex];
    photos.splice(draggedItemIndex, 1);
    photos.splice(targetIndex, 0, draggedItem);

    try {
      await updateDoc(doc(db, "events", editingEvent), { photos });
      setDraggedItemIndex(null);
    } catch (err) {
      alert("Reorder failed: " + err.message);
    }
  };

  const [gallery, setGallery] = useState([]);
  const updateRepublicDayPhotos = async () => {
    const setA = [
      "https://beeimg.com/images/c58546952951.jpg", "https://beeimg.com/images/h17773436031.jpg",
      "https://beeimg.com/images/h24306429703.jpg", "https://beeimg.com/images/h76457001124.jpg",
      "https://beeimg.com/images/h92001462694.jpg", "https://beeimg.com/images/i26770832012.jpg",
      "https://beeimg.com/images/i74985926181.jpg", "https://beeimg.com/images/l04924985234.jpg",
      "https://beeimg.com/images/l85960008731.jpg", "https://beeimg.com/images/m22098630431.jpg",
      "https://beeimg.com/images/o94080227041.jpg", "https://beeimg.com/images/p18742122001.jpg",
      "https://beeimg.com/images/s29365005831.jpg", "https://beeimg.com/images/t36116439454.jpg",
      "https://beeimg.com/images/u19710983213.jpg", "https://beeimg.com/images/v33738435441.jpg",
      "https://beeimg.com/images/y92907525492.jpg"
    ];
    const setB = [
      "https://beeimg.com/images/a67512667801.jpg", "https://beeimg.com/images/b34039500352.jpg",
      "https://beeimg.com/images/e53889717241.jpg", "https://beeimg.com/images/e63150308074.jpg",
      "https://beeimg.com/images/f87714856584.jpg", "https://beeimg.com/images/i77784487892.jpg",
      "https://beeimg.com/images/j01977566252.jpg", "https://beeimg.com/images/l98281316032.jpg",
      "https://beeimg.com/images/m42901990783.jpg", "https://beeimg.com/images/n54912540972.jpg",
      "https://beeimg.com/images/o56420603291.jpg", "https://beeimg.com/images/s13252935251.jpg",
      "https://beeimg.com/images/t36126096752.jpg", "https://beeimg.com/images/v97906815254.jpg",
      "https://beeimg.com/images/y44644881521.jpg", "https://beeimg.com/images/y52550178933.jpg"
    ];
    try {
      await setDoc(doc(db, "events", "republic"), { photos: [...setA, ...setB] }, { merge: true });
      alert("Republic Day gallery updated successfully!");
    } catch (err) { alert("Update failed: " + err.message); }
  };

  useEffect(() => {
    fetchCerts();
    fetchGallery();
    
    const qMembers = query(collection(db, "members"), orderBy("createdAt", "desc"));
    const unsubMembers = onSnapshot(qMembers, (snap) => {
      setDynamicMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubMembers();
  }, []);

  const fetchCerts = async () => {
    try {
      const snap = await getDocs(collection(db, "certificates"));
      setCerts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
  };

  const fetchGallery = async () => {
    try {
      const snap = await getDocs(collection(db, "gallery"));
      setGallery(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
  };


  const updateFeatured = async (type) => {
    setIsUpdating(true);
    try {
      const newPhoto = {
        ...featuredData,
        category: type === "week" ? "Weekly Captures" : type === "month" ? "Monthly Captures" : "The Extra Frame",
        createdAt: new Date().toISOString()
      };

      // 1. Add to the public Gallery
      await addDoc(collection(db, "gallery"), newPhoto);
      
      alert(`Saved to Gallery and Featured automatically!`);

      setFeaturedData({ url: "", title: "", photographer: "", captureDate: new Date().toISOString().split('T')[0], dept: DEPTS[0], year: YEARS[0] });
      fetchGallery(); 
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const addCert = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "certificates"), newCert);
      setNewCert({ name: "", serialNo: "", date: "", event: "" });
      fetchCerts();
      alert("Certificate Issued!");
    } catch (err) {
      alert("Failed to Issue: " + err.message);
    }
  };

  const deleteCert = async (id) => {
    if (window.confirm("Delete this certificate record?")) {
      try {
        await deleteDoc(doc(db, "certificates", id));
        fetchCerts();
        alert("Certificate record deleted.");
      } catch (err) {
        alert("Delete failed: " + err.message);
      }
    }
  };

  return (
    <div className="event-page-overlay">
      <div className="container" style={{ paddingBottom: '5rem' }}>
        <header className="event-page-header">
          <button className="back-btn" onClick={onClose}>← Close Dashboard</button>
          <div className="section-label">Admin Console</div>
          <h1 className="section-title">Team <em>Dashboard</em></h1>
          <p className="section-sub">Logged in as: {user.email}</p>
          <button className="event-dive-btn" style={{ position: 'absolute', top: '0', right: 0 }} onClick={() => signOut(auth)}>Sign Out</button>
        </header>

        <div className="gallery-filter">
          <button className={`filter-btn ${tab === 'week' ? 'active' : ''}`} onClick={() => setTab('week')}>Set Week</button>
          <button className={`filter-btn ${tab === 'month' ? 'active' : ''}`} onClick={() => setTab('month')}>Set Month</button>
          <button className={`filter-btn ${tab === 'extra' ? 'active' : ''}`} onClick={() => setTab('extra')}>Set Extra Frame</button>
          <button className={`filter-btn ${tab === 'gallery' ? 'active' : ''}`} onClick={() => setTab('gallery')}>Manage Gallery</button>
          <button className={`filter-btn ${tab === 'apps' ? 'active' : ''}`} onClick={() => setTab('apps')}>Applications</button>
          <button className={`filter-btn ${tab === 'certs' ? 'active' : ''}`} onClick={() => setTab('certs')}>Certificates</button>
          <button className={`filter-btn ${tab === 'members' ? 'active' : ''}`} onClick={() => setTab('members')}>Manage Members</button>
          <button className={`filter-btn ${tab === 'events' ? 'active' : ''}`} onClick={() => setTab('events')}>Manage Events</button>
        </div>

        {(tab === 'week' || tab === 'month' || tab === 'extra') && (
          <div className="fade-in visible">
            <h3 className="subcategory-title">Update {tab === 'week' ? 'Weekly' : tab === 'month' ? 'Monthly' : 'Extra Frame'} <em>Featured</em></h3>
            <p className="section-sub" style={{ marginBottom: '1.5rem' }}>Use <strong>Direct Links</strong> (e.g., https://i.ibb.co/... or https://i.postimg.cc/...). PostImage is recommended for stability.</p>
            <div className="feedback-form" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem' }}>
              <input className="form-input" placeholder="Image Direct Link (https://i.ibb.co/...)" value={featuredData.url} onChange={e => {
                let val = e.target.value;
                if (val.includes('ibb.co') && !val.includes('i.ibb.co')) {
                  console.warn("Likely not a direct link");
                }
                setFeaturedData({...featuredData, url: val})
              }} style={{ gridColumn: '1 / -1' }} />
              <input className="form-input" placeholder="Caption / Title" value={featuredData.title} onChange={e => setFeaturedData({...featuredData, title: e.target.value})} />
              <input className="form-input" placeholder="Photographer Name" value={featuredData.photographer} onChange={e => setFeaturedData({...featuredData, photographer: e.target.value})} />
              
              <select className="form-input" value={featuredData.dept} onChange={e => setFeaturedData({...featuredData, dept: e.target.value})}>
                {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              
              <select className="form-input" value={featuredData.year} onChange={e => setFeaturedData({...featuredData, year: e.target.value})}>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>

              <input type="date" className="form-input" placeholder="Capture Date" value={featuredData.captureDate} onChange={e => setFeaturedData({...featuredData, captureDate: e.target.value})} />
              
              <button className="form-submit" style={{ gridColumn: '1 / -1' }} onClick={() => updateFeatured(tab)}>
                {isUpdating ? "Updating..." : `Update & Save to Gallery →`}
              </button>
            </div>
          </div>
        )}


        {tab === 'gallery' && (
          <div className="fade-in visible">
            <h3 className="subcategory-title">Gallery <em>Archive</em></h3>
            <div className="gallery-grid">
              {gallery.map(g => (
                <div key={g.id} className="gallery-item">
                  <img src={g.url} alt="" loading="lazy" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '12px' }} referrerPolicy="no-referrer" />
                  <div style={{ padding: '0.5rem' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--white)' }}>{g.title}</div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>{g.photographer}</div>
                    <button onClick={async () => {
                      if (window.confirm("Delete from Gallery?")) {
                        try {
                          const photoToDelete = g;
                          await deleteDoc(doc(db, "gallery", g.id));
                          
                          // Also remove from featured config if it matches
                          const weekRef = doc(db, "config", "week");
                          const monthRef = doc(db, "config", "month");
                          
                          const [weekSnap, monthSnap] = await Promise.all([getDoc(weekRef), getDoc(monthRef)]);
                          
                          if (weekSnap.exists() && weekSnap.data().url === photoToDelete.url) {
                            await deleteDoc(weekRef);
                          }
                          if (monthSnap.exists() && monthSnap.data().url === photoToDelete.url) {
                            await deleteDoc(monthRef);
                          }

                          alert("Photo deleted successfully!");
                          fetchGallery();
                        } catch (err) {
                          alert("Delete failed: " + err.message);
                        }
                      }
                    }} style={{ background: 'transparent', color: '#ff4d4d', border: 'none', fontSize: '0.7rem', marginTop: '1rem', cursor: 'pointer' }}>Delete Photo 🗑</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === 'apps' && (
          <div className="fade-in visible">
            <h3 className="subcategory-title">Recruitment <em>Applications</em></h3>
            <AdminApplications />
          </div>
        )}

        {tab === 'certs' && (
          <div className="fade-in visible">
            <h3 className="subcategory-title">Issue <em>Certificate</em></h3>
            <form className="feedback-form" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '3rem' }} onSubmit={addCert}>
              <input className="form-input" placeholder="Student Name" value={newCert.name} onChange={e => setNewCert({...newCert, name: e.target.value})} required />
              <input className="form-input" placeholder="Serial No (CC-XXXX)" value={newCert.serialNo} onChange={e => setNewCert({...newCert, serialNo: e.target.value})} required />
              <input className="form-input" placeholder="Issue Date" value={newCert.date} onChange={e => setNewCert({...newCert, date: e.target.value})} required />
              <input className="form-input" placeholder="Event Name" value={newCert.event} onChange={e => setNewCert({...newCert, event: e.target.value})} required />
              <button className="form-submit" type="submit" style={{ gridColumn: '1 / -1' }}>Issue Certificate →</button>
            </form>

            <h3 className="subcategory-title">Issued <em>Certificates</em></h3>
            <div className="admin-table-wrap" style={{ overflowX: 'auto', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '1rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                    <th style={{ padding: '1rem' }}>Student Name</th>
                    <th style={{ padding: '1rem' }}>Serial No</th>
                    <th style={{ padding: '1rem' }}>Event</th>
                    <th style={{ padding: '1rem' }}>Date</th>
                    <th style={{ padding: '1rem' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {certs.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem', fontWeight: '600' }}>{c.name}</td>
                      <td style={{ padding: '1rem', color: 'var(--gold)' }}>{c.serialNo}</td>
                      <td style={{ padding: '1rem' }}>{c.event}</td>
                      <td style={{ padding: '1rem', opacity: 0.7 }}>{c.date}</td>
                      <td style={{ padding: '1rem' }}>
                        <button onClick={() => deleteCert(c.id)} style={{ background: '#ff4444', border: 'none', color: '#fff', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {certs.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>No certificates issued yet.</div>}
            </div>
          </div>
        )}

        {tab === 'members' && (
          <div className="fade-in visible">
            <h3 className="subcategory-title">Add New <em>Member</em></h3>
            <MemberForm DEPTS={DEPTS} YEARS={YEARS} onAdded={() => {}} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4rem', marginBottom: '1.5rem' }}>
              <h3 className="subcategory-title" style={{ margin: 0 }}>Manage <em>Live Members</em></h3>
              <button onClick={handleGlobalCleanup} style={{ background: 'var(--gold)', color: 'var(--ink)', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer' }}>🛠️ SYSTEM CLEANUP & DEDUPLICATE</button>
            </div>
            <div className="admin-table-wrap" style={{ overflowX: 'auto', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '1rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                    <th style={{ padding: '1rem' }}>Member Name</th>
                    <th style={{ padding: '1rem' }}>Dept</th>
                    <th style={{ padding: '1rem' }}>Year</th>
                    <th style={{ padding: '1rem' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {dynamicMembers.map(m => (
                    <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem', fontWeight: '600' }}>{m.name}</td>
                      <td style={{ padding: '1rem' }}>{m.dept}</td>
                      <td style={{ padding: '1rem', color: 'var(--gold)' }}>{m.year}</td>
                      <td style={{ padding: '1rem' }}>
                        <button onClick={async () => {
                          if (window.confirm("Remove this member?")) {
                            try {
                              await deleteDoc(doc(db, "members", m.id));
                              alert("Member removed.");
                            } catch (err) { alert("Failed: " + err.message); }
                          }
                        }} style={{ background: '#ff4444', border: 'none', color: '#fff', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {dynamicMembers.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>No live members added via Admin yet.</div>}
            </div>
          </div>
        )}

        {tab === 'events' && (
          <div className="fade-in visible">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 className="subcategory-title" style={{ margin: 0 }}>Manage <em>Events</em></h3>
              <button onClick={() => {
                setEditingEvent("new");
                setEventFormData({ id: "", name: "", subtitle: "", date: "", color: "#C9A96E", desc: "", highlight: "", emoji: "📅", comingSoon: false, order: liveEventsList.length + 1 });
              }} style={{ background: 'var(--gold)', color: 'var(--ink)', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer' }}>➕ ADD NEW EVENT</button>
            </div>

            {editingEvent ? (
              <div className="glass-form fade-in visible" style={{ padding: '2rem', marginBottom: '3rem' }}>
                <h4 style={{ color: 'var(--gold)', marginBottom: '1.5rem' }}>{editingEvent === 'new' ? 'Add New' : 'Edit'} Event Details</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <input className="form-input" placeholder="Event Slug (e.g. freshers-2026)" value={eventFormData.id} disabled={editingEvent !== 'new'} onChange={e => setEventFormData({...eventFormData, id: e.target.value.toLowerCase().replace(/ /g, '-')})} />
                  <input className="form-input" placeholder="Event Name" value={eventFormData.name} onChange={e => setEventFormData({...eventFormData, name: e.target.value})} />
                  <input className="form-input" placeholder="Sub-heading" value={eventFormData.subtitle} onChange={e => setEventFormData({...eventFormData, subtitle: e.target.value})} />
                  <input className="form-input" placeholder="Date/Season" value={eventFormData.date} onChange={e => setEventFormData({...eventFormData, date: e.target.value})} />
                  <input className="form-input" placeholder="Highlight Text" value={eventFormData.highlight} onChange={e => setEventFormData({...eventFormData, highlight: e.target.value})} />
                  <input className="form-input" placeholder="Emoji (e.g. 📸)" value={eventFormData.emoji} onChange={e => setEventFormData({...eventFormData, emoji: e.target.value})} />
                  <input className="form-input" type="color" value={eventFormData.color} onChange={e => setEventFormData({...eventFormData, color: e.target.value})} title="Theme Color" />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" checked={eventFormData.comingSoon} onChange={e => setEventFormData({...eventFormData, comingSoon: e.target.checked})} />
                    <label style={{ fontSize: '0.8rem' }}>Coming Soon?</label>
                  </div>
                  <textarea className="form-input" style={{ gridColumn: '1 / -1', minHeight: '80px' }} placeholder="Description" value={eventFormData.desc} onChange={e => setEventFormData({...eventFormData, desc: e.target.value})} />
                  
                  <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem' }}>
                    <button className="form-submit" style={{ flex: 1 }} onClick={async () => {
                      if (!eventFormData.id || !eventFormData.name) return alert("Slug and Name are required.");
                      try {
                        await setDoc(doc(db, "events", eventFormData.id), eventFormData, { merge: true });
                        setEditingEvent(null);
                        alert("Event Saved!");
                      } catch (err) { alert("Error: " + err.message); }
                    }}>SAVE EVENT →</button>
                    <button className="form-submit" style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: '#fff' }} onClick={() => setEditingEvent(null)}>CANCEL</button>
                  </div>
                </div>

                {editingEvent !== 'new' && (
                  <div style={{ marginTop: '3rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                    <h4 style={{ color: 'var(--gold)', marginBottom: '1.5rem' }}>Manage Event Photos</h4>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                      <input className="form-input" style={{ flex: 1 }} placeholder="Paste Direct Image Link (https://...)" value={newEventPhoto} onChange={e => setNewEventPhoto(e.target.value)} />
                      <button className="admin-nav-btn" onClick={async () => {
                        if (!newEventPhoto) return;
                        try {
                          const currentPhotos = liveEvents[editingEvent] || [];
                          await updateDoc(doc(db, "events", editingEvent), {
                            photos: [newEventPhoto, ...currentPhotos]
                          });
                          setNewEventPhoto("");
                        } catch (err) { alert(err.message); }
                      }}>Add Single +</button>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px dashed var(--border)', marginBottom: '2rem' }}>
                      <h5 style={{ fontSize: '0.8rem', color: 'var(--gold)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        🚀 Bulk Image Uploader 
                        <a href="https://beeimg.com/upload" target="_blank" rel="noreferrer" style={{ fontSize: '0.6rem', background: 'var(--gold)', color: 'var(--ink)', padding: '0.2rem 0.5rem', borderRadius: '4px', textDecoration: 'none' }}>Open BeeImg →</a>
                      </h5>
                      <p style={{ fontSize: '0.7rem', opacity: 0.6, marginBottom: '1rem' }}>Upload your images to BeeImg, copy the <strong>Direct Links</strong>, and paste them all below (separated by spaces or lines).</p>
                      <textarea 
                        className="form-input" 
                        style={{ minHeight: '120px', fontSize: '0.75rem', fontFamily: 'monospace' }} 
                        placeholder="Paste multiple links here... https://beeimg.com/images/1.jpg https://beeimg.com/images/2.jpg"
                        value={bulkInput}
                        onChange={e => setBulkInput(e.target.value)}
                      />
                      <button className="form-submit" style={{ marginTop: '1rem', width: '100%', fontSize: '0.75rem' }} onClick={async () => {
                        const urls = bulkInput.split(/\s+/).filter(u => u.startsWith("http"));
                        if (urls.length === 0) return alert("No valid links found. Make sure they start with http");
                        try {
                          const current = liveEvents[editingEvent] || [];
                          await updateDoc(doc(db, "events", editingEvent), {
                            photos: [...urls, ...current]
                          });
                          setBulkInput("");
                          alert(`${urls.length} photos added successfully!`);
                        } catch (err) { alert(err.message); }
                      }}>DUMP BULK PHOTOS →</button>
                    </div>

                    <h4 style={{ color: 'var(--gold)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
                      Gallery Preview 
                      <span style={{ fontSize: '0.6rem', opacity: 0.5, fontWeight: 'normal' }}>🖱️ Drag photos to reorder</span>
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' }}>
                      {(liveEvents[editingEvent] || []).map((url, idx) => (
                        <div 
                          key={idx} 
                          style={{ position: 'relative', cursor: 'move', transition: 'transform 0.2s' }}
                          draggable="true"
                          onDragStart={(e) => handleDragStart(e, idx)}
                          onDragEnd={handleDragEnd}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, idx)}
                        >
                          <img src={url} alt="" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px', border: draggedItemIndex === idx ? '2px solid var(--gold)' : '1px solid var(--border)' }} referrerPolicy="no-referrer" />
                          <button onClick={async () => {
                            if (window.confirm("Remove this photo?")) {
                              const updated = liveEvents[editingEvent].filter((_, i) => i !== idx);
                              await updateDoc(doc(db, "events", editingEvent), { photos: updated });
                            }
                          }} style={{ position: 'absolute', top: 5, right: 5, background: '#ff4444', border: 'none', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>×</button>
                          <div style={{ position: 'absolute', bottom: 5, left: 5, background: 'rgba(0,0,0,0.5)', padding: '2px 5px', borderRadius: '4px', fontSize: '8px', pointerEvents: 'none' }}>#{idx + 1}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="admin-table-wrap" style={{ overflowX: 'auto', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '1rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                      <th style={{ padding: '1rem' }}>Emoji</th>
                      <th style={{ padding: '1rem' }}>Event Name</th>
                      <th style={{ padding: '1rem' }}>Status</th>
                      <th style={{ padding: '1rem' }}>Photos</th>
                      <th style={{ padding: '1rem' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveEventsList.map(ev => (
                      <tr key={ev.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '1rem', fontSize: '1.2rem' }}>{ev.emoji}</td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: '600' }}>{ev.name}</div>
                          <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>{ev.id}</div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', background: ev.comingSoon ? 'rgba(255,153,51,0.1)' : 'rgba(168,216,168,0.1)', color: ev.comingSoon ? '#ff9933' : '#a8d8a8' }}>
                            {ev.comingSoon ? 'Coming Soon' : 'Live'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>{(liveEvents[ev.id] || []).length} photos</td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => {
                              setEditingEvent(ev.id);
                              setEventFormData(ev);
                            }} style={{ background: 'var(--gold)', border: 'none', color: 'var(--ink)', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}>Edit</button>
                            <button onClick={async () => {
                              if (window.confirm("Delete this event and ALL its photos?")) {
                                try {
                                  await deleteDoc(doc(db, "events", ev.id));
                                  alert("Event deleted.");
                                } catch (err) { alert(err.message); }
                              }
                            }} style={{ background: '#ff4444', border: 'none', color: '#fff', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── EVENT PAGE COMPONENT ───────────────────────────────────────────────────

function EventPage({ event, liveEvents, onClose, setLightboxItem, isGlobal }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const isVarnakriti = event.id === "varnakriti";

  // Get photos based on mode
  const getPhotos = () => {
    if (isGlobal) {
      // Flatten all photos from all events
      return Object.values(liveEvents).flat().reverse(); // Reverse to show newest first (assuming newest are added last)
    }
    const p = liveEvents[event.id] || [];
    if (Array.isArray(p)) return p;
    return [...(p.general || []), ...(p.prize || []), ...(p.winners || [])];
  };

  const photos = getPhotos();

  return (
    <div className="event-page-overlay">
      <div className="container">
        <header className="event-page-header">
          <button className="back-btn" onClick={onClose}>← Back to Home</button>
          <div className="section-label">{isGlobal ? "Universal Archive" : "Event Showcase"}</div>
          <h1 className="section-title">{event.name} <em>Glimpse</em></h1>
          <p className="section-sub">{event.desc}</p>
        </header>

        {isVarnakriti && !Array.isArray(liveEvents[event.id]) && !isGlobal ? (
          <div className="varnakriti-sections">
            <EventSection title="Exhibition" subtitle="General" photos={liveEvents[event.id].general} setLightboxItem={setLightboxItem} onClose={onClose} />
            <EventSection title="Awards" subtitle="Prize Distribution" photos={liveEvents[event.id].prize} setLightboxItem={setLightboxItem} onClose={onClose} />
            <EventSection title="Winners" subtitle="Photography Excellence" photos={liveEvents[event.id].winners} setLightboxItem={setLightboxItem} onClose={onClose} />
          </div>
        ) : (
          <EventSection title={isGlobal ? "All Memories" : "Gallery"} subtitle={isGlobal ? "Timeline" : "Highlights"} photos={photos} setLightboxItem={setLightboxItem} onClose={onClose} />
        )}
      </div>
    </div>
  );
}

function EventSection({ title, subtitle, photos, setLightboxItem, onClose }) {
  const [searchTerm, setSearchTerm] = useState("");
  if (!photos || photos.length === 0) return null;

  const filteredPhotos = photos.filter((_, i) => 
    `IMG_${1000 + i}.JPG`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="event-detail-section fade-in visible">
      <div className="explorer-header">
        <div className="explorer-toolbar">
          <div className="explorer-path">
            <span className="path-root" onClick={onClose} style={{ cursor: 'pointer' }}>Events</span>
            <span className="path-sep">/</span>
            <span className="path-folder">{subtitle}</span>
            <span className="path-sep">/</span>
            <span className="path-current">{title}</span>
          </div>
          <div className="explorer-actions">
            <div className="explorer-search">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Search images..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="explorer-info">{filteredPhotos.length} Items</div>
          </div>
        </div>
      </div>
      
      <div className="gallery-grid-system">
        {filteredPhotos.map((p, i) => (
          <div 
            key={i} 
            className="gallery-grid-item" 
            style={{ "--delay": `${(i % 12) * 0.05}s` }}
            onClick={() => setLightboxItem({
              url: p,
              title: title,
              photographer: "Capture Crew",
              dept: subtitle,
              year: "2026"
            })}
          >
            <div className="grid-item-inner">
              <img src={p} alt={title} loading="lazy" referrerPolicy="no-referrer" />
              <div className="grid-item-meta">
                <span className="file-icon">📷</span>
                <span className="file-name">IMG_{1000 + photos.indexOf(p)}.JPG</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {filteredPhotos.length === 0 && (
        <div className="no-results">No images found matching "{searchTerm}"</div>
      )}
    </div>
  );
}

// ─── RECRUITMENT MODAL ──────────────────────────────────────────────────────
// ─── RECRUITMENT COMPONENTS ────────────────────────────────────────────────
function AdminApplications() {
  const [apps, setApps] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "applications"), orderBy("timestamp", "desc"));
    return onSnapshot(q, (s) => setApps(s.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  return (
    <div className="admin-grid-view">
      <div className="admin-table-wrap" style={{ overflowX: 'auto', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
              <th style={{ padding: '1rem' }}>Applicant</th>
              <th style={{ padding: '1rem' }}>Position</th>
              <th style={{ padding: '1rem' }}>Contact Info</th>
              <th style={{ padding: '1rem' }}>Portfolio</th>
              <th style={{ padding: '1rem' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {apps.map(app => (
              <tr key={app.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: '600' }}>{app.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--gold)' }}>{app.dept} · {app.year}</div>
                </td>
                <td style={{ padding: '1rem' }}>{app.position}</td>
                <td style={{ padding: '1rem' }}>
                  <div>{app.email}</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>{app.phone}</div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <a href={app.portfolio} target="_blank" rel="noreferrer" style={{ color: 'var(--gold)', textDecoration: 'none' }}>View Link</a>
                </td>
                <td style={{ padding: '1rem' }}>
                  <button onClick={() => deleteDoc(doc(db, "applications", app.id))} style={{ background: '#ff4444', border: 'none', color: '#fff', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {apps.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>No applications yet.</div>}
      </div>
    </div>
  );
}

function MemberForm({ DEPTS, YEARS, onAdded }) {
  const [data, setData] = useState({ name: "", dept: DEPTS[0], year: YEARS[0] });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data.name.trim()) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "members"), {
        ...data,
        role: "Member",
        createdAt: serverTimestamp()
      });
      setData({ name: "", dept: DEPTS[0], year: YEARS[0] });
      onAdded();
      alert("Member Added Successfully!");
    } catch (err) {
      alert("Error adding member: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="feedback-form" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }} onSubmit={handleSubmit}>
      <input className="form-input" placeholder="Student Name" value={data.name} onChange={e => setData({...data, name: e.target.value})} required />
      <select className="form-input" value={data.dept} onChange={e => setData({...data, dept: e.target.value})}>
        {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
      </select>
      <select className="form-input" value={data.year} onChange={e => setData({...data, year: e.target.value})}>
        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
      </select>
      <button className="form-submit" type="submit" disabled={loading} style={{ gridColumn: '1 / -1' }}>
        {loading ? "Adding..." : "Add Member →"}
      </button>
    </form>
  );
}

function RecruitmentModal({ onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', dept: '', year: '', positions: [], portfolio: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.positions.length === 0) {
      alert("Please select at least one position.");
      return;
    }
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "applications"), {
        ...formData,
        position: formData.positions.join(', '),
        timestamp: serverTimestamp()
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Submission error:", err);
      alert("Submission failed. Please check your internet.");
    } finally { setIsSubmitting(false); }
  };

  const togglePosition = (pos) => {
    setFormData(prev => ({
      ...prev,
      positions: prev.positions.includes(pos)
        ? prev.positions.filter(p => p !== pos)
        : [...prev.positions, pos]
    }));
  };

  const POSITIONS = ["Graphic Designer", "Video Editor", "Videographer", "Photographer", "Photo Editor", "PR Manager", "Content Writer", "Social Media Manager"];

  if (submitted) {
    return (
      <div className="lightbox open" onClick={onClose}>
        <div className="admin-modal glass-form fade-in visible" onClick={e => e.stopPropagation()} style={{ textAlign: 'center', maxWidth: '450px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>✨</div>
          <h2 className="section-title">Application <em>Sent!</em></h2>
          <p className="section-sub">Your application has been received. We'll be in touch soon!</p>
          <button className="form-submit" onClick={onClose} style={{ marginTop: '2.5rem', width: '100%' }}>Return to Site</button>
        </div>
      </div>
    );
  }

  return (
    <div className="lightbox open" onClick={onClose}>
      <div className="admin-modal glass-form fade-in visible" onClick={e => e.stopPropagation()} style={{ maxWidth: '650px' }}>
        <button className="lightbox-close" onClick={onClose} style={{ top: '2rem', right: '2rem' }}>✕</button>
        <div className="section-label">✦ Join our legacy</div>
        <h2 className="section-title" style={{ fontSize: '2.5rem' }}>The <em>Core Team</em></h2>
        <p className="section-sub" style={{ marginBottom: '3rem' }}>We are looking for creative souls. Apply below.</p>
        
        <form className="feedback-form" style={{ background: 'transparent', padding: '0', boxShadow: 'none' }} onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', textAlign: 'left' }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="week-credit-role" style={{ display: 'block', marginBottom: '0.6rem', color: 'var(--gold)', fontSize: '0.7rem' }}>Full Name</label>
              <input className="form-input" placeholder="e.g. John Doe" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="week-credit-role" style={{ display: 'block', marginBottom: '0.6rem', color: 'var(--gold)', fontSize: '0.7rem' }}>Email Address</label>
              <input className="form-input" type="email" placeholder="john@example.com" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="week-credit-role" style={{ display: 'block', marginBottom: '0.6rem', color: 'var(--gold)', fontSize: '0.7rem' }}>WhatsApp No.</label>
              <input className="form-input" placeholder="+91 XXXX" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="week-credit-role" style={{ display: 'block', marginBottom: '0.6rem', color: 'var(--gold)', fontSize: '0.7rem' }}>Department</label>
              <select className="form-input" style={{ appearance: 'none' }} required value={formData.dept} onChange={e => setFormData({...formData, dept: e.target.value})}>
                <option value="" style={{ background: '#111' }}>Select Dept</option>
                <option style={{ background: '#111' }}>CSE</option><option style={{ background: '#111' }}>ECE</option><option style={{ background: '#111' }}>EE</option><option style={{ background: '#111' }}>ME</option><option style={{ background: '#111' }}>CE</option>
              </select>
            </div>
            <div className="form-group">
              <label className="week-credit-role" style={{ display: 'block', marginBottom: '0.6rem', color: 'var(--gold)', fontSize: '0.7rem' }}>Academic Year</label>
              <select className="form-input" style={{ appearance: 'none' }} required value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})}>
                <option value="" style={{ background: '#111' }}>Select Year</option>
                <option style={{ background: '#111' }}>1st Year</option><option style={{ background: '#111' }}>2nd Year</option><option style={{ background: '#111' }}>3rd Year</option><option style={{ background: '#111' }}>4th Year</option>
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="week-credit-role" style={{ display: 'block', marginBottom: '1rem', color: 'var(--gold)', fontSize: '0.75rem', fontWeight: 'bold' }}>Positions you're applying for (Select all that apply)</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.8rem' }}>
                {POSITIONS.map(pos => (
                  <div 
                    key={pos} 
                    onClick={() => togglePosition(pos)}
                    style={{ 
                      padding: '0.8rem 1rem', 
                      borderRadius: '8px', 
                      background: formData.positions.includes(pos) ? 'var(--gold)' : 'rgba(255,255,255,0.03)',
                      color: formData.positions.includes(pos) ? 'var(--ink)' : 'var(--white)',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: formData.positions.includes(pos) ? 'var(--gold)' : 'rgba(255,255,255,0.1)',
                      transition: 'all 0.2s ease',
                      textAlign: 'center',
                      fontWeight: formData.positions.includes(pos) ? 'bold' : 'normal'
                    }}
                  >
                    {pos}
                  </div>
                ))}
              </div>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="week-credit-role" style={{ display: 'block', marginBottom: '0.6rem', color: 'var(--gold)', fontSize: '0.7rem' }}>Portfolio Link (G-Drive / Behance)</label>
              <input className="form-input" placeholder="https://..." required value={formData.portfolio} onChange={e => setFormData({...formData, portfolio: e.target.value})} />
            </div>
          </div>
          <button className="form-submit" type="submit" disabled={isSubmitting} style={{ marginTop: '2.5rem', width: '100%' }}>
            {isSubmitting ? "PROCESSING..." : "SUBMIT APPLICATION →"}
          </button>
        </form>
      </div>
    </div>
  );
}
