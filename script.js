import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

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
getAnalytics(app);

const db = getFirestore(app);
const auth = getAuth(app);

/* Keep login session */
setPersistence(auth, browserLocalPersistence);

/* =========================
   ADMIN CONFIG
========================= */

const ADMIN_EMAIL = "youradmin@email.com";

/* =========================
   STATE
========================= */

let isAdmin = false;
let spiels = [];
let pendingDeleteId = null;

/* =========================
   DOM
========================= */

const spielGrid = document.getElementById("spielGrid");
const modal = document.getElementById("modal");

const addSpielBtn = document.getElementById("addSpielBtn");
const authBtn = document.getElementById("authBtn");

const loginModal = document.getElementById("loginModal");
const deleteModal = document.getElementById("deleteModal");

/* =========================
   AUTH STATE
========================= */

onAuthStateChanged(auth, (user) => {

  isAdmin =
    !!user &&
    user.email &&
    user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  updateUI();
  renderSpiels();
});

/* =========================
   UI CONTROL
========================= */

function updateUI() {

  /* Add button */
  if (addSpielBtn) {
    addSpielBtn.style.display = isAdmin ? "block" : "none";
  }

  /* Auth button */
  if (authBtn) {
    if (isAdmin) {
      authBtn.textContent = "Logout";
      authBtn.onclick = logoutAdmin;
    } else {
      authBtn.textContent = "Admin Login";
      authBtn.onclick = openLoginModal;
    }
  }
}

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

  const filtered = spiels.filter((s) =>
    s.title?.toLowerCase().includes(filter.toLowerCase())
  );

  if (!filtered.length) {
    spielGrid.innerHTML = "<p>No spiels found.</p>";
    return;
  }

  filtered.forEach((spiel) => {

    const card = document.createElement("div");
    card.className = "spiel-card";

    const buttons = document.createElement("div");
    buttons.className = "card-buttons";

    /* COPY */
    const copyBtn = document.createElement("button");
    copyBtn.className = "copy-btn";
    copyBtn.textContent = "Copy";

    copyBtn.onclick = async () => {
      await navigator.clipboard.writeText(spiel.text);

      const old = copyBtn.textContent;
      copyBtn.textContent = "Copied!";

      setTimeout(() => {
        copyBtn.textContent = old;
      }, 1200);
    };

    buttons.appendChild(copyBtn);

    /* DELETE (ONLY ADMIN, NOT IN HTML STRING) */
    if (isAdmin) {

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-btn";
      deleteBtn.textContent = "Delete";

      deleteBtn.onclick = () => {
        pendingDeleteId = spiel.id;
        openDeleteModal();
      };

      buttons.appendChild(deleteBtn);
    }

    card.innerHTML = `
      <div class="spiel-title">${spiel.title}</div>
      <div class="spiel-content">${spiel.text}</div>
    `;

    card.appendChild(buttons);
    spielGrid.appendChild(card);
  });
}

/* =========================
   SAVE SPIEL
========================= */

window.saveSpiel = async function () {

  if (!isAdmin) return;

  const title = document.getElementById("spielTitle").value.trim();
  const text = document.getElementById("spielText").value.trim();

  if (!title || !text) {
    alert("Fill all fields");
    return;
  }

  await addDoc(collection(db, "spiels"), {
    title,
    text,
    createdAt: Date.now()
  });

  document.getElementById("spielTitle").value = "";
  document.getElementById("spielText").value = "";

  closeModal();
  loadSpiels();
};

/* =========================
   LOGIN
========================= */

window.openLoginModal = () => {
  loginModal.style.display = "flex";
};

window.closeLoginModal = () => {
  loginModal.style.display = "none";
};

window.loginAdmin = async function () {

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);

    document.getElementById("loginEmail").value = "";
    document.getElementById("loginPassword").value = "";

    closeLoginModal();

  } catch (err) {
    console.error(err);
    alert("Invalid login");
  }
};

async function logoutAdmin() {
  await signOut(auth);
}

/* =========================
   MODALS
========================= */

window.openModal = function () {
  if (!isAdmin) return;
  modal.style.display = "flex";
};

window.closeModal = function () {
  modal.style.display = "none";
};

window.openDeleteModal = function () {
  deleteModal.style.display = "flex";
};

window.closeDeleteModal = function () {
  deleteModal.style.display = "none";
};

window.confirmDelete = async function () {

  if (!pendingDeleteId) return;

  await deleteDoc(doc(db, "spiels", pendingDeleteId));

  pendingDeleteId = null;

  closeDeleteModal();
  loadSpiels();
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
