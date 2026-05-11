import { useState, useEffect, useRef } from "react";
import { db, auth } from "./firebase";
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import placeholderImg from "./assets/placeholder.png";

// ─── PLACEHOLDER DATA ───────────────────────────────────────────────────────

const TEAM_DATA = {
  founders: [
    { name: "Rishad Hoque", role: "Founder", dept: "Batch '24 Passout, CE", img: "/team/Rishad.png" },
    { name: "Arman Mia", role: "Founder", dept: "4th Yr. CSE", img: "/team/Arman.png" },
  ],
  incharge: [
    { name: "Jyotirmoy Mondal", role: "Incharge", dept: "3rd Year EE", img: "/team/Jyotirmoy.png" },
    { name: "Saikat Saha", role: "Incharge", dept: "3rd YR CE", img: "/team/Saikat.png" },
  ],
  coordinators: [
    { name: "Samprada Adhikari", role: "Co-Ordinator", dept: "2nd Yr. ME", img: "/team/Samprada.png" },
    { name: "Nirupam Konar", role: "Co-Ordinator", dept: "2nd Yr. ECE", img: "/team/Nirupam konar.png" },
  ],
  core: [
    { name: "Indrakshi Ghosh", role: "Moderator", dept: "1st Yr. CE", img: "/team/Indrakshi.png" },
    { name: "Nabanita Barman", role: "Photography Lead", dept: "1st Yr. CE", img: "/team/Nabanita.png" },
    { name: "Shreejan Roy", role: "Photographer & Editor", dept: "1st Yr. EE", img: "/team/Shreejan.png" },
    { name: "Arkadeb Thokdar", role: "Photographer & Editor", dept: "1st Yr. ME", img: "/team/Arkadeb.png" },
    { name: "MD Kaif", role: "Photographer", dept: "1st Yr. ECE", img: "/team/MD Kaif.png" },
    { name: "Akash Ghara", role: "Photo Editor", dept: "1st Yr. ME", img: "/team/Akash.png" },
    { name: "Ramanath Hansda", role: "Videography Lead", dept: "1st Yr. CSE", img: "/team/Ramanath.png" },
    { name: "Irfan Ahmed", role: "Videographer", dept: "3rd Yr. CE", img: "/team/Irfan.png" },
    { name: "Biswajyoti Deb", role: "Videographer & PR", dept: "1st Yr. CSE", img: "/team/Biswajyoti.png" },
    { name: "Priyanshu Mondal", role: "Videographer", dept: "1st Yr. ME", img: "/team/Priyanshu Mondal.png" },
    { name: "Snehashis Ghosh", role: "Video Editor", dept: "2nd Yr. EE", img: "/team/Snehashish.png" },
    { name: "Harasundar Patra", role: "Video Editor & Designer", dept: "2nd Yr. ME", img: "/team/Harasundar.png" },
    { name: "Balaram Mardi", role: "Video Editor", dept: "3rd Yr. EE", img: "/team/Balaram Mardi.png" },
    { name: "Dibyendu Kumar Kundu", role: "Video Editor & Designer", dept: "1st Yr. ECE", img: "/team/Dibyendu.png" },
    { name: "Sampreety Swarnakar", role: "Content Writer", dept: "2nd Yr. ECE", img: "/team/Sampreety.png" },
    { name: "Ankur Shit", role: "Content Writer & PR", dept: "1st Yr. CSE", img: "/team/Ankur.png" },
    { name: "Priyanshu Dhara", role: "Authenticity Verifier", dept: "3rd Yr. ME", img: "/team/Priyanshu Dhara.png" },
    { name: "Sabarno Mondal", role: "PR Manager", dept: "1st Yr. EE", img: "/team/Sabarno Mondal.png" },
  ]
};

const EVENTS = [
  {
    id: "varnakriti",
    name: "VARNAKRITI",
    subtitle: "Annual Photo Exhibition",
    date: "March 2024",
    color: "#C9A96E",
    desc: "Our flagship photo exhibition where the finest captures of the year are displayed on a gallery wall. Features a Top 3 Winners showcase with award ceremony.",
    highlight: "Top 3 Winners crowned. 60+ photos on display.",
    emoji: "🏆",
  },
  {
    id: "esperanza",
    name: "ESPERANZA",
    subtitle: "Annual Flagship Event",
    date: "February 2024",
    color: "#7EB8D4",
    desc: "The grand annual celebration of Capture Crew — a full-day photo walk, workshop, and exhibition bringing together photography enthusiasts from across the campus.",
    highlight: "500+ attendees. Campus-wide photo walk.",
    emoji: "🌟",
  },
  {
    id: "croeso",
    name: "CROESO",
    subtitle: "Freshers' Welcome",
    date: "September 2023",
    color: "#A8D8A8",
    desc: "A warm welcome for first-year students into the world of photography. Introductory sessions, camera handling workshops, and a mini photo-walk across campus.",
    highlight: "Welcome to the frame. New eyes, new stories.",
    emoji: "🎓",
  },
  {
    id: "independence",
    name: "Independence Day",
    subtitle: "15th August Special",
    date: "August 2023",
    color: "#FF9933",
    desc: "Capturing the spirit of patriotism through the lens — flag hoisting ceremonies, portrait sessions, and a special themed photo series celebrating India's independence.",
    highlight: "Tricolor through the lens.",
    emoji: "🇮🇳",
  },
  {
    id: "saraswati",
    name: "Saraswati Puja",
    subtitle: "Festival Documentation",
    date: "January 2024",
    color: "#DEB8D0",
    desc: "Documenting the beauty and devotion of Saraswati Puja on campus — from the early morning rituals to the immersion procession, captured with reverence and artistry.",
    highlight: "Devotion in every frame.",
    emoji: "🌸",
  },
  {
    id: "holi",
    name: "Holi Event",
    subtitle: "Festival of Colors",
    date: "March 2024",
    color: "#FF69B4",
    desc: "Celebrating the vibrant festival of colors with the Capture Crew family. A day of joy, togetherness, and splash of colors captured in every frame.",
    highlight: "Vibrance in every splash.",
    emoji: "🎨",
  },
];

const GALLERY_CATEGORIES = ["All", "Weekly Captures", "Monthly Captures", "Event Photography"];

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
    story: "Silence turns into beauty."
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
    story: "Bridges don't just connect places, they connect stories."
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
    story: "Where silence turns into beauty."
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
    story: "Nature painted this morning with rays of gold."
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
    story: "Timeless elegance at Cooch Behar Rajbari."
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
    story: "Saath saath woh hai mere."
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
    story: "The train may be late, but the memories arrive on time."
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
    story: "Where dreams once sat in classrooms, now the silence writes its own story."
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
    story: "Where the water whispers and the hills smile back."
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
    story: "Capturing the void."
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
    story: "Nature doesn't rush, yet everything feels perfect here."
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
    story: "A lone tree, a golden field, and a sky that feels like a dream."
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
    story: "Summer vibes in a frame."
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
    story: "Under a sky of fairy lights and whispered wishes."
  }
];

const WEEK_CAPTURE = GALLERY[3]; // Akash Ghara's "Nature painted"

const MONTH_CAPTURES = [
  GALLERY[13], // Akash Ghara's "Celebration Night"
  GALLERY[12], // Jyotirmoy Mondal
  GALLERY[11]  // Prince Mahato
];

// ─── APP ────────────────────────────────────────────────────────────────────

export default function App() {
  const [navScrolled, setNavScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [galleryFilter, setGalleryFilter] = useState("All");
  const [lightboxItem, setLightboxItem] = useState(null);
  const [monthSlide, setMonthSlide] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [heroImg, setHeroImg] = useState(GALLERY[0].url);
  
  // Certificate State
  const [certId, setCertId] = useState("");
  const [verifyResult, setVerifyResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Admin State
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [adminSection, setAdminSection] = useState("certificates");

  // Random Hero on load
  useEffect(() => {
    const randomImg = GALLERY[Math.floor(Math.random() * GALLERY.length)].url;
    setHeroImg(randomImg);
  }, []);

  // Nav scroll
  useEffect(() => {
    const fn = () => setNavScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
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
  }, [galleryFilter]);

  // Lightbox esc
  useEffect(() => {
    const fn = e => e.key === "Escape" && setLightboxItem(null);
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  // Auth Listener
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

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

  const filteredGallery = galleryFilter === "All"
    ? GALLERY
    : GALLERY.filter(g => g.category === galleryFilter);

  return (
    <>
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
          {[["home","Home"],["week","Week"],["month","Month"],["gallery","Gallery"],["events","Events"],["team","Team"],["feedback","Feedback"]].map(([id, label]) => (
            <li key={id} className={activeSection === id ? "active" : ""} onClick={() => scrollTo(id)}>{label}</li>
          ))}
        </ul>
      </nav>

      {/* HERO */}
      <section id="home" className="hero">
        <div className="hero-bg">
          <div
            className="hero-slide active"
            style={{ backgroundImage: `url(${heroImg})` }}
          />
          <div className="hero-overlay" />
        </div>
        <div className="hero-content">
          <div className="hero-eyebrow">Capture Crew · CGEC Photography Club</div>
          <h1 className="hero-title">
            Framing <em>Moments.</em><br />Preserving Memories.
          </h1>
          <p className="hero-tagline">Where light meets intention and stories live forever in a frame.</p>
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
              <img src={WEEK_CAPTURE.url} alt={WEEK_CAPTURE.title} className="week-img" />
              <div className="week-badge">This Week's Pick</div>
            </div>
            <div className="week-info">
              <div className="week-date">Featured</div>
              <h3 className="week-title">{WEEK_CAPTURE.title}</h3>
              <p className="week-story">{WEEK_CAPTURE.story}</p>
              <div className="week-credit">
                <div className="week-avatar">📷</div>
                <div>
                  <div className="week-credit-name">{WEEK_CAPTURE.photographer}</div>
                  <div className="week-credit-role">{WEEK_CAPTURE.dept} · {WEEK_CAPTURE.year}</div>
                </div>
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
            <div className="month-nav">
              <button className="month-nav-btn" onClick={() => setMonthSlide(s => (s - 1 + MONTH_CAPTURES.length) % MONTH_CAPTURES.length)}>←</button>
              <button className="month-nav-btn" onClick={() => setMonthSlide(s => (s + 1) % MONTH_CAPTURES.length)}>→</button>
            </div>
          </div>
          <div className="month-slide fade-in">
            <div className="month-image-wrap">
              <img src={MONTH_CAPTURES[monthSlide].url} alt={MONTH_CAPTURES[monthSlide].title} className="month-img" />
              <div className="month-frame" />
              <div className="month-award">
                <div className="month-award-text">BEST<br/>OF<br/>MONTH</div>
              </div>
            </div>
            <div className="month-info">
              <div className="month-of">Premium Selection</div>
              <h3 className="month-title">{MONTH_CAPTURES[monthSlide].title}</h3>
              <p className="month-story">{MONTH_CAPTURES[monthSlide].story}</p>
              <div className="month-photographer">
                By <span>{MONTH_CAPTURES[monthSlide].photographer}</span> ({MONTH_CAPTURES[monthSlide].dept})
              </div>
              <div className="month-dots">
                {MONTH_CAPTURES.map((_, i) => (
                  <button key={i} className={`month-dot ${i === monthSlide ? "active" : ""}`} onClick={() => setMonthSlide(i)} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

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
            {filteredGallery.map(item => (
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
            {EVENTS.map(ev => (
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
                <button className="event-dive-btn" onClick={() => setSelectedEvent(ev)}>Dive In →</button>
              </div>
            ))}
          </div>
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
              <h3 className="subcategory-title">The <em>Founders</em></h3>
              <div className="team-grid founders-grid">
                {TEAM_DATA.founders.map(m => (
                  <div key={m.name} className="team-card founder-card fade-in">
                    <div className="team-avatar highlight">
                      <img src={m.img} alt={m.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
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
                  <div key={m.name} className="team-card incharge-card fade-in">
                    <div className="team-avatar highlight-silver">
                      <img src={m.img} alt={m.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
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
                  <div key={m.name} className="team-card fade-in">
                    <div className="team-avatar">
                      <img src={m.img} alt={m.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
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
                {TEAM_DATA.core.map(m => (
                  <div key={m.name} className="team-card fade-in">
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

      {/* FEEDBACK */}
      <section id="feedback" className="feedback-section">
        <div className="container">
          <div className="feedback-inner">
            <div className="feedback-aside fade-in">
              <div className="section-label">✦ Your Voice</div>
              <div className="feedback-quote">
                Every frame tells a story.<br />
                <em>Tell us yours.</em>
              </div>
              <p className="feedback-note">
                Share your thoughts, suggestions, or appreciation with the Capture Crew team. Your feedback helps us grow as photographers and storytellers.
              </p>
            </div>
            <div className="feedback-form fade-in">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" type="text" placeholder="Your name" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" placeholder="your@email.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea className="form-textarea" rows={5} placeholder="Share your thoughts..." />
              </div>
              <button className="form-submit">Send Message →</button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer-inner">
            <div>
              <div className="footer-brand">Capture <span>Crew</span></div>
              <div className="footer-college">Photography Club · Cooch Behar Government Engineering College</div>
            </div>
            <div className="footer-links">
              {[["home","Home"],["gallery","Gallery"],["events","Events"],["team","Team"],["verify","Verify"]].map(([id, label]) => (
                <a key={id} onClick={() => scrollTo(id)}>{label}</a>
              ))}
              <a onClick={() => setShowLogin(true)}>Admin Login</a>
            </div>
            <div className="footer-copy">
              © 2026 Capture Crew · All rights reserved <br />
              <span className="made-by">Made with <span className="heart">❤️</span> by <a href="https://www.instagram.com/destructive_antagonist/" target="_blank" rel="noopener noreferrer">Arkadeb</a></span>
            </div>
          </div>
        </div>
      </footer>

      {/* LIGHTBOX */}
      <div className={`lightbox ${lightboxItem ? "open" : ""}`} onClick={() => setLightboxItem(null)}>
        <button className="lightbox-close" onClick={() => setLightboxItem(null)}>✕</button>
        {lightboxItem && (
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <div
              className="lightbox-img"
              style={{
                backgroundImage: `url(${lightboxItem.url})`,
                width: "70vw", height: "55vh",
              }}
            />
            <div className="lightbox-title">{lightboxItem.title}</div>
            <div className="lightbox-credit">by {lightboxItem.photographer} · {lightboxItem.dept} ({lightboxItem.year})</div>
          </div>
        )}
      </div>
      {/* MODALS */}
      {selectedEvent && (
        <EventPage event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
      {showLogin && !user && (
        <LoginModal onClose={() => setShowLogin(false)} />
      )}
      {user && showLogin && (
        <AdminDashboard user={user} onClose={() => setShowLogin(false)} />
      )}
    </>
  );
}

// ─── ADMIN COMPONENTS ───────────────────────────────────────────────────────

function LoginModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onClose();
    } catch (err) {
      setError("Invalid credentials. Core Team access only.");
    }
  };

  return (
    <div className="lightbox open" onClick={onClose}>
      <div className="lightbox-content admin-modal" onClick={e => e.stopPropagation()}>
        <button className="lightbox-close" onClick={onClose}>✕</button>
        <div className="section-label">Restricted Access</div>
        <h2 className="section-title">Team <em>Login</em></h2>
        <form className="feedback-form" style={{ marginTop: '2rem' }} onSubmit={handleLogin}>
          <input className="form-input" type="email" placeholder="Admin Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input className="form-input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          {error && <p style={{ color: '#ff4d4d', fontSize: '0.8rem' }}>{error}</p>}
          <button className="form-submit" type="submit">Access Dashboard →</button>
        </form>
      </div>
    </div>
  );
}

function AdminDashboard({ user, onClose }) {
  const [tab, setTab] = useState("certs");
  const [certs, setCerts] = useState([]);
  const [newCert, setNewCert] = useState({ name: "", serialNo: "", date: "", event: "" });

  useEffect(() => {
    const fetchCerts = async () => {
      const snap = await getDocs(collection(db, "certificates"));
      setCerts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchCerts();
  }, []);

  const addCert = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "certificates"), newCert);
    setNewCert({ name: "", serialNo: "", date: "", event: "" });
    // Refresh
    const snap = await getDocs(collection(db, "certificates"));
    setCerts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  return (
    <div className="event-page-overlay">
      <div className="container">
        <header className="event-page-header">
          <button className="back-btn" onClick={onClose}>← Close Dashboard</button>
          <div className="section-label">Admin Console</div>
          <h1 className="section-title">Team <em>Dashboard</em></h1>
          <p className="section-sub">Welcome back. You can manage certificates and site content here.</p>
          <button className="event-dive-btn" style={{ position: 'absolute', top: '-1rem', right: 0 }} onClick={() => signOut(auth)}>Sign Out</button>
        </header>

        <div className="gallery-filter">
          <button className={`filter-btn ${tab === 'certs' ? 'active' : ''}`} onClick={() => setTab('certs')}>Certificates</button>
          <button className={`filter-btn ${tab === 'gallery' ? 'active' : ''}`} onClick={() => setTab('gallery')}>Uploads</button>
        </div>

        {tab === 'certs' && (
          <div className="fade-in visible">
            <h3 className="subcategory-title">Issue <em>Certificate</em></h3>
            <form className="feedback-form" style={{ marginBottom: '4rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} onSubmit={addCert}>
              <input className="form-input" placeholder="Student Name" value={newCert.name} onChange={e => setNewCert({...newCert, name: e.target.value})} required />
              <input className="form-input" placeholder="Serial No (CC-XXXX)" value={newCert.serialNo} onChange={e => setNewCert({...newCert, serialNo: e.target.value})} required />
              <input className="form-input" placeholder="Issue Date" value={newCert.date} onChange={e => setNewCert({...newCert, date: e.target.value})} required />
              <input className="form-input" placeholder="Event Name" value={newCert.event} onChange={e => setNewCert({...newCert, event: e.target.value})} required />
              <button className="form-submit" type="submit" style={{ gridColumn: 'span 2' }}>Issue Certificate →</button>
            </form>

            <h3 className="subcategory-title">Active <em>Records</em></h3>
            <div className="events-grid">
              {certs.map(c => (
                <div key={c.id} className="event-card" style={{ padding: '1.5rem' }}>
                  <div className="team-name" style={{ fontSize: '1rem' }}>{c.name}</div>
                  <div className="event-subtitle" style={{ fontSize: '0.65rem' }}>{c.serialNo}</div>
                  <div className="event-date">{c.date} · {c.event}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {tab === 'gallery' && (
          <div className="fade-in visible" style={{ textAlign: 'center', padding: '5rem 0' }}>
            <p className="section-sub">Gallery upload and Week/Month picker integration coming in next phase.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── EVENT PAGE COMPONENT ───────────────────────────────────────────────────

function EventPage({ event, onClose }) {
  const [activeSlide, setActiveSlide] = useState(0);

  const eventPhotos = {
    varnakriti: {
      general: ["/events/varnakriti/events/image (1).png", "/events/varnakriti/events/image.png", "/events/varnakriti/events/SaveClip.App_634440523_17913157053299557_2777657706342258186_n.jpg"],
      prize: Array.from({ length: 12 }, (_, i) => `/events/varnakriti/prize/image${i === 0 ? "" : ` (${i+1})`}.png`),
      winners: ["/events/varnakriti/winners/SaveClip.App_640302939_17960191608051405_7355162228165538329_n.jpg", "/events/varnakriti/winners/SaveClip.App_640396337_17960191617051405_8629856469985778477_n.jpg", "/events/varnakriti/winners/SaveClip.App_640415008_17960191587051405_6590193589515239244_n.jpg"]
    },
    croeso: ["/events/croeso/image (2).png", "/events/croeso/image.png", "/events/croeso/t's a time to disco ....Captured byArkadeb Thokdar, 1st yr. ME..jpg"],
    holi: ["SaveClip.App_642148216_17961485553051405_8385715078758128532_n.jpg", "SaveClip.App_642529503_17961485511051405_131829195843355943_n.jpg", "SaveClip.App_642635932_17961485550051405_2472211186656361010_n.jpg", "SaveClip.App_642666667_17961485388051405_2814668728871964987_n.jpg", "SaveClip.App_642683403_17961485373051405_7735649280446324333_n.jpg", "SaveClip.App_642698762_17961485562051405_1727925144419840966_n.jpg", "SaveClip.App_642709633_17961485523051405_6942903691962638290_n.jpg", "SaveClip.App_645446133_17961485409051405_3632317390478327203_n.jpg", "SaveClip.App_648129421_17961485535051405_4433441016486177670_n.jpg", "SaveClip.App_648768061_17961485364051405_841916865367389342_n.jpg"].map(f => `/events/holi/${f}`)
  };

  const photos = eventPhotos[event.id] || [];
  const isVarnakriti = event.id === "varnakriti";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="event-page-overlay">
      <div className="container">
        <header className="event-page-header">
          <button className="back-btn" onClick={onClose}>← Back to Home</button>
          <div className="section-label">Event Showcase</div>
          <h1 className="section-title">{event.name} <em>Glimpse</em></h1>
          <p className="section-sub">{event.desc}</p>
        </header>

        {isVarnakriti ? (
          <div className="varnakriti-sections">
            <EventSection title="The Exhibition" subtitle="Event Moments" photos={eventPhotos.varnakriti.general} />
            <EventSection title="Prize Distribution" subtitle="Celebrating Excellence" photos={eventPhotos.varnakriti.prize} />
            <EventSection title="The Winners" subtitle="Photography Excellence" photos={eventPhotos.varnakriti.winners} />
          </div>
        ) : (
          <EventSection title="Event Highlights" subtitle="Captured Moments" photos={Array.isArray(photos) ? photos : []} />
        )}
      </div>
    </div>
  );
}

function EventSection({ title, subtitle, photos }) {
  // Duplicate photos for seamless marquee loop
  const displayPhotos = [...photos, ...photos];

  return (
    <div className="event-detail-section fade-in visible">
      <div className="section-label">{subtitle}</div>
      <h2 className="section-title">{title}</h2>
      <div className="event-carousel">
        <div className="marquee-track">
          {displayPhotos.map((p, i) => (
            <div key={i} className="carousel-item">
              <img src={p} alt={title} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
