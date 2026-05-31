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
  signOut
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
const analytics = getAnalytics(app);

const db = getFirestore(app);
const auth = getAuth(app);

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
   AUTH
========================= */

onAuthStateChanged(auth, (user) => {

  isAdmin =
    !!user &&
    user.email &&
    user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  updateAdminUI();
  renderSpiels();

  if (isAdmin) {

    authBtn.textContent = "Logout";
    authBtn.onclick = logoutAdmin;

  } else {

    authBtn.textContent = "Admin Login";
    authBtn.onclick = openLoginModal;
  }
});

/* =========================
   ADMIN UI
========================= */

function updateAdminUI() {

  if (!addSpielBtn) return;

  addSpielBtn.style.display =
    isAdmin ? "block" : "none";
}

/* =========================
   LOAD SPIELS
========================= */

async function loadSpiels() {

  try {

    spiels = [];

    const snapshot =
      await getDocs(collection(db, "spiels"));

    snapshot.forEach((docSnap) => {

      spiels.push({
        id: docSnap.id,
        ...docSnap.data()
      });

    });

    renderSpiels();

  } catch (error) {

    console.error("Failed loading spiels:", error);
  }
}

/* =========================
   RENDER
========================= */

function renderSpiels(filter = "") {

  spielGrid.innerHTML = "";

  const filtered = spiels.filter((spiel) =>
    spiel.title
      ?.toLowerCase()
      .includes(filter.toLowerCase())
  );

  if (!filtered.length) {

    spielGrid.innerHTML =
      "<p>No spiels found.</p>";

    return;
  }

  filtered.forEach((spiel) => {

    const card = document.createElement("div");
    card.className = "spiel-card";

    card.innerHTML = `
      <div class="spiel-title">
        ${spiel.title}
      </div>

      <div class="spiel-content">
        ${spiel.text}
      </div>

      <div class="card-buttons">

        <button class="copy-btn">
          Copy
        </button>

        ${
          isAdmin
            ? `<button class="delete-btn">Delete</button>`
            : ""
        }

      </div>
    `;

    /* COPY */

    card
      .querySelector(".copy-btn")
      .addEventListener("click", async () => {

        try {

          await navigator.clipboard.writeText(
            spiel.text
          );

          const btn =
            card.querySelector(".copy-btn");

          const original =
            btn.textContent;

          btn.textContent = "Copied!";

          setTimeout(() => {
            btn.textContent = original;
          }, 1200);

        } catch (error) {

          console.error(error);
        }
      });

    /* DELETE */

    if (isAdmin) {

      card
        .querySelector(".delete-btn")
        .addEventListener("click", () => {

          pendingDeleteId = spiel.id;

          openDeleteModal();
        });
    }

    spielGrid.appendChild(card);
  });
}

/* =========================
   SAVE SPIEL
========================= */

window.saveSpiel = async function () {

  if (!isAdmin) {

    alert("Unauthorized");
    return;
  }

  const title =
    document.getElementById("spielTitle")
      .value
      .trim();

  const text =
    document.getElementById("spielText")
      .value
      .trim();

  if (!title || !text) {

    alert("Fill all fields");
    return;
  }

  try {

    await addDoc(
      collection(db, "spiels"),
      {
        title,
        text,
        createdAt: Date.now()
      }
    );

    document.getElementById("spielTitle").value = "";
    document.getElementById("spielText").value = "";

    closeModal();

    await loadSpiels();

  } catch (error) {

    console.error(error);
    alert("Failed to save spiel");
  }
};

/* =========================
   LOGIN
========================= */

window.openLoginModal = function () {

  loginModal.style.display = "flex";
};

window.closeLoginModal = function () {

  loginModal.style.display = "none";
};

window.loginAdmin = async function () {

  const email =
    document
      .getElementById("loginEmail")
      .value
      .trim();

  const password =
    document
      .getElementById("loginPassword")
      .value;

  try {

    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    document.getElementById("loginEmail").value = "";
    document.getElementById("loginPassword").value = "";

    closeLoginModal();

  } catch (error) {

    console.error(error);

    alert(
      "Invalid email or password."
    );
  }
};

async function logoutAdmin() {

  try {

    await signOut(auth);

  } catch (error) {

    console.error(error);
  }
}

/* =========================
   ADD MODAL
========================= */

window.openModal = function () {

  if (!isAdmin) return;

  modal.style.display = "flex";
};

window.closeModal = function () {

  modal.style.display = "none";
};

/* =========================
   DELETE MODAL
========================= */

window.openDeleteModal = function () {

  deleteModal.style.display = "flex";
};

window.closeDeleteModal = function () {

  deleteModal.style.display = "none";
};

window.confirmDelete = async function () {

  if (!pendingDeleteId) return;

  try {

    await deleteDoc(
      doc(
        db,
        "spiels",
        pendingDeleteId
      )
    );

    pendingDeleteId = null;

    closeDeleteModal();

    await loadSpiels();

  } catch (error) {

    console.error(error);

    alert(
      "Failed to delete spiel."
    );
  }
};

/* =========================
   SEARCH
========================= */

document
  .getElementById("searchInput")
  .addEventListener("input", (e) => {

    renderSpiels(e.target.value);
  });

/* =========================
   INIT
========================= */

loadSpiels();
