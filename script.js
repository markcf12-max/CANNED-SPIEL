import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-analytics.js";

/* =========================
   FIREBASE
========================= */

const firebaseConfig = {
  apiKey: "AIzaSyDnuaDD2NQUCdbBZaVAqGz4PPotKLA83HU",
  authDomain: "emailspiels.firebaseapp.com",
  projectId: "emailspiels",
  storageBucket: "emailspiels.firebasestorage.app",
  messagingSenderId: "771863616641",
  appId: "1:771863616641:web:41fcbee1f15d203bd28180",
  measurementId: "G-22555KEHMY"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

/* =========================
   ADMIN MODE (CHANGE THIS)
========================= */

const isAdmin = true;

/* =========================
   STATE
========================= */

let spiels = [];

const spielGrid = document.getElementById("spielGrid");
const modal = document.getElementById("modal");

/* =========================
   LOAD
========================= */

async function loadSpiels() {

  spiels = [];

  const snapshot = await getDocs(collection(db, "spiels"));

  snapshot.forEach((docSnap) => {
    spiels.push({
      id: docSnap.id,
      ...docSnap.data()
    });
  });

  renderSpiels();
}

/* =========================
   RENDER
========================= */

function renderSpiels(filter = "") {

  spielGrid.innerHTML = "";

  const filtered = spiels.filter(s =>
    s.title.toLowerCase().includes(filter.toLowerCase())
  );

  if (filtered.length === 0) {
    spielGrid.innerHTML = "<p>No spiels found.</p>";
    return;
  }

  filtered.forEach((spiel) => {

    const card = document.createElement("div");
    card.className = "spiel-card";

    card.innerHTML = `
      <div class="spiel-title">${spiel.title}</div>

      <div class="spiel-content">${spiel.text}</div>

      <div class="card-buttons">

        <button class="copy-btn">Copy</button>

        ${isAdmin ? `
          <button class="delete-btn">Delete</button>
        ` : ""}

      </div>
    `;

    /* =========================
       COPY BUTTON
    ========================= */

    card.querySelector(".copy-btn").addEventListener("click", async () => {
      await navigator.clipboard.writeText(spiel.text);

      const btn = card.querySelector(".copy-btn");
      const old = btn.innerText;

      btn.innerText = "Copied!";
      setTimeout(() => btn.innerText = old, 1200);
    });

    /* =========================
       DELETE BUTTON (ADMIN ONLY)
    ========================= */

    if (isAdmin) {
      card.querySelector(".delete-btn").addEventListener("click", async () => {
        await deleteDoc(doc(db, "spiels", spiel.id));
        loadSpiels();
      });
    }

    spielGrid.appendChild(card);
  });
}

/* =========================
   ADD SPIEL
========================= */

window.saveSpiel = async function () {

  const title = document.getElementById("spielTitle").value.trim();
  const text = document.getElementById("spielText").value.trim();

  if (!title || !text) {
    alert("Fill all fields");
    return;
  }

  await addDoc(collection(db, "spiels"), {
    title,
    text
  });

  closeModal();
  loadSpiels();
};

/* =========================
   MODAL
========================= */

window.openModal = function () {
  modal.style.display = "flex";
};

window.closeModal = function () {
  modal.style.display = "none";
};

/* =========================
   SEARCH
========================= */

document.getElementById("searchInput").addEventListener("input", (e) => {
  renderSpiels(e.target.value);
});

/* =========================
   INIT
========================= */

loadSpiels();
