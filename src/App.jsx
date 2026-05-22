import { useState, useEffect, useRef } from "react";
import { Routes, Route, Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { db, auth } from "./firebase";
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc, getDoc, orderBy, onSnapshot, serverTimestamp, writeBatch } from "firebase/firestore";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import placeholderImg from "./assets/placeholder.png";

// ✦✦✦ PLACEHOLDER DATA ✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦──

const TEAM_DATA = {
  founders: [
    { name: "Rishad Hoque", role: "Founder", dept: "Batch '24 Passout, CE", img: "/team/Rishad.png", insta: "https://www.instagram.com/rishad_hoque/" },
    { name: "Arman Mia", role: "Founder", dept: "4th Yr. CSE", img: "/team/Arman.png", insta: "https://www.instagram.com/arman_ansari.13/" },
  ],
  incharge: [
    { name: "Jyotirmoy Mondal", role: "Incharge", dept: "3rd Yr. EE", img: "https://beeimg.com/images/b69604998711.png", insta: "https://www.instagram.com/flybyfifteen/" },
    { name: "Saikat Saha", role: "Incharge", dept: "3rd Yr. CE", img: "https://beeimg.com/images/b93153899401.png", insta: "https://www.instagram.com/_riz_saha_/" },
  ],
  coordinators: [
    { name: "Samprada Adhikari", role: "Co-Ordinator", dept: "2nd Yr. ME", img: "https://beeimg.com/images/n41952554491.png" },
    { name: "Nirupam Konar", role: "Co-Ordinator", dept: "2nd Yr. ECE", img: "https://beeimg.com/images/w57847418951.png", insta: "https://www.instagram.com/itsnirupam07_/" },
  ],
  core: [
    { name: "Indrakshi Ghosh", role: "Moderator", dept: "1st Yr. CE", img: "https://beeimg.com/images/f26043735174.png", insta: "https://www.instagram.com/indrakshi.______/" },
    { name: "Nabanita Barman", role: "Photography Lead", dept: "1st Yr. CE", img: "https://beeimg.com/images/f45858083874.png", insta: "https://www.instagram.com/nabonitaaaaaaa/" },
    { name: "Shreejan Roy", role: "Photographer & Editor", dept: "1st Yr. EE", img: "https://beeimg.com/images/a00498169822.png", insta: "https://www.instagram.com/snapbyjaan/" },
    { name: "Arkadeb Thokdar", role: "Photographer & Editor", dept: "1st Yr. ME", img: "https://beeimg.com/images/u60184176212.png", insta: "https://www.instagram.com/destructive_antagonist/" },
    { name: "MD Kaif", role: "Photographer", dept: "1st Yr. ECE", img: "https://beeimg.com/images/z64013800204.png", insta: "https://www.instagram.com/k4if_28/" },
    { name: "Akash Ghara", role: "Photo Editor", dept: "1st Yr. ME", img: "https://beeimg.com/images/x01975698091.png", insta: "https://www.instagram.com/akash_ghara_/" },
    { name: "Ramanath Hansda", role: "Videography Lead", dept: "1st Yr. CSE", img: "https://beeimg.com/images/j40407354383.png", insta: "https://www.instagram.com/_jubatus._09/" },
    { name: "Irfan Ahmed", role: "Videographer", dept: "3rd Yr. CE", img: "https://beeimg.com/images/t53505068661.png", insta: "https://www.instagram.com/irfan.a.verse/" },
    { name: "Biswajyoti Deb", role: "Videographer & PR", dept: "1st Yr. CSE", img: "https://beeimg.com/images/k52178779054.png", insta: "https://www.instagram.com/kami.oni_/" },
    { name: "Priyanshu Mondal", role: "Videographer", dept: "1st Yr. ME", img: "https://beeimg.com/images/n43306411192.png" },
    { name: "Snehashis Ghosh", role: "Video Editor", dept: "2nd Yr. EE", img: "https://beeimg.com/images/e19762527764.png", insta: "https://www.instagram.com/mr_shinchan_editzs/" },
    { name: "Harasundar Patra", role: "Video Editor & Designer", dept: "2nd Yr. ME", img: "https://beeimg.com/images/e77593279463.png", insta: "https://www.instagram.com/harasundar_/" },
    { name: "Balaram Mardi", role: "Video Editor", dept: "3rd Yr. EE", img: "https://beeimg.com/images/h64107582483.png", insta: "https://www.instagram.com/balaram_mardi1/" },
    { name: "Dibyendu Kumar Kundu", role: "Video Editor & Designer", dept: "1st Yr. ECE", img: "https://beeimg.com/images/x58925079154.png", insta: "https://www.instagram.com/_dibyen.du_k_/" },
    { name: "Sampreety Swarnakar", role: "Content Writer", dept: "2nd Yr. ECE", img: "https://beeimg.com/images/v08825476523.png", insta: "https://www.instagram.com/koli.forever/" },
    { name: "Ankur Shit", role: "Content Writer & PR", dept: "1st Yr. CSE", img: "https://beeimg.com/images/q71563764654.png", insta: "https://www.instagram.com/_ankur_shit/" },
    { name: "Priyanshu Dhara", role: "Authenticity Verifier", dept: "3rd Yr. ME", img: "https://beeimg.com/images/t37555738064.png", insta: "https://www.instagram.com/iam_priyansu.12/" },
    { name: "Sabarno Mondal", role: "PR Manager", dept: "1st Yr. EE", img: "https://beeimg.com/images/w97506474033.png", insta: "https://www.instagram.com/culer_mariner_sabarno_10/" },
  ],
  members: []
};

// ✦✦✦ THEME CONFIGURATION ✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦───
const THEMES = [
  { 
    id: 'golden_elegance', 
    name: 'Golden Elegance', 
    primary: '#C9A96E', 
    secondary: '#E8C98A', 
    heading: '#E8C98A',
    surface: '#111114'
  },
  { 
    id: 'midnight_royal', 
    name: 'Midnight Royal', 
    primary: '#D4AF37', 
    secondary: '#F9D976', 
    heading: '#FFFFFF',
    surface: '#0A0E1A'
  },
  { 
    id: 'crimson_velvet', 
    name: 'Crimson Velvet', 
    primary: '#DC143C', 
    secondary: '#FF4D4D', 
    heading: '#FFB3B3',
    surface: '#1A0A0A'
  },
  { 
    id: 'emerald_luxe', 
    name: 'Emerald Luxe', 
    primary: '#50C878', 
    secondary: '#77DD77', 
    heading: '#D1F2D1',
    surface: '#0A1A0F'
  },
  { 
    id: 'ocean_breeze', 
    name: 'Ocean Breeze', 
    primary: '#00CED1', 
    secondary: '#40E0D0', 
    heading: '#E0FFFF',
    surface: '#0A171A'
  },
  { 
    id: 'sunset_glow', 
    name: 'Sunset Glow', 
    primary: '#FF8C00', 
    secondary: '#FFA07A', 
    heading: '#FFE4E1',
    surface: '#1A120A'
  },
  { 
    id: 'amethyst_night', 
    name: 'Amethyst Night', 
    primary: '#9966CC', 
    secondary: '#B399D4', 
    heading: '#F0E6FF',
    surface: '#140A1A'
  },
  { 
    id: 'monochrome_noir', 
    name: 'Monochrome Noir', 
    primary: '#A0A0A0', 
    secondary: '#E0E0E0', 
    heading: '#FFFFFF',
    surface: '#111111'
  }
];

// This will be populated from Firestore
let STATIC_EVENTS = [
  { id: "varnakriti", name: "VARNAKRITI", subtitle: "Annual Photo Exhibition", date: "February 2026", color: "#C9A96E", desc: "Our flagship photo exhibition where the finest captures of the year are displayed on a gallery wall. Features a Top 3 Winners showcase with award ceremony.", highlight: "Top 3 Winners crowned. 30+ photos on display.", emoji: "🏆", iconUrl: "/events/varnakriti/events/image.png", order: 1 },
  { id: "esperanza", name: "ESPERANZA 2k26", subtitle: "Annual Tech Cum Cultural Fest", date: "June 2026", color: "#7EB8D4", desc: "The grand annual celebration of Capture Crew — a full-day photo walk, workshop, and exhibition bringing together photography enthusiasts from across the campus.", highlight: "500+ attendees. Campus-wide photo walk.", emoji: "🌟", comingSoon: true, order: 2 },
  { id: "republic", name: "Republic Day", subtitle: "Patriotic Documentation", date: "January 2026", color: "#FF9933", desc: "Celebrating the 77th Republic Day of India on campus. A day of pride, patriotism, and honoring the constitution through our lenses.", highlight: "Tricolor flag hoisting and cultural documentation.", emoji: "🇮🇳", iconUrl: "https://i.ibb.co/21qSZTTv/image.png", order: 3 },
  { id: "croeso", name: "CROESO 2k25", subtitle: "Freshers' Welcome", date: "February 2026", color: "#A8D8A8", desc: "A warm welcome for first-year students. Introductory sessions, camera handling workshops, and a mini photo-walk across campus.", highlight: "Welcome to the frame. New eyes, new stories.", emoji: "🎓", iconUrl: "/events/croeso/image.png", order: 4 },
  { id: "holi", name: "Holi Event", subtitle: "Festival of Colors", date: "March 2026", color: "#FF69B4", desc: "Celebrating the vibrant festival of colors with the Capture Crew family. A day of joy and splash of colors.", highlight: "Vibrance in every splash.", emoji: "🎨", iconUrl: "/events/holi/SaveClip.App_642148216_17961485553051405_8385715078758128532_n.jpg", order: 5 },
  { id: "saraswati", name: "Saraswati Puja", subtitle: "Festival Documentation", date: "January 2026", color: "#DEB8D0", desc: "Documenting the beauty and devotion of Saraswati Puja on campus — from rituals to the procession.", highlight: "Devotion in every frame.", emoji: "🌸", iconUrl: "https://i.postimg.cc/qMb9T5CS/image.png", order: 6 },
  { id: "independence", name: "Independence Day", subtitle: "15th August Special", date: "August 2026", color: "#FF9933", desc: "Capturing the spirit of patriotism — flag hoisting ceremonies and special themed photo series.", highlight: "Tricolor through the lens.", emoji: "🇮🇳", comingSoon: true, order: 7 }
];

const STATIC_EVENT_ICONS = {
  varnakriti: "/events/varnakriti/events/image.png",
  croeso: "/events/croeso/image.png",
  holi: "/events/holi/SaveClip.App_642148216_17961485553051405_8385715078758128532_n.jpg",
  republic: "https://i.ibb.co/21qSZTTv/image.png",
  saraswati: "https://i.postimg.cc/qMb9T5CS/image.png"
};

const STATIC_EVENT_PHOTOS = {
  varnakriti: {
    general: [
      "/events/varnakriti/events/SaveClip.App_634440523_17913157053299557_2777657706342258186_n.jpg",
      "/events/varnakriti/events/WhatsApp Image 2026-05-11 at 8.55.11 PM.jpeg",
      "/events/varnakriti/events/WhatsApp Image 2026-05-12 at 4.34.07 PM.jpeg",
      "/events/varnakriti/events/image (1).png",
      "/events/varnakriti/events/image.png"
    ],
    prize: [
      "/events/varnakriti/prize/image (1).png",
      "/events/varnakriti/prize/image (10).png",
      "/events/varnakriti/prize/image (11).png",
      "/events/varnakriti/prize/image (12).png",
      "/events/varnakriti/prize/image (2).png",
      "/events/varnakriti/prize/image (3).png",
      "/events/varnakriti/prize/image (4).png",
      "/events/varnakriti/prize/image (5).png",
      "/events/varnakriti/prize/image (6).png",
      "/events/varnakriti/prize/image (7).png",
      "/events/varnakriti/prize/image (8).png",
      "/events/varnakriti/prize/image (9).png",
      "/events/varnakriti/prize/image.png"
    ],
    winners: [
      "/events/varnakriti/winners/SaveClip.App_640302939_17960191608051405_7355162228165538329_n.jpg",
      "/events/varnakriti/winners/SaveClip.App_640396337_17960191617051405_8629856469985778477_n.jpg",
      "/events/varnakriti/winners/SaveClip.App_640415008_17960191587051405_6590193589515239244_n.jpg"
    ]
  },
  croeso: [
    "/events/croeso/image (2).png",
    "/events/croeso/image.png",
    "/events/croeso/IMG-20260217-WA0140.jpg",
    "/events/croeso/IMG-20260217-WA0142.jpg",
    "/events/croeso/IMG-20260217-WA0146.jpg",
    "/events/croeso/IMG-20260217-WA0147.jpg",
    "/events/croeso/IMG-20260217-WA0149.jpg",
    "/events/croeso/IMG-20260217-WA0157.jpg",
    "/events/croeso/IMG-20260217-WA0159.jpg",
    "/events/croeso/IMG-20260217-WA0161.jpg",
    "/events/croeso/IMG-20260217-WA0163.jpg",
    "/events/croeso/IMG-20260217-WA0164.jpg",
    "/events/croeso/IMG-20260217-WA0165.jpg",
    "/events/croeso/IMG-20260217-WA0166.jpg",
    "/events/croeso/IMG-20260217-WA0167.jpg",
    "/events/croeso/IMG-20260217-WA0168.jpg",
    "/events/croeso/IMG-20260217-WA0170.jpg",
    "/events/croeso/IMG-20260217-WA0172.jpg",
    "/events/croeso/IMG-20260217-WA0174.jpg",
    "/events/croeso/IMG-20260218-WA0029.jpg",
    "/events/croeso/IMG-20260219-WA0015.jpg",
    "/events/croeso/IMG-20260219-WA0016.jpg",
    "/events/croeso/IMG-20260219-WA0017.jpg",
    "/events/croeso/IMG-20260219-WA0018.jpg",
    "/events/croeso/IMG-20260219-WA0019.jpg",
    "/events/croeso/IMG20260217201023 (1).jpg",
    "/events/croeso/IMG_20260217_104013405.jpg",
    "/events/croeso/IMG_20260217_104018666.jpg",
    "/events/croeso/IMG_20260217_104031799.jpg",
    "/events/croeso/IMG_20260217_104040598.jpg",
    "/events/croeso/IMG_20260217_104220050.jpg",
    "/events/croeso/IMG_20260217_105435377.jpg",
    "/events/croeso/IMG_20260217_105550033.jpg",
    "/events/croeso/IMG_20260217_165431.jpg",
    "/events/croeso/IMG_20260217_165433.jpg",
    "/events/croeso/IMG_20260217_165527.jpg",
    "/events/croeso/IMG_20260217_185447.jpg",
    "/events/croeso/IMG_20260217_185450.jpg",
    "/events/croeso/IMG_20260217_190023.jpg",
    "/events/croeso/IMG_20260217_190100.jpg",
    "/events/croeso/IMG_20260217_190111.jpg",
    "/events/croeso/IMG_20260217_190130.jpg",
    "/events/croeso/IMG_20260217_190511899.jpg",
    "/events/croeso/IMG_20260217_190740498_HDR~2.jpg",
    "/events/croeso/IMG_20260217_191240418~2.jpg",
    "/events/croeso/IMG_20260217_201131203~2.jpg",
    "/events/croeso/IMG_20260217_205004.jpg",
    "/events/croeso/IMG_20260217_205006.jpg",
    "/events/croeso/PXL_20260217_104556883.jpg",
    "/events/croeso/PXL_20260217_104645465.jpg",
    "/events/croeso/PXL_20260217_104758690.jpg",
    "/events/croeso/PXL_20260217_175532791.jpg",
    "/events/croeso/PXL_20260217_192135594.jpg",
    "/events/croeso/PXL_20260217_193632847.jpg",
    "/events/croeso/PXL_20260217_194649852.jpg",
    "/events/croeso/PXL_20260217_194656883.jpg",
    "/events/croeso/PXL_20260217_194906694.jpg",
    "/events/croeso/t's a time to disco ....Captured byArkadeb Thokdar, 1st yr. ME..jpg"
  ],
  holi: [
    "/events/holi/SaveClip.App_642148216_17961485553051405_8385715078758128532_n.jpg",
    "/events/holi/SaveClip.App_642529503_17961485511051405_131829195843355943_n.jpg",
    "/events/holi/SaveClip.App_642635932_17961485550051405_2472211186656361010_n.jpg",
    "/events/holi/SaveClip.App_642666667_17961485388051405_2814668728871964987_n.jpg",
    "/events/holi/SaveClip.App_642683403_17961485373051405_7735649280446324333_n.jpg",
    "/events/holi/SaveClip.App_642698762_17961485562051405_1727925144419840966_n.jpg",
    "/events/holi/SaveClip.App_642709633_17961485523051405_6942903691962638290_n.jpg",
    "/events/holi/SaveClip.App_645446133_17961485409051405_3632317390478327203_n.jpg",
    "/events/holi/SaveClip.App_648129421_17961485535051405_4433441016486177670_n.jpg",
    "/events/holi/SaveClip.App_648768061_17961485364051405_841916865367389342_n.jpg"
  ],
  saraswati: [
    "https://i.postimg.cc/qMb9T5CS/image.png",
    "https://i.postimg.cc/0yr1Kss1/image-(1).png",
    "https://i.postimg.cc/Y965B21f/image-(2).png",
    "https://i.postimg.cc/JnNfC7bK/image-(3).png",
    "https://i.postimg.cc/XJfR6Nwh/image-(4).png",
    "https://i.postimg.cc/KjmdGXN0/image-(5).png"
  ],
  republic: [
    "https://i.ibb.co/cKvTd26Z/image-1.png", "https://i.ibb.co/WN2RhJ8w/image-2.png", "https://i.ibb.co/hRZJQsjB/image-3.png",
    "https://i.ibb.co/gM9kRmK3/image-4.png", "https://i.ibb.co/v4vvwFbs/image-5.png", "https://i.ibb.co/KxcKwsDc/image-6.png",
    "https://i.ibb.co/Z16J13cX/image-7.png", "https://i.ibb.co/k69Vt6Gk/image-8.png", "https://i.ibb.co/Z43DjX7/image-9.png",
    "https://i.ibb.co/MJ0k1t6/image-10.png", "https://i.ibb.co/rG1r3Q6r/image-11.png", "https://i.ibb.co/jk6vQfSm/image-12.png",
    "https://i.ibb.co/HDcYS9Ff/image-13.png", "https://i.ibb.co/xK5j6t3b/image-14.png", "https://i.ibb.co/v4K6JpBD/image-15.png",
    "https://i.ibb.co/Wmbq5Fp/image-16.png", "https://i.ibb.co/1tS00rPx/image-17.png", "https://i.ibb.co/svLXkpFx/image-18.png",
    "https://i.ibb.co/ZRmcRm87/image-19.png", "https://i.ibb.co/Vcdz97bb/image-20.png", "https://i.ibb.co/NdVv1Y6S/image-21.png",
    "https://i.ibb.co/YFY0swYk/image-22.png", "https://i.ibb.co/WNcvvKjR/image-23.png", "https://i.ibb.co/0VvY79kB/image-24.png",
    "https://i.ibb.co/7dPMQ5Bb/image-25.png", "https://i.ibb.co/K8g7MBk/image-27.png", "https://i.ibb.co/LDc9Sqwv/image-28.png",
    "https://i.ibb.co/4RBCCYSp/image-29.png", "https://i.ibb.co/KzV78YZC/image-30.png", "https://i.ibb.co/rR94SJ9T/image-31.png",
    "https://i.ibb.co/MkqdRZ5W/image-32.png", "https://i.ibb.co/hx5N1zQv/image-33.png", "https://i.ibb.co/LdRW1b3n/image-34.png",
    "https://i.ibb.co/21qSZTTv/image.png"
  ]
};

const flattenPhotos = (photos) => {
  if (!photos) return [];
  if (Array.isArray(photos)) return photos;
  return [
    ...(photos.general || []),
    ...(photos.prize || []),
    ...(photos.winners || [])
  ];
};

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

// ✦✦✦ APP ✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦────

const ArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', verticalAlign: 'middle', display: 'inline-block' }}>
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '8px', verticalAlign: 'middle', display: 'inline-block' }}>
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

export default function App() {
  const [navScrolled, setNavScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const topLevelCategories = ["Weekly Captures", "Monthly Captures", "The Extra Frame", "CC Event Winners"];
  const decodedPath = decodeURIComponent(location.pathname.substring(1));
  const isGalleryCategory = topLevelCategories.includes(decodedPath);
  const pathParts = location.pathname.split('/').filter(Boolean);
  const isGallerySub = pathParts[0] === 'gallery' && pathParts[1];
  
  const activeSection = location.pathname === "/" ? "home" : (isGalleryCategory || isGallerySub ? "gallery" : location.pathname.substring(1).split('/')[0]);
  const galleryFilter = isGalleryCategory ? decodedPath : (isGallerySub ? decodeURIComponent(pathParts[1]) : "All");

  const setGalleryFilterRoute = (cat) => {
    navigate(cat === "All" ? "/gallery" : `/${cat}`);
  };
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

  const [isAdmin, setIsAdmin] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(false);
  const [archiveConfig, setArchiveConfig] = useState({ order: [], hidden: [] });
  const [themeId, setThemeId] = useState("golden_elegance");
  const [coverPhotos, setCoverPhotos] = useState([]);
  const activeCovers = coverPhotos.length > 0 ? coverPhotos : HERO_COVERS;

  useEffect(() => {
    if (!activeCovers || activeCovers.length === 0) return;
    
    // Boundary check for when the covers list shrinks
    if (currentHeroIndex >= activeCovers.length) {
      setCurrentHeroIndex(0);
      return;
    }

    const timer = setInterval(() => {
      setCurrentHeroIndex(prev => (prev + 1) % activeCovers.length);
    }, 8000);
    
    return () => clearInterval(timer);
  }, [activeCovers.length, currentHeroIndex]);
  
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
  const [teamMembers, setTeamMembers] = useState({ founders: [], incharge: [], coordinators: [], core: [] });
  const [liveEvents, setLiveEvents] = useState({});
  const [liveEventsList, setLiveEventsList] = useState([]);
  const [eventsLoaded, setEventsLoaded] = useState(false);
  const [ccEvents, setCcEvents] = useState([]);
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
    setShuffledCore(shuffle(teamMembers.core || []));
  }, [teamMembers.core]);

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


  // Parallel Real-time & Data Fetching
  useEffect(() => {
    // 1. Members Snapshot
    const qMembers = query(collection(db, "members"), orderBy("createdAt", "desc"));
    const unsubMembers = onSnapshot(qMembers, (snap) => {
      const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setDynamicMembers(fetched);
    });

    // 1b. Team Members Snapshot
    const unsubTeam = onSnapshot(collection(db, "team_members"), (snap) => {
      const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const grouped = {
        founders: fetched.filter(m => m.category === 'founders').sort((a,b) => (a.order || 0) - (b.order || 0)),
        incharge: fetched.filter(m => m.category === 'incharge').sort((a,b) => (a.order || 0) - (b.order || 0)),
        coordinators: fetched.filter(m => m.category === 'coordinators').sort((a,b) => (a.order || 0) - (b.order || 0)),
        core: fetched.filter(m => m.category === 'core').sort((a,b) => (a.order || 0) - (b.order || 0)),
      };
      // Fallback to static if empty (for initial migration)
      if (fetched.length === 0) {
        setTeamMembers(TEAM_DATA);
      } else {
        setTeamMembers(grouped);
      }
    });

    // 2. Fetch Gallery
    const unsubGallery = onSnapshot(collection(db, "gallery"), (snap) => {
      const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (fetched.length === 0) {
        setGallery(GALLERY);
      } else {
        setGallery(fetched);
      }
    });

    // 3. Events Snapshot
    const unsubEvents = onSnapshot(collection(db, "events"), async (snap) => {
      const eventsMap = {};
      const eventList = [];
      snap.forEach(d => {
        const data = d.data();
        eventsMap[d.id] = data.photos || [];
        eventList.push({ id: d.id, ...data });
      });

      // Seeding for static events
      for (const ev of STATIC_EVENTS) {
        if (!eventList.find(e => e.id === ev.id)) {
          await setDoc(doc(db, "events", ev.id), ev);
        } else {
          await setDoc(doc(db, "events", ev.id), ev, { merge: true });
        }
      }

      setLiveEvents(eventsMap);
      setLiveEventsList(eventList.sort((a,b) => (a.order || 99) - (b.order || 99)));
      setEventsLoaded(true);
    });

    // 4. CC Events Snapshot
    const unsubCCEvents = onSnapshot(collection(db, "cc_events"), (snap) => {
      setCcEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => (a.order || 99) - (b.order || 99)));
    });

    const unsubConfig = onSnapshot(doc(db, "config", "archive"), (doc) => {
      if (doc.exists()) setArchiveConfig(doc.data());
    });
    
    const unsubTheme = onSnapshot(doc(db, "config", "theme"), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.themeId) {
          setThemeId(data.themeId);
        } else if (data.primaryColor) {
          // Fallback for old color wheel format
          const nearestTheme = THEMES.find(t => t.primary.toLowerCase() === data.primaryColor.toLowerCase()) || THEMES[0];
          setThemeId(nearestTheme.id);
        }
      }
    });

    const unsubCovers = onSnapshot(doc(db, "config", "covers"), (doc) => {
      if (doc.exists() && doc.data().urls) setCoverPhotos(doc.data().urls);
    });

    // 4. Site Config Listener
    const unsubSite = onSnapshot(doc(db, "config", "site"), (snap) => {
      if (snap.exists()) {
        setSiteConfig(snap.data());
        // Dismiss splash once site config is ready
        setTimeout(() => setIsInitializing(false), 800);
      } else {
        // Fallback if no config exists yet
        setIsInitializing(false);
      }
    });

    return () => {
      unsubMembers();
      unsubTeam();
      unsubEvents();
      unsubCCEvents();
      unsubConfig();
      unsubTheme();
      unsubCovers();
      unsubSite();
      unsubGallery();
    };
  }, []);

  // Derive Featured Captures Dynamically from Gallery
  useEffect(() => {
    if (!gallery || gallery.length === 0) return;

    const sorted = [...gallery].sort((a, b) => {
      const dateA = a.captureDate || "";
      const dateB = b.captureDate || "";
      if (dateB !== dateA) return dateB.localeCompare(dateA);
      
      const createdA = a.createdAt || "";
      const createdB = b.createdAt || "";
      return createdB.localeCompare(createdA);
    });

    const latestWeek = sorted.find(g => g.category === "Weekly Captures");
    const latestMonth = sorted.find(g => g.category === "Monthly Captures");
    const latestExtra = sorted.find(g => g.category === "The Extra Frame");

    setWeekCapture(latestWeek || null);
    setMonthCapture(latestMonth || null);
    setExtraFrameCapture(latestExtra || null);
  }, [gallery]);

  const [siteConfig, setSiteConfig] = useState({
    logoUrl: "/logo.jpg",
    faviconUrl: "/logo.jpg",
    siteName: "Capture Crew",
    heroEyebrow: "Capture Crew · CGEC Photography Club",
    heroTitle: "CAPTURING MOMENTS,\nCREATING MEMORIES.",
    heroTagline: "Exploring the World through the CGEC lens",
    instaLink: "https://instagram.com/cgec_capture_crew?igshid=NGVhN2U2NjQ0Yg==",
    waLink: "https://chat.whatsapp.com/BSV9q40j6EN2B5sQz47eYK?mode=gi_t",
    fbLink: "https://www.facebook.com/profile.php?id=61551537531538&mibextid=V3Yony"
  });




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

  // Consolidated Intersection Observer for fade-in animations
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

    // Re-observe when components might re-render or expand (e.g. dynamic/lazy load backups)
    const timer = setInterval(() => {
      const newElements = document.querySelectorAll('.fade-in:not(.visible)');
      newElements.forEach(el => observer.observe(el));
    }, 500);

    return () => {
      observer.disconnect();
      clearInterval(timer);
    };
  }, [
    location.pathname,
    galleryFilter,
    gallery,
    liveEvents,
    shuffledMembers,
    isInitializing,
    weekCapture,
    monthCapture,
    extraFrameCapture,
    expandedGallery,
    expandedEvents,
    expandedTeam,
    expandedMembers
  ]);

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
          const email = u.email.toLowerCase();
          const adminDoc = await getDoc(doc(db, "admins", email));
          if (adminDoc.exists()) {
            setIsAdmin(true);
            setAdminData(adminDoc.data());
          } else {
            setIsAdmin(false);
            setAdminData(null);
          }
        } catch (err) {
          console.error("Admin check error:", err);
          setIsAdmin(false);
        }
        setIsAuthChecking(false);
      } else {
        setIsAdmin(false);
        setAdminData(null);
        setIsAuthChecking(false);
      }
    });
  }, []);

  // Apply Dynamic Theme
  useEffect(() => {
    const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
    const root = document.documentElement;
    root.style.setProperty('--gold', theme.primary);
    root.style.setProperty('--gold2', theme.secondary);
    root.style.setProperty('--heading-accent', theme.heading);
    root.style.setProperty('--surface', theme.surface);
    root.style.setProperty('--ink', theme.surface === '#111114' ? '#0A0A0B' : `${theme.surface}CC`);
  }, [themeId]);

  const updateTheme = async (id) => {
    try {
      await setDoc(doc(db, "config", "theme"), { themeId: id }, { merge: true });
    } catch (err) {
      alert("Failed to update theme: " + err.message);
    }
  };

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
    let route = "/";
    if (id === "gallery") route = "/gallery";
    if (id === "events") route = "/events";
    if (id === "team") route = "/team";
    if (id === "verify") route = "/verify";
    navigate(route);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
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
            <img src={siteConfig.logoUrl || "/logo.jpg"} alt="Logo" style={{ width: '100px', height: '100px', borderRadius: '50%', border: '2px solid var(--gold)', padding: '5px' }} />
          </div>
          <h1 className="splash-logo">{siteConfig.siteName?.split(' ')[0]} <span>{siteConfig.siteName?.split(' ')[1]}</span></h1>
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
            <img src={siteConfig.logoUrl || "/logo.jpg"} alt="Logo" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          </div>
          <div className="nav-name">{siteConfig.siteName}</div>
        </div>
        
        <button className={`nav-toggle ${mobileMenuOpen ? "active" : ""}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <span></span><span></span><span></span>
        </button>

        <ul className={`nav-links ${mobileMenuOpen ? "mobile-open" : ""}`}>
          {[["home","Home"],["gallery","Gallery"],["events","Events"],["team","Team"],["verify","Verify"]].map(([id, label]) => {
            let route = id === "home" ? "/" : `/${id}`;
            return (
              <li key={id} className={activeSection === id ? "active" : ""}>
                <Link 
                  to={route} 
                  onClick={(e) => {
                    if (selectedEvent) setSelectedEvent(null);
                    setMobileMenuOpen(false);
                    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
                  }}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  {label}
                </Link>
              </li>
            );
          })}
          <li className="nav-btn-wrapper">
            <button className="admin-nav-btn" onClick={() => navigate('/admin')}>Admin Console</button>
          </li>
        </ul>
      </nav>

      {/* HERO */}
      <Routes>
        <Route path="/" element={
          <>
            <section id="home" className="hero">
        <div className="hero-bg">
          {activeCovers.map((img, idx) => (
            (idx === currentHeroIndex || idx === (currentHeroIndex + 1) % activeCovers.length) && (
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
          <div className="hero-eyebrow">{siteConfig.heroEyebrow}</div>
          <h1 className="hero-title" dangerouslySetInnerHTML={{ 
            __html: siteConfig.heroTitle?.split('\n').map(line => {
              const words = line.split(' ');
              if (words.length >= 2) {
                // First word white, rest emphasized (gold)
                return `${words[0]} <em>${words.slice(1).join(' ')}</em>`;
              }
              return line;
            }).join('<br/>')
          }} />
          <p className="hero-tagline">{siteConfig.heroTagline}</p>
          <button className="hero-cta" onClick={() => scrollTo("gallery")}>
            Explore the Gallery ↓
          </button>
        </div>
        <div className="hero-scroll">Scroll</div>
      </section>

      {(() => {
        const sections = [];
        if (weekCapture) {
          sections.push({
            date: weekCapture.captureDate || "",
            created: weekCapture.createdAt || "",
            element: (
              <section id="week" className="week-section" key="week">
                <div className="container">
                  <div className="fade-in" style={{ marginBottom: "4rem" }}>
                    <div className="section-label">✧ Featured</div>
                    <h2 className="section-title">Capture of the <em>Week</em></h2>
                    <p className="section-sub">Hand-picked by the core team — one photograph that stopped us in our tracks.</p>
                  </div>
                  <div className="week-inner fade-in">
                    <div className="week-image-wrap">
                      <img src={weekCapture.url || "/placeholder.jpg"} alt={weekCapture.title} className="week-img" referrerPolicy="no-referrer" style={{ cursor: 'pointer' }} onClick={() => setLightboxItem(weekCapture)} />
                      <div className="week-badge">This Week's Pick</div>
                    </div>
                    <div className="week-info">
                      <div className="week-date">Featured</div>
                      <p className="week-story">{weekCapture.title || "Fetching the latest capture..."}</p>
                      <div className="month-photographer" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                        By <span>{weekCapture.photographer}</span> ({weekCapture.dept} · {weekCapture.year})
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )
          });
        } else {
          sections.push({
            date: "",
            created: "",
            element: (
              <section id="week" className="week-section" key="week">
                <div className="container">
                  <div className="fade-in" style={{ marginBottom: "4rem" }}>
                    <div className="section-label">✧ Featured</div>
                    <h2 className="section-title">Capture of the <em>Week</em></h2>
                    <p className="section-sub">Hand-picked by the core team — one photograph that stopped us in our tracks.</p>
                  </div>
                  <div className="week-inner fade-in">
                    <div className="week-image-wrap">
                      <img src="/placeholder.jpg" alt="Placeholder" className="week-img" referrerPolicy="no-referrer" style={{ cursor: 'default' }} />
                      <div className="week-badge">This Week's Pick</div>
                    </div>
                    <div className="week-info">
                      <div className="week-date">Featured</div>
                      <p className="week-story">Fetching the latest capture...</p>
                    </div>
                  </div>
                </div>
              </section>
            )
          });
        }

        if (monthCapture) {
          sections.push({
            date: monthCapture.captureDate || "",
            created: monthCapture.createdAt || "",
            element: (
              <section id="month" className="month-section" key="month">
                <div className="container">
                  <div className="month-header fade-in">
                    <div>
                      <div className="section-label">✧ Premium Showcase</div>
                      <h2 className="section-title">Capture of the <em>Month</em></h2>
                    </div>
                  </div>
                  <div className="month-slide fade-in">
                    <div className="month-image-wrap">
                      <img src={monthCapture.url || "/placeholder.jpg"} alt={monthCapture.title} className="month-img" referrerPolicy="no-referrer" style={{ cursor: 'pointer' }} onClick={() => setLightboxItem(monthCapture)} />
                      <div className="month-frame" />
                      <div className="month-award">
                        <div className="month-award-text">BEST<br/>OF<br/>MONTH</div>
                      </div>
                    </div>
                    <div className="month-info">
                      <div className="month-of">Premium Selection</div>
                      <h3 className="week-title" style={{ fontSize: '2.2rem', marginBottom: '1.2rem' }}>{monthCapture.title}</h3>
                      <div className="month-photographer" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                        By <span>{monthCapture.photographer}</span> ({monthCapture.dept} · {monthCapture.year})
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )
          });
        } else {
          sections.push({
            date: "",
            created: "",
            element: (
              <section id="month" className="month-section" key="month">
                <div className="container">
                  <div className="month-header fade-in">
                    <div>
                      <div className="section-label">✧ Premium Showcase</div>
                      <h2 className="section-title">Capture of the <em>Month</em></h2>
                    </div>
                  </div>
                  <div className="month-slide fade-in">
                    <div className="month-image-wrap">
                      <img src="/placeholder.jpg" alt="Placeholder" className="month-img" referrerPolicy="no-referrer" style={{ cursor: 'default' }} />
                      <div className="month-frame" />
                      <div className="month-award">
                        <div className="month-award-text">BEST<br/>OF<br/>MONTH</div>
                      </div>
                    </div>
                    <div className="month-info">
                      <div className="month-of">Premium Selection</div>
                      <h3 className="week-title" style={{ fontSize: '2.2rem', marginBottom: '1.2rem' }}>Fetching the latest capture...</h3>
                    </div>
                  </div>
                </div>
              </section>
            )
          });
        }

        if (extraFrameCapture) {
          sections.push({
            date: extraFrameCapture.captureDate || "",
            created: extraFrameCapture.createdAt || "",
            element: (
              <section id="extra" className="week-section" style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", padding: '8rem 0' }} key="extra">
                <div className="container">
                  <div className="fade-in" style={{ marginBottom: "4rem" }}>
                    <div className="section-label">✧ Bonus Frame</div>
                    <h2 className="section-title">The <em>Extra Frame</em></h2>
                  </div>
                  <div className="week-inner fade-in">
                    <div className="week-image-wrap" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                      <img src={extraFrameCapture.url} alt={extraFrameCapture.title} className="week-img" style={{ borderRadius: '0', cursor: 'pointer' }} referrerPolicy="no-referrer" onClick={() => setLightboxItem(extraFrameCapture)} />
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
            )
          });
        }

        // Sort sections: newest first
        sections.sort((a, b) => {
          if (a.date === "" && b.date !== "") return 1;
          if (b.date === "" && a.date !== "") return -1;
          if (b.date !== a.date) return b.date.localeCompare(a.date);
          return b.created.localeCompare(a.created);
        });

        return sections.map(s => s.element);
      })()}

          </>
        } />

        {["/gallery", "/Weekly Captures", "/Monthly Captures", "/The Extra Frame", "/CC Event Winners", "/gallery/:category"].map(path => (
          <Route key={path} path={path} element={
          <section id="gallery" className="gallery-section">
        <div className="container">
          <div className="fade-in" style={{ marginBottom: "3rem" }}>
            <div className="section-label">✧ Our Work</div>
            <h2 className="section-title">The <em>Gallery</em></h2>
            <p className="section-sub">Curated captures from our photographers — click any image to view full screen.</p>
          </div>
          <div className="gallery-filter fade-in">
            {["All", "Weekly Captures", "Monthly Captures", "The Extra Frame", "CC Event Winners"].map(cat => (
              <button 
                key={cat} 
                className={`filter-btn ${galleryFilter === cat ? "active" : ""} ${cat === "CC Event Winners" ? "premium-btn" : ""}`} 
                onClick={() => setGalleryFilterRoute(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {galleryFilter === "CC Event Winners" ? (
            <div className="cc-events-container fade-in">
              {ccEvents.map(event => (
                <div key={event.id} className="cc-event-block" style={{ marginBottom: '6rem' }}>
                  <div className="cc-event-header" style={{ textAlign: 'center', marginBottom: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div className="section-label" style={{ margin: '0 0 1rem' }}>✧ Competition Results</div>
                    <h3 className="subcategory-title" style={{ border: 'none', padding: 0, fontSize: '2.5rem', margin: '0' }}>{event.title} <em>Winners</em></h3>
                    <p className="section-sub" style={{ margin: '1rem 0 0', opacity: 0.8 }}>{event.subtitle}</p>
                  </div>
                  
                  <div className="podium-grid">
                    {/* 2nd Place */}
                    <WinnerCard rank="2nd" data={event.winners?.["2nd"]} color="#A8A8A8" setLightboxItem={setLightboxItem} />
                    {/* 1st Place */}
                    <WinnerCard rank="1st" data={event.winners?.["1st"]} color="var(--gold)" isFeatured={true} setLightboxItem={setLightboxItem} />
                    {/* 3rd Place */}
                    <WinnerCard rank="3rd" data={event.winners?.["3rd"]} color="#CD7F32" setLightboxItem={setLightboxItem} />
                  </div>
                </div>
              ))}
              {ccEvents.length === 0 && <div className="no-results">No CC Event winners posted yet. Check back soon!</div>}
            </div>
          ) : (
            <>
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
                  <button className="event-dive-btn" onClick={() => setExpandedGallery(true)}>View All Captures </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
        } />
        ))}

        <Route path="/events" element={
          <section id="events" className="events-section">
        <div className="container">
          <div className="fade-in" style={{ marginBottom: "3rem" }}>
            <div className="section-label">✧ Milestones</div>
            <h2 className="section-title">College <em>Events</em></h2>
            <p className="section-sub">From vibrant campus fests to unforgettable college moments — every event, immortalized through our lenses.</p>
          </div>
          <div className="events-grid">
            {liveEventsList.slice(0, (isMobile && !expandedEvents) ? 3 : undefined).map(ev => (
              <div
                key={ev.id}
                className="event-card fade-in"
                style={{ "--c": ev.color }}
              >
                {ev.iconUrl || STATIC_EVENT_ICONS[ev.id] ? (
                  <img src={ev.iconUrl || STATIC_EVENT_ICONS[ev.id]} alt={ev.name} className="event-card-icon" referrerPolicy="no-referrer" />
                ) : (
                  <span className="event-emoji">{ev.emoji}</span>
                )}
                <div className="event-name">{ev.name}</div>
                <div className="event-subtitle" style={{ color: ev.color }}>{ev.subtitle}</div>
                <div className="event-date">{ev.date}</div>
                <div className="event-desc">{ev.desc}</div>
                <div className="event-highlight">{ev.highlight}</div>
                <button 
                  className="event-dive-btn" 
                  onClick={() => ev.comingSoon ? alert("Coming Soon!") : navigate(`/events/${encodeURIComponent(ev.name)}`)}
                >
                  {ev.comingSoon ? "Coming Soon " : "Dive In "}
                </button>
              </div>
            ))}
            
            {/* Global Gallery Card */}
            <div 
              className="event-card global-gallery-card fade-in" 
              onClick={() => navigate('/events/archive')}
              style={{ cursor: 'pointer' }}
            >
              <div className="global-card-content">
                <span className="event-emoji">📂</span>
                <div className="event-name">Dive into Event <em>Archive</em></div>
                <div className="event-subtitle" style={{ color: 'var(--gold)' }}>Universal Gallery</div>
                <div className="event-desc">Explore every capture from every event we've ever hosted, all in one immersive timeline.</div>
                <div className="global-card-badge">✨ IMMERSIVE VIEW</div>
                <button className="event-dive-btn" style={{ marginTop: 'auto' }}>Open Archive </button>
              </div>
              <div className="global-card-bg"></div>
            </div>
          </div>
          {isMobile && !expandedEvents && liveEventsList.length > 3 && (
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <button className="event-dive-btn" onClick={() => setExpandedEvents(true)}>View All Events </button>
            </div>
          )}
        </div>
      </section>
        } />

        <Route path="/team" element={
          <section id="team" className="team-section">
        <div className="container">
          <div className="fade-in" style={{ marginBottom: "3rem" }}>
            <div className="section-label">✧ The People Behind the Lens</div>
            <h2 className="section-title"><em>Team</em></h2>
            <p className="section-sub">The dedicated photographers, editors, and organizers who keep Capture Crew alive.</p>
          </div>
          <div className="team-container">
            {/* FOUNDERS */}
            {teamMembers.founders?.length > 0 && (
              <div className="team-subcategory">
                <h3 className="subcategory-title"><em>Founders</em></h3>
                <div className="team-grid">
                  {teamMembers.founders.map(m => (
                    <div key={m.id || m.name} className="team-card fade-in" onClick={() => m.insta && window.open(m.insta, "_blank")} style={{ cursor: m.insta ? 'pointer' : 'default' }}>
                      <div className="team-avatar">
                        <img src={m.img} alt={m.name} loading="lazy" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      </div>
                      <div className="team-name">{m.name}</div>
                      <div className="team-role">{m.role}</div>
                      <div className="team-dept">{m.dept} {m.year ? `· ${m.year}` : ""}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* INCHARGE */}
            {teamMembers.incharge?.length > 0 && (
              <div className="team-subcategory">
                <h3 className="subcategory-title"><em>Incharges</em></h3>
                <div className="team-grid incharge-grid">
                  {teamMembers.incharge.map(m => (
                    <div key={m.id || m.name} className="team-card incharge-card fade-in" onClick={() => m.insta && window.open(m.insta, "_blank")} style={{ cursor: m.insta ? 'pointer' : 'default' }}>
                      <div className="team-avatar highlight-silver">
                        <img src={m.img} alt={m.name} loading="lazy" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      </div>
                      <div className="team-name">{m.name}</div>
                      <div className="team-role">{m.role}</div>
                      <div className="team-dept">{m.dept} {m.year ? `· ${m.year}` : ""}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* COORDINATORS */}
            {teamMembers.coordinators?.length > 0 && (
              <div className="team-subcategory">
                <h3 className="subcategory-title"><em>Co-Ordinators</em></h3>
                <div className="team-grid">
                  {teamMembers.coordinators.map(m => (
                    <div key={m.id || m.name} className="team-card fade-in" onClick={() => m.insta && window.open(m.insta, "_blank")} style={{ cursor: m.insta ? 'pointer' : 'default' }}>
                      <div className="team-avatar">
                        <img src={m.img} alt={m.name} loading="lazy" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      </div>
                      <div className="team-name">{m.name}</div>
                      <div className="team-role">{m.role}</div>
                      <div className="team-dept">{m.dept} {m.year ? `· ${m.year}` : ""}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CORE TEAM */}
            {teamMembers.core?.length > 0 && (
              <div className="team-subcategory">
                <h3 className="subcategory-title"><em>Core Team</em></h3>
                <div className="team-grid">
                  {(isMobile && !expandedTeam ? teamMembers.core.slice(0, 3) : teamMembers.core).map(m => (
                    <div key={m.id || m.name} className="team-card fade-in" onClick={() => m.insta && window.open(m.insta, "_blank")} style={{ cursor: m.insta ? 'pointer' : 'default' }}>
                      <div className="team-avatar">
                        {m.img ? (
                          <img src={m.img} alt={m.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          m.emoji || "📸"
                        )}
                      </div>
                      <div className="team-name">{m.name}</div>
                      <div className="team-role">{m.role}</div>
                      <div className="team-dept">{m.dept} {m.year ? `· ${m.year}` : ""}</div>
                    </div>
                  ))}
                  
                  {isMobile && !expandedTeam && teamMembers.core.length > 3 && (
                    <div className="team-card fade-in" style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }} onClick={() => setExpandedTeam(true)}>
                      <div className="team-avatar" style={{ background: 'var(--gold)', color: 'var(--ink)' }}>
                        📂
                      </div>
                      <div className="team-name" style={{ color: 'var(--gold)' }}>Show All</div>
                      <div className="team-role">Full Core Team</div>
                      <div className="team-dept">{teamMembers.core.length} Members Total</div>
                    </div>
                  )}
                  
                  {/* RECRUITMENT CARD */}
                  {(expandedTeam || !isMobile) && (
                    <div className="team-card fade-in" style={{ cursor: 'pointer', border: '1px dashed var(--gold)', background: 'rgba(201,169,110,0.03)' }} onClick={() => setShowRecruitment(true)}>
                      <div className="team-avatar" style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold2))', color: 'var(--ink)' }}>
                        ➕
                      </div>
                      <div className="team-name" style={{ color: 'var(--gold)' }}>Join Our Crew</div>
                      <div className="team-role">Become a Member</div>
                      <div className="team-dept">Apply for Core Team</div>
                      <button className="event-dive-btn" style={{ marginTop: '1rem', width: '100%' }}>Apply Now </button>
                    </div>
                  )}
                </div>
              </div>
            )}

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
                      📸
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
        } />

        <Route path="/verify" element={
          <section id="verify" className="verify-section">
        <div className="container">
          <div className="fade-in" style={{ marginBottom: "3rem", textAlign: "center" }}>
            <div className="section-label">✧ Authenticity</div>
            <h2 className="section-title">Verify <em>Certificate</em></h2>
            <p className="section-sub" style={{ margin: "0 auto", textAlign: "center" }}>Enter your certificate serial number to verify its authenticity and details.</p>
          </div>
          <div className="verify-box fade-in">
            <form className="verify-form" onSubmit={handleVerify}>
              <input 
                type="text" 
                placeholder="Enter Serial Number (e.g. CC-2024-001)" 
                value={certId}
                onChange={(e) => setCertId(e.target.value)}
                className="form-input"
              />
              <button type="submit" className="form-submit" disabled={isVerifying}>
                {isVerifying ? "Verifying..." : "Verify Now "}
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
                    {(verifyResult.link || verifyResult.certUrl || verifyResult.url || verifyResult.certificateUrl || verifyResult.pdfUrl) && (
                      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                        <a 
                          href={verifyResult.link || verifyResult.certUrl || verifyResult.url || verifyResult.certificateUrl || verifyResult.pdfUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="form-submit" 
                          style={{ 
                            display: 'inline-block', 
                            textDecoration: 'none', 
                            textAlign: 'center',
                            minWidth: '200px'
                          }}
                        >
                          Download Certificate
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
        } />
        <Route path="/events/:eventId" element={
          <EventRouteWrapper 
            liveEventsList={liveEventsList}
            liveEvents={liveEvents}
            setLightboxItem={setLightboxItem}
            archiveConfig={archiveConfig}
            navigate={navigate}
            eventsLoaded={eventsLoaded}
          />
        } />
        <Route path="/admin" element={
          <AdminRouteWrapper
            user={user}
            isAuthChecking={isAuthChecking}
            isAdmin={isAdmin}
            adminData={adminData}
            archiveConfig={archiveConfig}
            themeId={themeId}
            coverPhotos={coverPhotos}
            liveEvents={liveEvents}
            liveEventsList={liveEventsList}
            dynamicMembers={dynamicMembers}
            teamMembers={teamMembers}
            ccEvents={ccEvents}
            updateTheme={updateTheme}
            siteConfig={siteConfig}
            gallery={gallery}
            navigate={navigate}
          />
        } />
      </Routes>

      <footer className="footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">{siteConfig.siteName?.split(' ')[0]} <span>{siteConfig.siteName?.split(' ')[1]}</span></div>
            <p className="footer-college">Cooch Behar Government Engineering College</p>
          </div>
          
          <div className="footer-mid">
            <div className="footer-links">
              {[["home","Home"],["gallery","Gallery"],["events","Events"],["team","Team"],["verify","Verify"]].map(([id, label]) => (
                <a key={id} onClick={() => scrollTo(id)} className="footer-link">{label}</a>
              ))}
              <a onClick={() => navigate('/admin')} className="footer-link">Admin Console</a>
            </div>
            
            <div className="footer-socials">
              <a href={siteConfig.instaLink} target="_blank" rel="noreferrer" className="social-icon">Instagram</a>
              <a href={siteConfig.waLink} target="_blank" rel="noreferrer" className="social-icon">WhatsApp</a>
              <a href={siteConfig.fbLink} target="_blank" rel="noreferrer" className="social-icon">Facebook</a>
            </div>
          </div>
          
          <div className="footer-bottom">
            <div className="footer-copy">© 2026 {siteConfig.siteName} · All Rights Reserved</div>
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
      {showRecruitment && (
        <RecruitmentModal onClose={() => setShowRecruitment(false)} />
      )}
    </div>
  );
}

function EventRouteWrapper({ liveEventsList, liveEvents, setLightboxItem, archiveConfig, navigate, eventsLoaded }) {
  if (!eventsLoaded) {
    return (
      <div className="lightbox open" style={{ color: '#fff', background: 'rgba(0,0,0,0.95)', zIndex: 3000 }}>
        <div className="lightbox-content" style={{ textAlign: 'center' }}>
          <div className="section-label" style={{ color: 'var(--gold)', marginBottom: '1rem' }}>Loading</div>
          <h2 className="section-title" style={{ fontSize: '1.5rem' }}>Loading <em>Event Details...</em></h2>
        </div>
      </div>
    );
  }

  const { eventId } = useParams();
  
  if (eventId === 'archive') {
    return (
      <EventPage 
        isGlobal={true}
        event={{ id: 'global', name: 'Event Archive', desc: 'A universal journey through all our club milestones and collective memories.' }}
        onClose={() => navigate('/events')}
        setLightboxItem={setLightboxItem}
        liveEvents={liveEvents}
        archiveConfig={archiveConfig}
        liveEventsList={liveEventsList}
      />
    );
  }

  const decoded = decodeURIComponent(eventId);
  const event = liveEventsList.find(e => e.name === decoded || e.id === decoded);
  
  if (!event) return <div style={{ color: 'white', padding: '5rem', textAlign: 'center' }}>Event not found</div>;

  return (
    <EventPage 
      event={event} 
      onClose={() => navigate('/events')}
      setLightboxItem={setLightboxItem} 
      liveEvents={liveEvents}
    />
  );
}

function AdminRouteWrapper({ user, isAuthChecking, isAdmin, adminData, archiveConfig, themeId, coverPhotos, liveEvents, liveEventsList, dynamicMembers, teamMembers, ccEvents, updateTheme, siteConfig, gallery, navigate }) {
  if (!user) return <LoginModal onClose={() => navigate('/')} />;
  
  if (isAuthChecking) {
    return (
      <div className="lightbox open" style={{ color: '#fff', background: 'rgba(0,0,0,0.95)', zIndex: 3000 }}>
        <div className="lightbox-content" style={{ textAlign: 'center' }}>
          <div className="section-label" style={{ color: 'var(--gold)', marginBottom: '1rem' }}>Security Check</div>
          <h2 className="section-title" style={{ fontSize: '1.5rem' }}>Verifying <em>Authorization...</em></h2>
          <div style={{ marginTop: '2rem', opacity: 0.5, fontSize: '0.8rem' }}>Checking email: {user.email}</div>
        </div>
      </div>
    );
  }
  
  if (!isAdmin) return <LoginModal user={user} onClose={() => navigate('/')} isUnauthorized={true} />;
  
  return (
    <AdminDashboard 
      user={user} 
      adminData={adminData} 
      archiveConfig={archiveConfig} 
      themeId={themeId}
      coverPhotos={coverPhotos}
      onClose={() => navigate('/')} 
      liveEvents={liveEvents} 
      liveEventsList={liveEventsList} 
      dynamicMembers={dynamicMembers} 
      teamMembers={teamMembers}
      ccEvents={ccEvents} 
      updateTheme={updateTheme}
      siteConfig={siteConfig}
      gallery={gallery}
    />
  );
}

// ✦✦✦ ADMIN COMPONENTS ✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦—

function LoginModal({ onClose, user, isUnauthorized }) {
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError("Failed to sign in with Google.");
    }
  };

  return (
    <div className="lightbox open" onClick={onClose} style={{ color: '#fff', background: 'rgba(0,0,0,0.95)', zIndex: 2000 }}>
      <div className="lightbox-content admin-modal" onClick={e => e.stopPropagation()} style={{ 
        background: '#111', 
        padding: '3rem', 
        borderRadius: '24px', 
        border: '1px solid var(--gold)',
        maxWidth: '500px',
        width: '90%'
      }}>
        <button className="lightbox-close" onClick={onClose} style={{ color: '#fff' }}>✕</button>
        <div className="section-label" style={{ color: 'var(--gold)' }}>{isUnauthorized ? "Access Denied" : "Restricted Access"}</div>
        <h2 className="section-title" style={{ color: '#fff', fontSize: '2rem', margin: '1rem 0' }}>Team <em>{isUnauthorized ? "Unauthorized" : "Login"}</em></h2>
        
        {isUnauthorized ? (
          <div className="fade-in visible">
            <p style={{ color: '#ff4d4d', fontWeight: 'bold', marginBottom: '1rem' }}>
              Authentication Successful, but Authorization Failed.
            </p>
            <p style={{ opacity: 0.8, fontSize: '0.9rem', marginBottom: '2rem', lineHeight: '1.6' }}>
              Your email <strong>{user?.email}</strong> is not listed in our authorized administrators database.
              <br /><br />
              If you are a Core Member, please contact a Lead to have your email added to the system.
            </p>
            <button className="form-submit" onClick={() => signOut(auth)} style={{ width: '100%', background: '#ff4d4d' }}>Sign Out & Try Different Account</button>
          </div>
        ) : (
          <div>
            <p className="section-sub" style={{ fontSize: '0.9rem', margin: '1.5rem 0', opacity: 0.7 }}>
              Access is restricted to authorized Capture Crew Core Team members only.
            </p>
            <button className="form-submit" onClick={handleGoogleLogin} style={{ 
              width: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '1rem',
              background: 'var(--gold)',
              color: '#000',
              fontWeight: 'bold'
            }}>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '18px' }} />
              Continue with Google
            </button>
          </div>
        )}
        {error && <p style={{ color: '#ff4d4d', fontSize: '0.8rem', marginTop: '1rem' }}>{error}</p>}
      </div>
    </div>
  );
}

function AdminDashboard({ user, adminData, archiveConfig, themeId, coverPhotos, onClose, liveEvents, liveEventsList, dynamicMembers, teamMembers, ccEvents, updateTheme, siteConfig, gallery }) {
  const [tab, setTab] = useState(adminData?.role === 'core_member' ? 'profile' : 'week');
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventFormData, setEventFormData] = useState({
    id: "", name: "", subtitle: "", date: "", color: "#C9A96E",
    desc: "", highlight: "", emoji: "📅", iconUrl: "", comingSoon: false, order: 99
  });
  const [profileForm, setProfileForm] = useState({ name: "", profilePic: "", insta: "", year: "1st Year" });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (adminData) {
      setProfileForm({ 
        name: adminData.name || "", 
        profilePic: adminData.profilePic || "",
        insta: adminData.insta || "",
        year: adminData.year || "1st Year"
      });
    }
  }, [adminData]);
  const [newEventPhoto, setNewEventPhoto] = useState("");
  const [bulkInput, setBulkInput] = useState("");
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  const [localEventPhotos, setLocalEventPhotos] = useState([]);
  const [localCoverPhotos, setLocalCoverPhotos] = useState([]);
  const [certs, setCerts] = useState([]);
  const [newCert, setNewCert] = useState({ name: "", serialNo: "", date: "", event: "", link: "" });
  
  const [featuredData, setFeaturedData] = useState({ 
    url: "", title: "", photographer: "", captureDate: new Date().toISOString().split('T')[0], 
    dept: "Computer Science & Engineering", year: "1st Year" 
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [bulkCertInput, setBulkCertInput] = useState("");
  const [showBulkCert, setShowBulkCert] = useState(false);
  const [bulkCoverInput, setBulkCoverInput] = useState("");
  const [showBulkCover, setShowBulkCover] = useState(false);
  const [siteForm, setSiteForm] = useState(siteConfig);
  const [isSavingSite, setIsSavingSite] = useState(false);

  useEffect(() => {
    if (tab === 'covers') {
      setLocalCoverPhotos(coverPhotos);
    }
  }, [tab, coverPhotos]);

  useEffect(() => {
    setSiteForm(siteConfig);
  }, [siteConfig]);

  useEffect(() => {
    if (editingEvent && editingEvent !== 'new') {
      const data = liveEvents[editingEvent];
      if (editingEvent === 'varnakriti' && data && !Array.isArray(data)) {
        setLocalEventPhotos(data.general || []);
      } else {
        setLocalEventPhotos(Array.isArray(data) ? data : []);
      }
    } else {
      setLocalEventPhotos([]);
    }
  }, [editingEvent, liveEvents]);

  const handleGlobalCleanup = async () => {
    if (!window.confirm("This will deduplicate and format ALL members. Proceed?")) return;
    try {
      const collections = ["members", "team_members"];
      let totalCleaned = 0;
      
      for (const collName of collections) {
        const q = query(collection(db, collName));
        const snap = await getDocs(q);
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const namesSeen = new Set();
        const deptMap = {
          "CE": "Civil Engineering", "ME": "Mechanical Engineering", "EE": "Electrical Engineering",
          "ECE": "Electronics & Communication Engineering", "CSE": "Computer Science & Engineering"
        };
        for (const m of all) {
          const cleanName = m.name?.trim();
          if (namesSeen.has(cleanName) && collName === "members") {
            await deleteDoc(doc(db, collName, m.id));
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
            await updateDoc(doc(db, collName, m.id), { dept: fixedDept, year: fixedYear, name: cleanName });
            totalCleaned++;
          }
          namesSeen.add(cleanName);
        }
      }
      alert(`System Cleanup Complete! ${totalCleaned} records updated.`);
    } catch (err) { alert("Cleanup Failed: " + err.message); }
  };

  const DEPTS = [
    "Computer Science & Engineering",
    "Electronics & Communication Engineering",
    "Mechanical Engineering",
    "Electrical Engineering",
    "Civil Engineering"
  ];
  const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Passout"];

  const handleDragStart = (e, index) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.target.style.opacity = "0.5";
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = "1";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetIndex, list, setter) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === targetIndex) return;

    const items = [...list];
    const draggedItem = items[draggedItemIndex];
    items.splice(draggedItemIndex, 1);
    items.splice(targetIndex, 0, draggedItem);
    
    setter(items);
    setDraggedItemIndex(null);
  };

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
    fetchAdmins();
  }, []);

  const fetchCerts = async () => {
    try {
      const snap = await getDocs(collection(db, "certificates"));
      setCerts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
  };

  const fetchAdmins = async () => {
    try {
      const snap = await getDocs(collection(db, "admins"));
      setAdmins(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
  };

  const addAdmin = async (e) => {
    e.preventDefault();
    if (!newAdminEmail) return;
    try {
      await setDoc(doc(db, "admins", newAdminEmail.trim().toLowerCase()), {
        addedBy: user.email,
        addedAt: new Date().toISOString(),
        role: "admin",
        canManageAdmins: false
      });
      setNewAdminEmail("");
      fetchAdmins();
      alert("Admin access granted!");
    } catch (err) {
      alert("Failed to add admin: " + err.message);
    }
  };
  
  const updateAdminPermissions = async (email, field, value) => {
    // Allow self-update of name, profilePic, insta, year, or lead-update of anything
    const allowedSelfFields = ['name', 'profilePic', 'insta', 'year'];
    const isSelfUpdate = email === user.email && allowedSelfFields.includes(field);
    const isAuthorized = adminData?.role === 'lead' || adminData?.role === 'incharge';
    if (!isAuthorized && !isSelfUpdate) return alert("Only Leads and In-charges can modify permissions.");
    try {
      const batch = writeBatch(db);
      
      // 1. Update Admins Collection
      batch.update(doc(db, "admins", email), { [field]: value });
      
      // 2. Sync with Team Members Collection if relevant fields change
      const syncFields = ['name', 'profilePic', 'insta', 'year'];
      if (syncFields.includes(field)) {
        const teamQ = query(collection(db, "team_members"), where("email", "==", email));
        const teamSnap = await getDocs(teamQ);
        if (!teamSnap.empty) {
          teamSnap.forEach(tDoc => {
            let teamField = field;
            if (field === 'profilePic') teamField = 'img';
            batch.update(doc(db, "team_members", tDoc.id), { [teamField]: value });
          });
        } else if (field === 'name' && value) {
          const nameQ = query(collection(db, "team_members"), where("name", "==", value));
          const nameSnap = await getDocs(nameQ);
          nameSnap.forEach(tDoc => {
            batch.update(doc(db, "team_members", tDoc.id), { email: email });
          });
        }
      }
      
      await batch.commit();
      fetchAdmins();
    } catch (err) { alert("Failed to update: " + err.message); }
  };

  const removeAdmin = async (email) => {
    if (email === user.email) return alert("You cannot remove your own admin access!");
    const isAuthorized = adminData?.role === 'lead' || adminData?.role === 'incharge';
    if (!isAuthorized) return alert("Only Leads and In-charges can revoke access.");
    if (window.confirm(`Revoke admin access for ${email}?`)) {
      try {
        await deleteDoc(doc(db, "admins", email));
        fetchAdmins();
        alert("Access revoked.");
      } catch (err) {
        alert("Failed to revoke: " + err.message);
      }
    }
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
      setNewCert({ name: "", serialNo: "", date: "", event: "", link: "" });
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

  const issueBulkCerts = async () => {
    if (!bulkCertInput.trim()) return;
    const lines = bulkCertInput.split('\n').filter(l => l.trim());
    const batch = writeBatch(db);
    let count = 0;
    
    try {
      lines.forEach(line => {
        const parts = line.split(',').map(s => s.trim());
        if (parts.length >= 4) {
          const [name, serialNo, date, event, link] = parts;
          const newDocRef = doc(collection(db, "certificates"));
          const certData = { 
            name, 
            serialNo, 
            date, 
            event, 
            createdAt: new Date().toISOString() 
          };
          if (link) {
            certData.link = link;
          }
          batch.set(newDocRef, certData);
          count++;
        }
      });
      
      if (count > 0) {
        await batch.commit();
        setBulkCertInput("");
        setShowBulkCert(false);
        fetchCerts();
        alert(`Successfully issued ${count} certificates!`);
      } else {
        alert("No valid certificate lines found. Format: Name, SerialNo, Date, Event");
      }
    } catch (err) {
      alert("Bulk Issue Error: " + err.message);
    }
  };

  const updateCovers = async (newUrls) => {
    try {
      await setDoc(doc(db, "config", "covers"), { urls: newUrls });
    } catch (err) { alert(err.message); }
  };

  const updateArchiveConfig = async (newOrder, newHidden) => {
    try {
      await setDoc(doc(db, "config", "archive"), { order: newOrder, hidden: newHidden });
    } catch (err) { alert(err.message); }
  };

  const reorderEvents = async (index, direction) => {
    const newList = [...liveEventsList];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newList.length) return;

    [newList[index], newList[targetIndex]] = [newList[targetIndex], newList[index]];

    try {
      const batch = writeBatch(db);
      newList.forEach((ev, idx) => {
        batch.update(doc(db, "events", ev.id), { order: idx + 1 });
      });
      await batch.commit();
    } catch (err) { alert(err.message); }
  };

  if (!adminData) return <div className="lightbox open" style={{ color: 'var(--white)' }}><div className="lightbox-content">Loading Admin Data...</div></div>;

  return (
    <div className="event-page-overlay" style={{ color: 'var(--white)', zIndex: 1500, background: '#0A0A0B' }}>
      <div className="container" style={{ paddingBottom: '5rem' }}>
        <header className="event-page-header">
          <button className="back-btn" onClick={onClose}><ArrowLeft /> Close Dashboard</button>
          <div className="section-label">Admin Console</div>
          <h1 className="section-title">Team <em>Dashboard</em></h1>
          <p className="section-sub">Logged in as: {user.email}</p>
          <button className="event-dive-btn" style={{ position: 'absolute', top: '0', right: 0 }} onClick={() => signOut(auth)}>Sign Out</button>
        </header>

        <div className="gallery-filter">
          {/* TIER 2: Management & TIER 3: Admin (Everyone except core_member has access to these) */}
          {adminData?.role !== 'core_member' && (
            <>
              <button className={`filter-btn ${tab === 'week' ? 'active' : ''}`} onClick={() => setTab('week')}>Set Week</button>
              <button className={`filter-btn ${tab === 'month' ? 'active' : ''}`} onClick={() => setTab('month')}>Set Month</button>
              <button className={`filter-btn ${tab === 'extra' ? 'active' : ''}`} onClick={() => setTab('extra')}>Set Extra Frame</button>
              <button className={`filter-btn ${tab === 'gallery' ? 'active' : ''}`} onClick={() => setTab('gallery')}>Manage Gallery</button>
              <button className={`filter-btn ${tab === 'apps' ? 'active' : ''}`} onClick={() => setTab('apps')}>Applications</button>
              <button className={`filter-btn ${tab === 'certs' ? 'active' : ''}`} onClick={() => setTab('certs')}>Certificates</button>
              <button className={`filter-btn ${tab === 'members' ? 'active' : ''}`} onClick={() => setTab('members')}>Manage Members</button>
              <button className={`filter-btn ${tab === 'events' ? 'active' : ''}`} onClick={() => setTab('events')}>Manage Events</button>
              <button className={`filter-btn ${tab === 'archive' ? 'active' : ''}`} onClick={() => setTab('archive')}>Manage Archive</button>
              <button className={`filter-btn ${tab === 'covers' ? 'active' : ''}`} onClick={() => setTab('covers')}>Manage Covers</button>
              <button className={`filter-btn ${tab === 'cc_events' ? 'active' : ''}`} onClick={() => setTab('cc_events')}>CC Event Panel</button>
            </>
          )}

          {/* TIER 2.5: System Management (Lead, Incharge, Coordinator, Moderator) */}
          {(adminData?.role === 'lead' || adminData?.role === 'incharge' || adminData?.role === 'coordinator' || adminData?.role === 'moderator' || adminData?.canManageAdmins) && (
            <>
              <button className={`filter-btn ${tab === 'team_mgmt' ? 'active' : ''}`} onClick={() => setTab('team_mgmt')}>Manage Core Team</button>
              <button className={`filter-btn ${tab === 'theme' ? 'active' : ''}`} onClick={() => setTab('theme')}>Theme Settings</button>
              <button className={`filter-btn ${tab === 'site' ? 'active' : ''}`} onClick={() => setTab('site')}>Site Settings</button>
            </>
          )}

          {/* TIER 3: Lead/Incharge/Admin Management Only */}
          {(adminData?.role === 'lead' || adminData?.role === 'incharge' || adminData?.canManageAdmins) && (
            <>
              <button className={`filter-btn ${tab === 'admins' ? 'active' : ''}`} onClick={() => setTab('admins')}>Manage Admins</button>
            </>
          )}
          
          {/* TIER 1: Everyone has access to Profile */}
          <button className={`filter-btn ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>Profile Settings</button>
        </div>
        <div className="admin-guide-box visible" style={{ 
          background: 'rgba(201,169,110,0.05)', 
          border: '1px dashed var(--gold)', 
          borderRadius: '16px', 
          padding: '1.5rem', 
          marginBottom: '2rem',
          fontSize: '0.85rem'
        }}>
          <h4 style={{ color: 'var(--gold)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🛠️ Admin Deployment Guide
          </h4>
          <p style={{ opacity: 0.8, marginBottom: '1rem' }}>
            For the best performance and consistency, follow this workflow before uploading any content:
          </p>
          <ol style={{ paddingLeft: '1.2rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', opacity: 0.9 }}>
            <li>
              <strong>Compress:</strong> Use <a href="https://imagecompressr.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--gold)', textDecoration: 'underline' }}>ImageCompressr</a> only if your image is more than 10 MB. Recommended settings: <b>Size: 2 MB</b>, <b>Quality: 60%</b>.
            </li>
            <li>
              <strong>Bypass Limits:</strong> If you hit the 100+ images limit or see a subscription prompt, simply <b>Clear Browser Cache</b> to reset the tool.
            </li>
            <li>
              <strong>Upload:</strong> Host the images on <a href="https://cloudinary.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--gold)', textDecoration: 'underline' }}>Cloudinary</a> to get delivery URLs / direct links.
            </li>
            <li>
              <strong>Link:</strong> Copy the <strong>Direct Link</strong> (ending in .jpg/.png or standard Cloudinary format) and paste it into the forms below.
            </li>
          </ol>
          <div style={{ fontSize: '0.75rem', opacity: 0.6, fontStyle: 'italic' }}>
            *Note: Only Direct Links will work. If the link doesn't end with an image extension, the site might show a broken image.
          </div>
        </div>

        {adminData?.role !== 'core_member' && (tab === 'week' || tab === 'month' || tab === 'extra') && (
          <div className="visible">
            <h3 className="subcategory-title">Update {tab === 'week' ? 'Weekly' : tab === 'month' ? 'Monthly' : 'Extra Frame'} <em>Featured</em></h3>
            <p className="section-sub" style={{ marginBottom: '1.5rem' }}>Use <strong>Direct Links</strong> (e.g., Cloudinary links starting with https://res.cloudinary.com/... or https://i.postimg.cc/...). Cloudinary is recommended for stability.</p>
            <div className="feedback-form" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem' }}>
              <input className="form-input" placeholder="Image Direct Link (https://res.cloudinary.com/...)" value={featuredData.url} onChange={e => {
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
                {isUpdating ? "Updating..." : `Update & Save to Gallery `}
              </button>
            </div>
          </div>
        )}


        {adminData?.role !== 'core_member' && tab === 'gallery' && (
          <div className="visible">
            <h3 className="subcategory-title">Gallery <em>Archive</em></h3>
            <div className="gallery-grid">
              {!gallery || gallery.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem 2rem', opacity: 0.5, border: '1px dashed var(--border)', borderRadius: '16px' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📸</div>
                  <p>The gallery is currently empty. Upload featured captures to see them here.</p>
                </div>
              ) : (
                gallery.map(g => (
                  <div key={g.id} className="gallery-item" style={{ border: '1px solid var(--border)', background: 'var(--card2)', display: 'flex', flexDirection: 'column' }}>
                    <img src={g.url} alt="" loading="lazy" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '12px 12px 0 0' }} referrerPolicy="no-referrer" />
                    <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--gold)', marginBottom: '0.2rem' }}>{g.title || "Untitled"}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: '1rem' }}>{g.photographer || "Unknown"} · {g.category}</div>
                      <button onClick={async () => {
                        if (window.confirm("Delete from Gallery?")) {
                          try { await deleteDoc(doc(db, "gallery", g.id)); alert("Deleted!"); }
                          catch (err) { alert("Error: " + err.message); }
                        }
                      }} style={{ background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', border: '1px solid rgba(255,77,77,0.2)', borderRadius: '6px', padding: '0.5rem', fontSize: '0.7rem', width: '100%', cursor: 'pointer', marginTop: 'auto' }}>Delete Photo 🗑️</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        {adminData?.role !== 'core_member' && tab === 'apps' && (
          <div className="visible">
            <h3 className="subcategory-title">Recruitment <em>Applications</em></h3>
            <AdminApplications />
          </div>
        )}

        {adminData?.role !== 'core_member' && tab === 'certs' && (
          <div className="visible">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 className="subcategory-title">Issue <em>Certificates</em></h3>
              <button 
                onClick={() => setShowBulkCert(!showBulkCert)} 
                style={{ background: 'var(--gold)', color: 'var(--ink)', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {showBulkCert ? "SWITCH TO SINGLE" : "🚀 SWITCH TO BULK ISSUE"}
              </button>
            </div>

            {showBulkCert ? (
              <div className="glass-form fade-in visible" style={{ padding: '2rem', marginBottom: '3rem' }}>
                <h4 style={{ color: 'var(--gold)', marginBottom: '1rem' }}>Bulk Certificate Issuance</h4>
                <p style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '1.5rem' }}>
                  Paste student details line by line from your Excel/Sheet. <br/>
                  <strong>Format:</strong> Student Name, Serial No, Date, Event, Certificate Link (Optional)
                </p>
                <textarea 
                  className="form-input" 
                  style={{ minHeight: '200px', fontSize: '0.8rem', fontFamily: 'monospace' }} 
                  placeholder="John Doe, CC-VAR-001, 15 Feb 2026, Varnakriti, https://res.cloudinary.com/...&#10;Jane Smith, CC-VAR-002, 15 Feb 2026, Varnakriti"
                  value={bulkCertInput}
                  onChange={e => setBulkCertInput(e.target.value)}
                />
                <button className="form-submit" style={{ marginTop: '1.5rem' }} onClick={issueBulkCerts}>
                  ISSUE ALL CERTIFICATES 
                </button>
              </div>
            ) : (
              <form className="feedback-form" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '3rem' }} onSubmit={addCert}>
                <input className="form-input" placeholder="Student Name" value={newCert.name} onChange={e => setNewCert({...newCert, name: e.target.value})} required />
                <input className="form-input" placeholder="Serial No (CC-XXXX)" value={newCert.serialNo} onChange={e => setNewCert({...newCert, serialNo: e.target.value})} required />
                <input className="form-input" placeholder="Issue Date" value={newCert.date} onChange={e => setNewCert({...newCert, date: e.target.value})} required />
                <input className="form-input" placeholder="Event Name" value={newCert.event} onChange={e => setNewCert({...newCert, event: e.target.value})} required />
                <input className="form-input" placeholder="Certificate Link (Optional)" value={newCert.link || ""} onChange={e => setNewCert({...newCert, link: e.target.value})} />
                <button className="form-submit" type="submit" style={{ gridColumn: '1 / -1' }}>Issue Certificate </button>
              </form>
            )}

            <h3 className="subcategory-title">Issued <em>Certificates</em></h3>
            <div className="admin-table-wrap" style={{ overflowX: 'auto', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '1rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                    <th style={{ padding: '1rem' }}>Student Name</th>
                    <th style={{ padding: '1rem' }}>Serial No</th>
                    <th style={{ padding: '1rem' }}>Event</th>
                    <th style={{ padding: '1rem' }}>Date</th>
                    <th style={{ padding: '1rem' }}>Link</th>
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
                        {(c.link || c.certUrl || c.url || c.certificateUrl || c.pdfUrl) ? (
                          <a href={c.link || c.certUrl || c.url || c.certificateUrl || c.pdfUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--gold)', textDecoration: 'underline' }}>View Link</a>
                        ) : (
                          <span style={{ opacity: 0.4 }}>None</span>
                        )}
                      </td>
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

        {adminData?.role !== 'core_member' && tab === 'members' && (
          <div className="visible">
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

        {tab === 'team_mgmt' && (adminData?.role === 'lead' || adminData?.canManageAdmins) && (
          <div className="fade-in visible">
            <h3 className="subcategory-title">Manage <em>Core Team & Incharges</em></h3>
            <p className="section-sub" style={{ marginBottom: '2rem' }}>Add, remove, or promote members within the Core Team, Incharge, and Coordinator sections.</p>
            <AdminTeamMgmt teamMembers={teamMembers} DEPTS={DEPTS} YEARS={YEARS} />
          </div>
        )}

        {adminData?.role !== 'core_member' && tab === 'events' && (
          <div className="visible">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 className="subcategory-title" style={{ margin: 0 }}>Manage <em>Events</em></h3>
              <button onClick={() => {
                setEditingEvent("new");
                setEventFormData({ id: "", name: "", subtitle: "", date: "", color: "#C9A96E", desc: "", highlight: "", emoji: "📅", iconUrl: "", comingSoon: false, order: liveEventsList.length + 1 });
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
                  <input className="form-input" placeholder="Emoji (Fallback)" value={eventFormData.emoji} onChange={e => setEventFormData({...eventFormData, emoji: e.target.value})} />
                  <input className="form-input" placeholder="Icon Direct Link (Optional)" value={eventFormData.iconUrl} onChange={e => setEventFormData({...eventFormData, iconUrl: e.target.value})} />
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
                    }}>SAVE EVENT </button>
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
                          const updated = [newEventPhoto, ...currentPhotos];
                          await updateDoc(doc(db, "events", editingEvent), {
                            photos: updated
                          });
                          setLocalEventPhotos(updated);
                          setNewEventPhoto("");
                        } catch (err) { alert(err.message); }
                      }}>Add Single +</button>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px dashed var(--border)', marginBottom: '2rem' }}>
                      <h5 style={{ fontSize: '0.8rem', color: 'var(--gold)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        🚀 Bulk Image Uploader 
                        <a href="https://cloudinary.com/" target="_blank" rel="noreferrer" style={{ fontSize: '0.6rem', background: 'var(--gold)', color: 'var(--ink)', padding: '0.2rem 0.5rem', borderRadius: '4px', textDecoration: 'none' }}>Open Cloudinary </a>
                      </h5>
                      <p style={{ fontSize: '0.7rem', opacity: 0.6, marginBottom: '1rem' }}>Upload your images to Cloudinary, copy the <strong>Direct Links/Delivery URLs</strong>, and paste them all below (separated by spaces or lines).</p>
                      <textarea 
                        className="form-input" 
                        style={{ minHeight: '120px', fontSize: '0.75rem', fontFamily: 'monospace' }} 
                        placeholder="Paste multiple links here... https://res.cloudinary.com/.../image.jpg"
                        value={bulkInput}
                        onChange={e => setBulkInput(e.target.value)}
                      />
                      <button className="form-submit" style={{ marginTop: '1rem', width: '100%', fontSize: '0.75rem' }} onClick={async () => {
                        const urls = bulkInput.split(/\s+/).filter(u => u.startsWith("http"));
                        if (urls.length === 0) return alert("No valid links found. Make sure they start with http");
                        try {
                          let current = liveEvents[editingEvent];
                          let updated;
                          
                          if (editingEvent === 'varnakriti' && !Array.isArray(current)) {
                            // If it's varnakriti and structured as sections, dump into 'general'
                            updated = {
                              ...current,
                              general: [...urls, ...(current.general || [])]
                            };
                          } else {
                            // Regular event or array-based varnakriti
                            const currentArr = Array.isArray(current) ? current : [];
                            updated = [...urls, ...currentArr];
                          }

                          await updateDoc(doc(db, "events", editingEvent), {
                            photos: updated
                          });
                          setLocalEventPhotos(Array.isArray(updated) ? updated : (updated.general || []));
                          setBulkInput("");
                          alert(`${urls.length} photos added successfully to ${editingEvent}!`);
                        } catch (err) { alert("Dump Error: " + err.message); }
                      }}>DUMP BULK PHOTOS </button>
                    </div>

                    <h4 style={{ color: 'var(--gold)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      Gallery Preview 
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.6rem', opacity: 0.5, fontWeight: 'normal' }}>🖱️ Drag to reorder</span>
                        <button className="admin-nav-btn" style={{ background: 'var(--gold)', color: 'var(--ink)', padding: '0.3rem 0.8rem' }} onClick={async () => {
                          try {
                            let updatedData;
                            if (editingEvent === 'varnakriti' && !Array.isArray(liveEvents[editingEvent])) {
                              updatedData = {
                                ...liveEvents[editingEvent],
                                general: localEventPhotos
                              };
                            } else {
                              updatedData = localEventPhotos;
                            }
                            
                            await updateDoc(doc(db, "events", editingEvent), { photos: updatedData });
                            alert("Photo order saved!");
                          } catch (err) { alert(err.message); }
                        }}>SAVE PHOTO ORDER</button>
                      </div>
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' }}>
                      {localEventPhotos.map((url, idx) => (
                        <div 
                          key={idx} 
                          style={{ position: 'relative', cursor: 'move', transition: 'transform 0.2s' }}
                          draggable="true"
                          onDragStart={(e) => handleDragStart(e, idx)}
                          onDragEnd={handleDragEnd}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, idx, localEventPhotos, setLocalEventPhotos)}
                        >
                          <img src={url} alt="" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px', border: draggedItemIndex === idx ? '2px solid var(--gold)' : '1px solid var(--border)' }} referrerPolicy="no-referrer" />
                          <button onClick={() => {
                            if (window.confirm("Remove this photo?")) {
                              const updated = localEventPhotos.filter((_, i) => i !== idx);
                              setLocalEventPhotos(updated);
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
                      <th style={{ padding: '1rem' }}>Sequence</th>
                      <th style={{ padding: '1rem' }}>Photos</th>
                      <th style={{ padding: '1rem' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveEventsList.map((ev, idx) => (
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
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button 
                              disabled={idx === 0}
                              onClick={() => reorderEvents(idx, -1)}
                              style={{ background: 'transparent', border: '1px solid var(--gold)', color: 'var(--gold)', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.6rem', opacity: idx === 0 ? 0.3 : 1 }}>▲</button>
                            <button 
                              disabled={idx === liveEventsList.length - 1}
                              onClick={() => reorderEvents(idx, 1)}
                              style={{ background: 'transparent', border: '1px solid var(--gold)', color: 'var(--gold)', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.6rem', opacity: idx === liveEventsList.length - 1 ? 0.3 : 1 }}>▼</button>
                          </div>
                        </td>
                        <td style={{ padding: '1rem' }}>{flattenPhotos(liveEvents[ev.id]).length} photos</td>
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
        {adminData?.role !== 'core_member' && tab === 'cc_events' && <AdminCCEvents ccEvents={ccEvents} />}
        {adminData?.role !== 'core_member' && tab === 'archive' && (
          <div className="visible">
            <h3 className="subcategory-title">Manage <em>Archive Timeline</em></h3>
            <p className="section-sub" style={{ marginBottom: '2rem' }}>Reorder how events appear in the Universal Gallery. Use 'Hide' to remove them from the archive without deleting the event itself.</p>
            
            <div className="admin-table-wrap" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {[...liveEventsList]
                  .filter(ev => !archiveConfig.hidden?.includes(ev.id))
                  .sort((a, b) => {
                    const idxA = archiveConfig.order?.indexOf(a.id);
                    const idxB = archiveConfig.order?.indexOf(b.id);
                    if (idxA === -1 && idxB === -1) return (a.order || 99) - (b.order || 99);
                    if (idxA === -1 || idxA === undefined) return 1;
                    if (idxB === -1 || idxB === undefined) return -1;
                    return idxA - idxB;
                  })
                  .map((ev, idx, arr) => (
                    <div key={ev.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--gold)', color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>{idx + 1}</div>
                        <div>
                          <div style={{ fontWeight: '600' }}>{ev.name}</div>
                          <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>{ev.date}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          disabled={idx === 0}
                          onClick={() => {
                            const newOrder = arr.map(e => e.id);
                            [newOrder[idx], newOrder[idx-1]] = [newOrder[idx-1], newOrder[idx]];
                            updateArchiveConfig(newOrder, archiveConfig.hidden || []);
                          }}
                          style={{ padding: '0.3rem 0.6rem', borderRadius: '4px', border: '1px solid var(--gold)', color: 'var(--gold)', background: 'transparent', cursor: 'pointer', fontSize: '0.7rem', opacity: idx === 0 ? 0.3 : 1 }}>▲</button>
                        <button 
                          disabled={idx === arr.length - 1}
                          onClick={() => {
                            const newOrder = arr.map(e => e.id);
                            [newOrder[idx], newOrder[idx+1]] = [newOrder[idx+1], newOrder[idx]];
                            updateArchiveConfig(newOrder, archiveConfig.hidden || []);
                          }}
                          style={{ padding: '0.3rem 0.6rem', borderRadius: '4px', border: '1px solid var(--gold)', color: 'var(--gold)', background: 'transparent', cursor: 'pointer', fontSize: '0.7rem', opacity: idx === arr.length - 1 ? 0.3 : 1 }}>▼</button>
                        <button 
                          onClick={() => {
                            const hidden = [...(archiveConfig.hidden || []), ev.id];
                            updateArchiveConfig(archiveConfig.order || arr.map(e => e.id), hidden);
                          }}
                          style={{ padding: '0.3rem 0.6rem', borderRadius: '4px', background: '#ff4444', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '0.7rem' }}>Hide from Archive</button>
                      </div>
                    </div>
                  ))}
              </div>

              {archiveConfig.hidden?.length > 0 && (
                <div style={{ marginTop: '3rem' }}>
                  <h4 style={{ color: 'var(--gold)', marginBottom: '1rem', fontSize: '0.9rem' }}>Hidden from Archive</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                    {archiveConfig.hidden.map(hid => (
                      <div key={hid} style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span>{hid}</span>
                        <button 
                          onClick={() => {
                            const hidden = archiveConfig.hidden.filter(h => h !== hid);
                            updateArchiveConfig(archiveConfig.order || [], hidden);
                          }}
                          style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontWeight: 'bold' }}>Restore</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {adminData?.role !== 'core_member' && tab === 'covers' && (
          <div className="visible">
            <h3 className="subcategory-title">Manage <em>Hero Covers</em></h3>
            <p className="section-sub" style={{ marginBottom: '2rem' }}>Add or remove background images for the home page. Use direct image links.</p>
            
            <div className="glass-form" style={{ padding: '2rem' }}>
              <form className="feedback-form" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', padding: '1.5rem', borderRadius: '16px' }} onSubmit={(e) => {
                e.preventDefault();
                const url = e.target.coverUrl.value.trim();
                if (url) {
                  setLocalCoverPhotos([...localCoverPhotos, url]);
                  e.target.coverUrl.value = "";
                }
              }}>
                <input name="coverUrl" className="form-input" style={{ flex: 1 }} placeholder="Image Direct Link (https://...)" required />
                <button className="form-submit" type="submit" style={{ width: 'auto', padding: '0 2rem' }}>Add Cover </button>
              </form>

              <div style={{ marginBottom: '2rem' }}>
                <button 
                  onClick={() => setShowBulkCover(!showBulkCover)} 
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--gold)', border: '1px solid var(--gold)', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.7rem', cursor: 'pointer', marginBottom: '1rem' }}
                >
                  {showBulkCover ? "Hide Bulk Upload" : "🚀 Bulk Upload Covers"}
                </button>

                {showBulkCover && (
                  <div className="fade-in visible" style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                    <p style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '1rem' }}>Paste multiple direct links (one per line or separated by spaces).</p>
                    <textarea 
                      className="form-input" 
                      style={{ minHeight: '150px', fontSize: '0.75rem', fontFamily: 'monospace' }} 
                      placeholder="https://i.ibb.co/image1.jpg&#10;https://i.ibb.co/image2.jpg"
                      value={bulkCoverInput}
                      onChange={e => setBulkCoverInput(e.target.value)}
                    />
                    <button 
                      className="form-submit" 
                      style={{ marginTop: '1rem', width: '100%' }}
                      onClick={() => {
                        const urls = bulkCoverInput.split(/\s+/).filter(u => u.startsWith("http"));
                        if (urls.length === 0) return alert("No valid links found.");
                        setLocalCoverPhotos([...urls, ...localCoverPhotos]);
                        setBulkCoverInput("");
                        setShowBulkCover(false);
                        alert(`${urls.length} covers added to pending list!`);
                      }}
                    >
                      DUMP BULK COVERS 
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h4 style={{ color: 'var(--gold)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Cover Gallery Preview 
                  <span style={{ fontSize: '0.6rem', opacity: 0.5, fontWeight: 'normal' }}>🖱️ Drag to reorder</span>
                </h4>
                <button className="admin-nav-btn" style={{ background: 'var(--gold)', color: 'var(--ink)', padding: '0.3rem 0.8rem' }} onClick={() => {
                  updateCovers(localCoverPhotos);
                  alert("Cover order saved!");
                }}>SAVE COVER ORDER</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                {localCoverPhotos.map((url, idx) => (
                  <div 
                    key={idx} 
                    style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', height: '150px', border: draggedItemIndex === idx ? '2px solid var(--gold)' : '1px solid var(--border)', background: 'rgba(0,0,0,0.2)', cursor: 'move', transition: 'transform 0.2s' }}
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, idx, localCoverPhotos, setLocalCoverPhotos)}
                  >
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                    <button 
                      onClick={() => {
                        if (window.confirm("Remove this cover?")) {
                          const newCovers = localCoverPhotos.filter((_, i) => i !== idx);
                          setLocalCoverPhotos(newCovers);
                        }
                      }}
                      style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: '#ff4444', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.3rem', cursor: 'pointer', fontSize: '0.6rem', zIndex: 10 }}
                    >✕ DELETE</button>
                    <div style={{ position: 'absolute', bottom: 5, left: 5, background: 'rgba(0,0,0,0.5)', padding: '2px 5px', borderRadius: '4px', fontSize: '8px', pointerEvents: 'none' }}>#{idx + 1}</div>
                  </div>
                ))}
                {localCoverPhotos.length === 0 && <div style={{ gridColumn: '1/-1', padding: '3rem', textAlign: 'center', opacity: 0.5, border: '1px dashed var(--border)', borderRadius: '12px' }}>Using default covers. Add some to customize!</div>}
              </div>
            </div>
          </div>
        )}

        {tab === 'theme' && (adminData?.role === 'lead' || adminData?.canManageAdmins) && (
          <div className="visible">
            <h3 className="subcategory-title">Webpage <em>Style Options</em></h3>
            <p className="section-sub" style={{ marginBottom: '2rem' }}>Select a standardized visual style for this academic semester. This updates colors and headings across the entire platform.</p>
            
            <div className="theme-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
              {THEMES.map(t => (
                <div 
                  key={t.id} 
                  className={`theme-card ${themeId === t.id ? 'active' : ''}`}
                  onClick={() => updateTheme(t.id)}
                  style={{ 
                    background: 'rgba(255,255,255,0.03)', 
                    border: themeId === t.id ? '2px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: t.primary }}></div>
                    <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{t.name}</div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '1rem' }}>
                    <div style={{ flex: 1, height: '4px', background: t.primary, borderRadius: '2px' }}></div>
                    <div style={{ flex: 1, height: '4px', background: t.secondary, borderRadius: '2px' }}></div>
                    <div style={{ flex: 1, height: '4px', background: t.heading, borderRadius: '2px' }}></div>
                  </div>

                  <div style={{ fontSize: '0.7rem', opacity: 0.6, fontStyle: 'italic' }}>
                    Sample Heading: <span style={{ color: t.heading }}>{t.name}</span>
                  </div>

                  {themeId === t.id && (
                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--gold)', color: 'var(--ink)', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>✓</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === 'site' && (adminData?.role === 'lead' || adminData?.canManageAdmins) && (
          <div className="visible">
            <h3 className="subcategory-title">Site <em>Configuration</em></h3>
            <p className="section-sub" style={{ marginBottom: '2rem' }}>Manage global brand identity, hero texts, and social links.</p>
            
            <div className="glass-form" style={{ padding: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {/* IDENTITY */}
                <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '2rem' }}>
                  <h4 style={{ color: 'var(--gold)', marginBottom: '1rem', fontSize: '0.9rem' }}>Brand Identity</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>Site Name</label>
                      <input className="form-input" value={siteForm.siteName} onChange={e => setSiteForm({...siteForm, siteName: e.target.value})} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>Logo URL</label>
                      <input className="form-input" value={siteForm.logoUrl} onChange={e => setSiteForm({...siteForm, logoUrl: e.target.value})} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>Favicon URL</label>
                      <input className="form-input" value={siteForm.faviconUrl} onChange={e => setSiteForm({...siteForm, faviconUrl: e.target.value})} />
                    </div>
                  </div>
                </div>

                {/* HERO */}
                <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '2rem' }}>
                  <h4 style={{ color: 'var(--gold)', marginBottom: '1rem', fontSize: '0.9rem' }}>Hero Section</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>Eyebrow Text</label>
                      <input className="form-input" value={siteForm.heroEyebrow} onChange={e => setSiteForm({...siteForm, heroEyebrow: e.target.value})} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>Title (Use \n for new line)</label>
                      <textarea className="form-input" style={{ minHeight: '60px' }} value={siteForm.heroTitle} onChange={e => setSiteForm({...siteForm, heroTitle: e.target.value})} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>Tagline</label>
                      <input className="form-input" value={siteForm.heroTagline} onChange={e => setSiteForm({...siteForm, heroTagline: e.target.value})} />
                    </div>
                  </div>
                </div>

                {/* SOCIALS */}
                <div style={{ paddingBottom: '2rem' }}>
                  <h4 style={{ color: 'var(--gold)', marginBottom: '1rem', fontSize: '0.9rem' }}>Social Links</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>Instagram Link</label>
                      <input className="form-input" value={siteForm.instaLink} onChange={e => setSiteForm({...siteForm, instaLink: e.target.value})} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>WhatsApp Link</label>
                      <input className="form-input" value={siteForm.waLink} onChange={e => setSiteForm({...siteForm, waLink: e.target.value})} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', opacity: 0.6 }}>Facebook Link</label>
                      <input className="form-input" value={siteForm.fbLink} onChange={e => setSiteForm({...siteForm, fbLink: e.target.value})} />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(201,169,110,0.1)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid var(--gold)' }}>
                <h5 style={{ color: 'var(--gold)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>💡 How to update Logo & Favicon?</h5>
                <p style={{ fontSize: '0.7rem', opacity: 0.8, lineHeight: '1.5' }}>
                  1. You cannot upload ZIP files directly. Extract your images first.<br/>
                  2. Upload your preferred logo (square) or favicon to a service like <a href="https://cloudinary.com" target="_blank" rel="noreferrer" style={{ color: 'var(--gold)' }}>Cloudinary</a> or <a href="https://postimages.org" target="_blank" rel="noreferrer" style={{ color: 'var(--gold)' }}>PostImage</a>.<br/>
                  3. Copy the <strong>Direct Link</strong> (ending in .jpg, .png, or .ico) and paste it into the fields above.
                </p>
              </div>

              <button 
                className="form-submit" 
                style={{ marginTop: '2rem', width: '100%' }}
                disabled={isSavingSite}
                onClick={async () => {
                  setIsSavingSite(true);
                  try {
                    await setDoc(doc(db, "config", "site"), siteForm);
                    alert("Site configuration saved successfully!");
                  } catch (err) { alert(err.message); }
                  setIsSavingSite(false);
                }}
              >
                {isSavingSite ? "Saving..." : "UPDATE GLOBAL SITE SETTINGS "}
              </button>
            </div>
          </div>
        )}
        {tab === "admins" && (adminData?.role === "lead" || adminData?.canManageAdmins) && (
          <div className="visible">
            <h3 className="subcategory-title">Manage <em>Admin Access</em></h3>
            <p className="section-sub" style={{ marginBottom: "2rem" }}>Only authorized emails can access this console. <strong>In-charges</strong> can manage permissions for others.</p>
            
            <form className="feedback-form" style={{ display: "flex", gap: "1rem", marginBottom: "3rem", padding: "2.5rem", alignItems: "stretch" }} onSubmit={addAdmin}>
              <input 
                className="form-input" 
                style={{ flex: 1, margin: 0 }} 
                placeholder="New Admin Email (e.g. name@gmail.com)" 
                value={newAdminEmail} 
                onChange={e => setNewAdminEmail(e.target.value)} 
                required 
              />
              <button className="form-submit" type="submit" style={{ width: "auto", padding: "0 2.5rem", margin: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>Authorize Access <ArrowRight /></button>
            </form>
            <div className="admin-table-wrap" style={{ overflowX: 'auto', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '1rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                    <th style={{ padding: '1rem' }}>Name</th>
                    <th style={{ padding: '1rem' }}>Admin Email</th>
                    <th style={{ padding: '1rem' }}>Role</th>
                    <th style={{ padding: '1rem' }}>Management</th>
                    <th style={{ padding: '1rem' }}>Added At</th>
                    <th style={{ padding: '1rem' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map(adm => (
                    <tr key={adm.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                          <img src={adm.profilePic || "https://ui-avatars.com/api/?name=" + (adm.name || adm.id) + "&background=C9A96E&color=111"} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                          <span style={{ fontWeight: '600' }}>{adm.name || 'No Name'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', opacity: 0.7 }}>{adm.id}</td>
                      <td style={{ padding: '1rem' }}>
                        <select 
                          className="form-input" 
                          style={{ padding: '0.2rem', fontSize: '0.7rem', width: 'auto', height: 'auto', background: 'transparent' }}
                          value={adm.role || 'core_member'}
                          onChange={(e) => updateAdminPermissions(adm.id, 'role', e.target.value)}
                          disabled={adminData?.role !== 'lead' || adm.id === user.email}
                        >
                          <option value="core_member" style={{ color: '#000' }}>Core Member</option>
                          <option value="coordinator" style={{ color: '#000' }}>Coordinator</option>
                          <option value="moderator" style={{ color: '#000' }}>Moderator</option>
                          <option value="incharge" style={{ color: '#000' }}>In-charge</option>
                          <option value="pr_manager" style={{ color: '#000' }}>PR Manager</option>
                          <option value="lead" style={{ color: '#000' }}>Lead (Developer)</option>
                        </select>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input 
                            type="checkbox" 
                            checked={adm.role === 'lead' || adm.canManageAdmins} 
                            disabled={(adminData?.role !== 'lead' && adminData?.role !== 'incharge') || adm.role === 'lead' || adm.id === user.email}
                            onChange={(e) => updateAdminPermissions(adm.id, 'canManageAdmins', e.target.checked)}
                          />
                          <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>Can Manage Admins</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', opacity: 0.5 }}>{adm.addedAt ? new Date(adm.addedAt).toLocaleDateString() : 'N/A'}</td>
                      <td style={{ padding: '1rem' }}>
                        <button 
                          onClick={() => removeAdmin(adm.id)} 
                          style={{ background: adm.id === user.email ? 'rgba(255,255,255,0.1)' : '#ff4444', border: 'none', color: '#fff', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: adm.id === user.email ? 'default' : 'pointer', fontSize: '0.7rem' }}
                          disabled={adm.id === user.email || (adm.role === 'lead' && adminData?.role !== 'lead')}
                        >
                          {adm.id === user.email ? 'You (Current)' : 'Revoke Access'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'profile' && (
          <div className="visible">
            <h3 className="subcategory-title">Profile <em>Settings</em></h3>
            <p className="section-sub" style={{ marginBottom: '2rem' }}>Update your administrative profile details. These are visible to other leads and managers.</p>
            
            <div className="glass-form" style={{ padding: '2.5rem', maxWidth: '600px' }}>
              <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--gold)', overflow: 'hidden', marginBottom: '1rem' }}>
                    <img src={adminData?.profilePic || "https://ui-avatars.com/api/?name=" + (adminData?.name || user.email) + "&background=C9A96E&color=111"} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                  </div>
                  <span style={{ fontSize: '0.6rem', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 'bold' }}>{adminData?.role?.replace('_', ' ') || 'Admin'}</span>
                </div>
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '0.7rem', color: 'var(--gold)', marginBottom: '0.5rem', display: 'block' }}>Display Name</label>
                    <input className="form-input" placeholder="Your Name" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '0.7rem', color: 'var(--gold)', marginBottom: '0.5rem', display: 'block' }}>Profile Picture Link</label>
                    <input className="form-input" placeholder="https://..." value={profileForm.profilePic} onChange={e => setProfileForm({...profileForm, profilePic: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '0.7rem', color: 'var(--gold)', marginBottom: '0.5rem', display: 'block' }}>Instagram URL</label>
                    <input className="form-input" placeholder="https://instagram.com/your-username" value={profileForm.insta} onChange={e => setProfileForm({...profileForm, insta: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '0.7rem', color: 'var(--gold)', marginBottom: '0.5rem', display: 'block' }}>Academic Year</label>
                    <select className="form-input" value={profileForm.year} onChange={e => setProfileForm({...profileForm, year: e.target.value})} style={{ appearance: 'none', background: 'rgba(255,255,255,0.02)' }}>
                      <option value="1st Year" style={{ color: '#000' }}>1st Year</option>
                      <option value="2nd Year" style={{ color: '#000' }}>2nd Year</option>
                      <option value="3rd Year" style={{ color: '#000' }}>3rd Year</option>
                      <option value="4th Year" style={{ color: '#000' }}>4th Year</option>
                      <option value="Passout" style={{ color: '#000' }}>Passout</option>
                      <option value="Alumni" style={{ color: '#000' }}>Alumni</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '0.7rem', color: 'var(--gold)', marginBottom: '0.5rem', display: 'block' }}>Email Address (Read-only)</label>
                    <input className="form-input" value={user.email} disabled style={{ opacity: 0.5 }} />
                  </div>
                  <button 
                    className="form-submit" 
                    disabled={isSavingProfile}
                    onClick={async () => {
                      setIsSavingProfile(true);
                      const fields = Object.keys(profileForm);
                      for (const f of fields) {
                        await updateAdminPermissions(user.email, f, profileForm[f]);
                      }
                      setIsSavingProfile(false);
                      alert("Profile updated successfully!");
                    }}
                  >
                    {isSavingProfile ? "Saving..." : "SAVE PROFILE SETTINGS "}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminCCEvents({ ccEvents }) {
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    title: "", subtitle: "", order: 1,
    winners: {
      "1st": { name: "", dept: "", year: "1st Year", url: "" },
      "2nd": { name: "", dept: "", year: "1st Year", url: "" },
      "3rd": { name: "", dept: "", year: "1st Year", url: "" }
    }
  });

  const save = async () => {
    if (!formData.title) return alert("Title required");
    try {
      const id = editing === 'new' ? formData.title.toLowerCase().replace(/ /g, '-') : editing;
      await setDoc(doc(db, "cc_events", id), formData, { merge: true });
      setEditing(null);
      alert("CC Event Winners Saved!");
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="fade-in visible">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h3 className="subcategory-title" style={{ margin: 0 }}>CC Event <em>Winners Panel</em></h3>
        <button className="admin-nav-btn" style={{ background: 'var(--gold)', color: 'var(--ink)' }} onClick={() => {
          setEditing('new');
          setFormData({ title: "", subtitle: "", order: ccEvents.length + 1, winners: { "1st": { name: "", dept: "", year: "1st Year", url: "" }, "2nd": { name: "", dept: "", year: "1st Year", url: "" }, "3rd": { name: "", dept: "", year: "1st Year", url: "" } } });
        }}>➕ ADD EVENT WINNERS</button>
      </div>

      {editing ? (
        <div className="glass-form fade-in visible" style={{ padding: '2rem', marginBottom: '3rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
            <input className="form-input" placeholder="Event Title (e.g. Varnakriti 2026)" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            <input className="form-input" placeholder="Subtitle" value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} />
            <input className="form-input" type="number" placeholder="Order" value={formData.order} onChange={e => setFormData({...formData, order: parseInt(e.target.value)})} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {["1st", "2nd", "3rd"].map(rank => (
              <div key={rank} style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <h4 style={{ color: rank === '1st' ? 'var(--gold)' : '#fff', marginBottom: '1rem' }}>{rank} Place Winner</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <input className="form-input" placeholder="Student Name" value={formData.winners[rank].name} onChange={e => {
                    const w = {...formData.winners}; w[rank].name = e.target.value; setFormData({...formData, winners: w});
                  }} />
                  <select className="form-input" value={formData.winners[rank].dept} onChange={e => {
                    const w = {...formData.winners}; w[rank].dept = e.target.value; setFormData({...formData, winners: w});
                  }}>
                    <option value="">Select Dept</option>
                    {["Computer Science & Engineering", "Electronics & Communication Engineering", "Electrical Engineering", "Mechanical Engineering", "Civil Engineering"].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <select className="form-input" value={formData.winners[rank].year} onChange={e => {
                    const w = {...formData.winners}; w[rank].year = e.target.value; setFormData({...formData, winners: w});
                  }}>
                    <option value="">Select Year</option>
                    {["1st Year", "2nd Year", "3rd Year", "4th Year", "Passout"].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <input className="form-input" placeholder="Image Direct Link" value={formData.winners[rank].url} onChange={e => {
                    const w = {...formData.winners}; w[rank].url = e.target.value; setFormData({...formData, winners: w});
                  }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
            <button className="form-submit" style={{ flex: 1 }} onClick={save}>SAVE WINNERS </button>
            <button className="form-submit" style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: '#fff' }} onClick={() => setEditing(null)}>CANCEL</button>
          </div>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                <th style={{ padding: '1rem' }}>Event Title</th>
                <th style={{ padding: '1rem' }}>1st Place</th>
                <th style={{ padding: '1rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {ccEvents.map(ev => (
                <tr key={ev.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem' }}>{ev.title}</td>
                  <td style={{ padding: '1rem' }}>{ev.winners?.["1st"]?.name || "N/A"}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="admin-nav-btn" style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem' }} onClick={() => { setEditing(ev.id); setFormData(ev); }}>Edit</button>
                      <button className="admin-nav-btn" style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', background: '#ff4444' }} onClick={async () => {
                        if (window.confirm("Delete this event result?")) await deleteDoc(doc(db, "cc_events", ev.id));
                      }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


function AdminTeamMgmt({ teamMembers, DEPTS, YEARS }) {
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: "", role: "", email: "", category: "core", dept: DEPTS[0], year: YEARS[0], img: "", insta: "", order: 99
  });
  const [isSeeding, setIsSeeding] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);

  const handlePromoteYears = async () => {
    if (!window.confirm("CRITICAL: This will increment the year for ALL members and team members (1st -> 2nd, 2nd -> 3rd, 3rd -> 4th, 4th -> Passout). Proceed?")) return;
    
    setIsPromoting(true);
    try {
      const colls = ["members", "team_members"];
      let totalUpdated = 0;

      for (const collName of colls) {
        const snap = await getDocs(collection(db, collName));
        const batch = writeBatch(db);
        let batchCount = 0;

        snap.forEach(d => {
          const data = d.data();
          let newYear = data.year || "";
          
          if (newYear === "1st Year") newYear = "2nd Year";
          else if (newYear === "2nd Year") newYear = "3rd Year";
          else if (newYear === "3rd Year") newYear = "4th Year";
          else if (newYear === "4th Year") newYear = "Passout";
          
          if (newYear !== data.year) {
            batch.update(doc(db, collName, d.id), { year: newYear });
            batchCount++;
          }
        });

        if (batchCount > 0) {
          await batch.commit();
          totalUpdated += batchCount;
        }
      }
      alert(`Successfully promoted years for ${totalUpdated} members!`);
    } catch (err) {
      alert("Promotion failed: " + err.message);
    } finally {
      setIsPromoting(false);
    }
  };

  const save = async () => {
    if (!formData.name || !formData.img) return alert("Name and Image URL are required");
    try {
      const id = editing === 'new' ? formData.name.toLowerCase().replace(/ /g, '-') + '-' + Date.now() : editing;
      // If new, set order to end of category
      const currentList = teamMembers[formData.category] || [];
      const newOrder = editing === 'new' ? currentList.length : formData.order;
      
      await setDoc(doc(db, "team_members", id), { ...formData, order: newOrder }, { merge: true });
      setEditing(null);
      alert("Member Saved!");
    } catch (err) { alert(err.message); }
  };

  const reorder = async (category, index, direction) => {
    const list = teamMembers[category] || [];
    if (direction === 'up' && index > 0) {
      const itemA = list[index];
      const itemB = list[index - 1];
      
      const batch = writeBatch(db);
      // Ensure we swap actual values, fallback to index if missing
      const posA = itemA.order ?? index;
      const posB = itemB.order ?? (index - 1);
      
      // If positions are same, force posA to be posB + 1
      const finalPosA = posA === posB ? posB + 1 : posB;
      const finalPosB = posA === posB ? posB : posA;

      batch.update(doc(db, "team_members", itemA.id), { order: finalPosB });
      batch.update(doc(db, "team_members", itemB.id), { order: finalPosA });
      await batch.commit();
    } else if (direction === 'down' && index < list.length - 1) {
      const itemA = list[index];
      const itemB = list[index + 1];
      
      const batch = writeBatch(db);
      const posA = itemA.order ?? index;
      const posB = itemB.order ?? (index + 1);
      
      const finalPosA = posA === posB ? posB - 1 : posB;
      const finalPosB = posA === posB ? posB : posA;

      batch.update(doc(db, "team_members", itemA.id), { order: finalPosA });
      batch.update(doc(db, "team_members", itemB.id), { order: finalPosB });
      await batch.commit();
    }
  };

  const deleteMember = async (id) => {
    if (window.confirm("Remove this member from the team?")) {
      try {
        await deleteDoc(doc(db, "team_members", id));
        alert("Member removed.");
      } catch (err) { alert(err.message); }
    }
  };

  const seedData = async () => {
    if (!window.confirm("This will initialize the database with current hardcoded team data. Continue?")) return;
    setIsSeeding(true);
    try {
      const batch = writeBatch(db);
      const categories = ['founders', 'incharge', 'coordinators', 'core'];
      
      for (const cat of categories) {
        TEAM_DATA[cat].forEach((m, idx) => {
          const docRef = doc(collection(db, "team_members"));
          batch.set(docRef, { ...m, category: cat, order: idx, createdAt: serverTimestamp() });
        });
      }
      await batch.commit();
      alert("Team data initialized successfully!");
    } catch (err) { alert("Seed failed: " + err.message); }
    finally { setIsSeeding(false); }
  };

  const categories = [
    { id: 'founders', label: 'Founders' },
    { id: 'incharge', label: 'Incharges' },
    { id: 'coordinators', label: 'Coordinators' },
    { id: 'core', label: 'Core Team' }
  ];

  return (
    <div className="admin-team-mgmt">
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button className="admin-nav-btn" style={{ background: 'var(--gold)', color: 'var(--ink)' }} onClick={() => {
          setEditing('new');
          setFormData({ name: "", role: "", email: "", category: "core", dept: DEPTS[0], year: YEARS[0], img: "", insta: "", order: 99 });
        }}>➕ ADD TEAM MEMBER</button>
        <button className="admin-nav-btn" style={{ opacity: 0.5 }} onClick={seedData} disabled={isSeeding}>
          {isSeeding ? "Initializing..." : "🚀 INITIALIZE FROM CODE (Run Once)"}
        </button>
        <button className="admin-nav-btn" style={{ background: '#4CAF50', color: '#fff', border: 'none' }} onClick={handlePromoteYears} disabled={isPromoting}>
          {isPromoting ? "Promoting..." : "📅 PROMOTE ALL YEARS (Academic Session Start)"}
        </button>
      </div>

      {editing ? (
        <div className="glass-form fade-in visible" style={{ padding: '2rem', marginBottom: '3rem' }}>
          <h4 style={{ color: 'var(--gold)', marginBottom: '1.5rem' }}>{editing === 'new' ? 'Add' : 'Edit'} Team Member</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem' }}>
            <input className="form-input" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <input className="form-input" placeholder="Role (e.g. Photographer)" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} />
            <input className="form-input" placeholder="Email Address (To Link Profile)" value={formData.email || ""} onChange={e => setFormData({...formData, email: e.target.value.toLowerCase().trim()})} />
            
            <select className="form-input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
              {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>

            <select className="form-input" value={formData.dept} onChange={e => setFormData({...formData, dept: e.target.value})}>
              {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
              <option value="Passout">Passout</option>
            </select>

            <select className="form-input" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})}>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              <option value="Alumni">Alumni</option>
            </select>

            <input className="form-input" placeholder="Image Direct Link (Cloudinary/PostImg)" value={formData.img} onChange={e => setFormData({...formData, img: e.target.value})} />
            <input className="form-input" placeholder="Instagram URL (Optional)" value={formData.insta} onChange={e => setFormData({...formData, insta: e.target.value})} />

            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button className="form-submit" style={{ flex: 1 }} onClick={save}>SAVE MEMBER </button>
              <button className="form-submit" style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: '#fff' }} onClick={() => setEditing(null)}>CANCEL</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="admin-table-wrap">
          {categories.map(cat => (
            <div key={cat.id} style={{ marginBottom: '3rem' }}>
              <h4 style={{ color: 'var(--gold)', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>{cat.label}</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ textAlign: 'left', opacity: 0.6 }}>
                    <th style={{ padding: '0.8rem' }}>Reorder</th>
                    <th style={{ padding: '0.8rem' }}>Name</th>
                    <th style={{ padding: '0.8rem' }}>Role</th>
                    <th style={{ padding: '0.8rem' }}>Dept/Year</th>
                    <th style={{ padding: '0.8rem' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(teamMembers[cat.id] || []).map((m, idx) => (
                    <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.8rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <button 
                            className="admin-nav-btn" 
                            style={{ padding: '0 4px', fontSize: '10px', opacity: idx === 0 ? 0.2 : 1 }} 
                            onClick={() => reorder(cat.id, idx, 'up')}
                            disabled={idx === 0}
                          >▲</button>
                          <button 
                            className="admin-nav-btn" 
                            style={{ padding: '0 4px', fontSize: '10px', opacity: idx === (teamMembers[cat.id].length - 1) ? 0.2 : 1 }} 
                            onClick={() => reorder(cat.id, idx, 'down')}
                            disabled={idx === (teamMembers[cat.id].length - 1)}
                          >▼</button>
                        </div>
                      </td>
                      <td style={{ padding: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <img src={m.img} alt="" style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                        <span style={{ fontWeight: '600' }}>{m.name}</span>
                      </td>
                      <td style={{ padding: '0.8rem' }}>{m.role}</td>
                      <td style={{ padding: '0.8rem', opacity: 0.7 }}>{m.dept} <br/> {m.year}</td>
                      <td style={{ padding: '0.8rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="admin-nav-btn" style={{ padding: '0.2rem 0.5rem', fontSize: '0.6rem' }} onClick={() => { setEditing(m.id); setFormData({ ...m, email: m.email || "" }); }}>Edit</button>
                          <button className="admin-nav-btn" style={{ padding: '0.2rem 0.5rem', fontSize: '0.6rem', background: '#ff4444' }} onClick={() => deleteMember(m.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!teamMembers[cat.id] || teamMembers[cat.id].length === 0) && (
                    <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', opacity: 0.3 }}>No members in this category.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WinnerCard({ rank, data, color, isFeatured, setLightboxItem }) {
  if (!data || !data.url) return <div className="winner-card empty" style={{ border: '1px dashed var(--border)', borderRadius: '24px', minHeight: '300px' }}></div>;
  
  return (
    <div className={`winner-card ${isFeatured ? 'featured' : ''} fade-in`} style={{ "--rank-color": color }}>
      <div className="winner-rank">{rank}</div>
      <div className="winner-image-wrap" onClick={() => setLightboxItem({ url: data.url, title: `${rank} Place - ${data.name}`, photographer: data.name, dept: data.dept, year: data.year })}>
        <img src={data.url} alt={data.name} className="winner-img" referrerPolicy="no-referrer" />
        <div className="winner-overlay"></div>
      </div>
      <div className="winner-info">
        <h4 className="winner-name">{data.name}</h4>
        <p className="winner-dept">{data.dept} · {data.year}</p>
      </div>
    </div>
  );
}

// ✦✦✦ EVENT PAGE COMPONENT ✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦

function EventPage({ event, liveEvents, onClose, setLightboxItem, isGlobal, archiveConfig, liveEventsList }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const getEventPhotos = () => {
    const livePhotos = liveEvents[event.id];
    const hasLivePhotos = livePhotos && (
      Array.isArray(livePhotos) ? livePhotos.length > 0 : (
        (livePhotos.general && livePhotos.general.length > 0) ||
        (livePhotos.prize && livePhotos.prize.length > 0) ||
        (livePhotos.winners && livePhotos.winners.length > 0)
      )
    );
    return hasLivePhotos ? livePhotos : (STATIC_EVENT_PHOTOS[event.id] || []);
  };

  const photos = getEventPhotos();
  const isVarnakriti = event.id === "varnakriti";

  // Get grouped events for global archive
  const getGroupedEvents = () => {
    if (!isGlobal) return [];
    
    // Use custom order if exists, otherwise use liveEventsList order
    let sortedList = [...liveEventsList];
    if (archiveConfig.order && archiveConfig.order.length > 0) {
      sortedList.sort((a, b) => {
        const indexA = archiveConfig.order.indexOf(a.id);
        const indexB = archiveConfig.order.indexOf(b.id);
        if (indexA === -1 && indexB === -1) return (a.order || 99) - (b.order || 99);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
    } else {
      sortedList.sort((a, b) => (a.order || 99) - (b.order || 99));
    }

    // Filter out hidden events
    return sortedList.filter(ev => !archiveConfig.hidden?.includes(ev.id));
  };

  const groupedEvents = getGroupedEvents();

  return (
    <div className="event-page-overlay">
      <div className="container" style={{ paddingBottom: '8rem' }}>
        <header className="event-page-header">
          <button className="back-btn" onClick={onClose}><ArrowLeft /> Back to Home</button>
          <div className="section-label">{isGlobal ? "Universal Archive" : "Event Showcase"}</div>
          <h1 className="section-title">{event.name} <em>Glimpse</em></h1>
          <p className="section-sub">{event.desc}</p>
        </header>

        {isGlobal ? (
          <div className="archive-timeline">
            {groupedEvents.map((ev, idx) => (
              <div key={ev.id} className="archive-group" style={{ marginBottom: '5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                  <div className="section-label" style={{ margin: 0 }}>Chapter {(idx + 1).toString().padStart(2, '0')}</div>
                  <h2 className="subcategory-title" style={{ margin: 0, border: 'none', padding: 0 }}>{ev.name} <em>{ev.date}</em></h2>
                </div>
                <EventSection 
                  title={ev.name} 
                  subtitle={ev.date} 
                  photos={
                    liveEvents[ev.id] && (
                      Array.isArray(liveEvents[ev.id]) ? liveEvents[ev.id].length > 0 : (
                        (liveEvents[ev.id].general && liveEvents[ev.id].general.length > 0) ||
                        (liveEvents[ev.id].prize && liveEvents[ev.id].prize.length > 0) ||
                        (liveEvents[ev.id].winners && liveEvents[ev.id].winners.length > 0)
                      )
                    ) ? flattenPhotos(liveEvents[ev.id]) : flattenPhotos(STATIC_EVENT_PHOTOS[ev.id])
                  } 
                  setLightboxItem={setLightboxItem} 
                  onClose={onClose} 
                />
              </div>
            ))}
            {groupedEvents.length === 0 && (
              <div className="no-results">The archive is currently empty.</div>
            )}
          </div>
        ) : (
          <>
            {isVarnakriti && !Array.isArray(photos) ? (
              <div className="varnakriti-sections">
                <EventSection title="Exhibition" subtitle="General" photos={photos.general} setLightboxItem={setLightboxItem} onClose={onClose} />
                <EventSection title="Awards" subtitle="Prize Distribution" photos={photos.prize} setLightboxItem={setLightboxItem} onClose={onClose} />
                <EventSection title="Winners" subtitle="Photography Excellence" photos={photos.winners} setLightboxItem={setLightboxItem} onClose={onClose} />
              </div>
            ) : (
              <EventSection title="Gallery" subtitle="Highlights" photos={photos} setLightboxItem={setLightboxItem} onClose={onClose} />
            )}
          </>
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
            <span className="path-root" onClick={onClose} style={{ cursor: 'pointer' }}><ArrowLeft /> Events</span>
            <span className="path-sep">/</span>
            <span className="path-folder">{subtitle}</span>
            <span className="path-sep">/</span>
            <span className="path-current">{title}</span>
          </div>
          <div className="explorer-actions">
            <div className="explorer-search">
              <span className="search-icon">🔍 </span>
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

// ✦✦✦ RECRUITMENT MODAL ✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦
// ✦✦✦ RECRUITMENT COMPONENTS ✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦✦
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
        {loading ? "Adding..." : "Add Member "}
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
        <div className="section-label">✧ Join our legacy</div>
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
            {isSubmitting ? "PROCESSING..." : <>SUBMIT APPLICATION <ArrowRight /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
