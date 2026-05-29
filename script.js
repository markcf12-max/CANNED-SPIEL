import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import {
  getAnalytics
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-analytics.js";

/* =========================
   FIREBASE CONFIG
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

/* =========================
   INIT
========================= */

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

/* =========================
   SETTINGS
========================= */

// CHANGE THIS
const isAdmin = true;

/* =========================
   STATE
========================= */

let spiels = [];

const spielGrid = document.getElementById("spielGrid");
const modal = document.getElementById("modal");
const deleteModal = document.getElementById("deleteModal");

/* =========================
   LOAD SPIELS
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
    spielGrid.innerHTML = `<p>No spiels found.</p>`;
    return;
  }

  filtered.forEach((spiel) => {

    const card = document.createElement("div");
    card.className = "spiel-card";

    card.innerHTML = `
      <div class="spiel-title">${spiel.title}</div>

      <div class="spiel-content">${spiel.text}</div>

      <div class="card-buttons">

        <button class="copy-btn">
          Copy
        </button>

        ${
          isAdmin ? `
            <button class="edit-btn" onclick="editSpiel('${spiel.id}')">
              Edit
            </button>

            <button class="delete-btn" onclick="deleteSpiel('${spiel.id}')">
              Delete
            </button>
          ` : ""
        }

      </div>
    `;

    // safer copy handler (no onclick string issues)
    card.querySelector(".copy-btn").addEventListener("click", async () => {
      await navigator.clipboard.writeText(spiel.text);

      const btn = card.querySelector(".copy-btn");
      const original = btn.innerText;

      btn.innerText = "Copied!";
      setTimeout(() => btn.innerText = original, 1200);
    });

    spielGrid.appendChild(card);
  });
}

/* =========================
   SAVE SPIEL
========================= */

window.saveSpiel = async function () {

  const title = document.getElementById("spielTitle").value.trim();
  const text = document.getElementById("spielText").value.trim();

  if (!title || !text) {
    alert("Please fill in all fields.");
    return;
  }

  await addDoc(
    collection(db, isAdmin ? "spiels" : "pendingSpiels"),
    { title, text }
  );

  closeModal();
  loadSpiels();
};

/* =========================
   EDIT (ADMIN ONLY)
========================= */

window.editSpiel = function (id) {

  const spiel = spiels.find(s => s.id === id);
  if (!spiel) return;

  document.getElementById("spielTitle").value = spiel.title;
  document.getElementById("spielText").value = spiel.text;

  modal.style.display = "flex";
};

/* =========================
   DELETE (ADMIN ONLY)
========================= */

window.deleteSpiel = function (id) {

  deleteDoc(doc(db, "spiels", id)).then(() => {
    loadSpiels();
  });

};

/* =========================
   MODAL CONTROL
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
   CLOSE MODAL ON OUTSIDE CLICK
========================= */

window.onclick = function (event) {
  if (event.target === modal) closeModal();
  if (event.target === deleteModal) deleteModal.style.display = "none";
};

/* =========================
   INIT
========================= */

loadSpiels();
