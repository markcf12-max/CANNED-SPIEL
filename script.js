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
   INITIALIZE FIREBASE
========================= */

const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);

const db = getFirestore(app);

/* =========================
   VARIABLES
========================= */

let spiels = [];

let editId = null;
let deleteId = null;

const spielGrid = document.getElementById("spielGrid");

const modal = document.getElementById("modal");
const deleteModal = document.getElementById("deleteModal");

/* =========================
   LOAD SPIELS
========================= */

async function loadSpiels() {

  spiels = [];

  const querySnapshot = await getDocs(
    collection(db, "spiels")
  );

  querySnapshot.forEach((docSnap) => {

    spiels.push({
      id: docSnap.id,
      ...docSnap.data()
    });

  });

  renderSpiels();
}

/* =========================
   RENDER SPIELS
========================= */

function renderSpiels(filter = "") {

  spielGrid.innerHTML = "";

  const filtered = spiels.filter(spiel =>
    spiel.title.toLowerCase().includes(filter.toLowerCase())
  );

  if(filtered.length === 0){

    spielGrid.innerHTML = `
      <p>No spiels found.</p>
    `;

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

        <button
          class="copy-btn"
          onclick='copySpiel(${JSON.stringify(spiel.text)})'
        >
          Copy
        </button>

        <button
          class="edit-btn"
          onclick="editSpiel('${spiel.id}')"
        >
          Edit
        </button>

        <button
          class="delete-btn"
          onclick="deleteSpiel('${spiel.id}')"
        >
          Delete
        </button>

      </div>
    `;

    spielGrid.appendChild(card);

  });

}

/* =========================
   COPY SPIEL
========================= */

window.copySpiel = async function(text){

  try{

    await navigator.clipboard.writeText(text);

    console.log("Spiel copied!");

  } catch(err){

    console.error("Copy failed:", err);

    alert("Failed to copy.");
  }
}

/* =========================
   OPEN MODAL
========================= */

window.openModal = function() {

  modal.style.display = "flex";

  document.getElementById("spielTitle").value = "";
  document.getElementById("spielText").value = "";

  document.getElementById("modalTitle").innerText =
    "Add Spiel";

  editId = null;
}

/* =========================
   CLOSE MODAL
========================= */

window.closeModal = function() {

  modal.style.display = "none";
}

/* =========================
   SAVE SPIEL
========================= */

window.saveSpiel = async function() {

  const title = document
    .getElementById("spielTitle")
    .value
    .trim();

  const text = document
    .getElementById("spielText")
    .value
    .trim();

  if(title === "" || text === ""){

    alert("Please fill in all fields.");

    return;
  }

  /* ADD */

  if(editId === null){

    await addDoc(
      collection(db, "spiels"),
      {
        title,
        text
      }
    );

  }

  /* EDIT */

  else {

    const spielRef = doc(db, "spiels", editId);

    await updateDoc(spielRef, {
      title,
      text
    });

  }

  closeModal();

  loadSpiels();
}

/* =========================
   EDIT SPIEL
========================= */

window.editSpiel = function(id) {

  const spiel = spiels.find(
    s => s.id === id
  );

  if(!spiel) return;

  editId = id;

  document.getElementById("spielTitle").value =
    spiel.title;

  document.getElementById("spielText").value =
    spiel.text;

  document.getElementById("modalTitle").innerText =
    "Edit Spiel";

  modal.style.display = "flex";
}

/* =========================
   DELETE SPIEL
========================= */

window.deleteSpiel = function(id){

  deleteId = id;

  deleteModal.style.display = "flex";
}

/* =========================
   CLOSE DELETE MODAL
========================= */

window.closeDeleteModal = function(){

  deleteModal.style.display = "none";
}

/* =========================
   CONFIRM DELETE
========================= */

window.confirmDelete = async function(){

  if(deleteId){

    await deleteDoc(
      doc(db, "spiels", deleteId)
    );

    loadSpiels();
  }

  closeDeleteModal();
}

/* =========================
   SEARCH
========================= */

document
  .getElementById("searchInput")
  .addEventListener("input", (e) => {

    renderSpiels(e.target.value);

  });

/* =========================
   CLOSE MODALS
========================= */

window.onclick = function(event){

  if(event.target === modal){
    closeModal();
  }

  if(event.target === deleteModal){
    closeDeleteModal();
  }
}

/* =========================
   INITIAL LOAD
========================= */

loadSpiels();
