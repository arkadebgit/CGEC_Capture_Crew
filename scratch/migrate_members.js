import { db } from "../src/firebase.js";
import { collection, addDoc, serverTimestamp, getDocs } from "firebase/firestore";

const STATIC_MEMBERS = [
  { name: "Sagnik Das", role: "Member", dept: "1st Yr. ME" },
  { name: "Nirvan Krishna Sarkar", role: "Member", dept: "1st Yr. CE" },
  { name: "Sakhil Hossain", role: "Member", dept: "3rd Yr. ME" },
  { name: "Nibadita Mitra", role: "Member", dept: "1st Yr. EE" },
  { name: "Sanjib Giri", role: "Member", dept: "1st Yr. CE" },
  { name: "Md Sahe Alam", role: "Member", dept: "1st Yr. CE" },
  { name: "Farhana Parvin", role: "Member", dept: "1st Yr. EE" },
  { name: "Hridashree Sinha", role: "Member", dept: "1st Yr. ME" },
  { name: "Swastika Shaw", role: "Member", dept: "1st Yr. CSE" },
  { name: "Aayushi Dutta", role: "Member", dept: "1st Yr. EE" },
  { name: "Sk Irfan Ali", role: "Member", dept: "1st Yr. CE" },
  { name: "Ahad Imam", role: "Member", dept: "1st Yr. CSE" },
  { name: "Srinjoy Goswami", role: "Member", dept: "1st Yr. CE" },
  { name: "Shritam Dutta", role: "Member", dept: "2nd Yr. ME" },
  { name: "Rupam Barman", role: "Member", dept: "1st Yr. CE" },
  { name: "Chayan Mukherjee", role: "Member", dept: "2nd Yr. CSE" },
  { name: "Ayan Mandal", role: "Member", dept: "1st Yr. CE" },
  { name: "Gourab Saha", role: "Member", dept: "1st Yr. ME" },
  { name: "Poulami Roy", role: "Member", dept: "2nd Yr. ME" },
  { name: "Bhaskaracharya Biswas", role: "Member", dept: "1st Yr. EE" },
  { name: "Chanchal Barman", role: "Member", dept: "1st Yr. CSE" },
  { name: "Istak Ahamed", role: "Member", dept: "1st Yr. CSE" },
  { name: "Apajit Mahata", role: "Member", dept: "1st Yr. CE" },
];

async function migrate() {
  const snap = await getDocs(collection(db, "members"));
  if (snap.size > 10) {
    console.log("Migration already done or many members exist. Skipping.");
    return;
  }

  console.log(`Migrating ${STATIC_MEMBERS.length} members...`);
  for (const m of STATIC_MEMBERS) {
    await addDoc(collection(db, "members"), {
      ...m,
      createdAt: serverTimestamp()
    });
    console.log(`Added ${m.name}`);
  }
  console.log("Migration complete!");
}

migrate();
