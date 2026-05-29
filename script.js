let spiels = JSON.parse(localStorage.getItem("spiels")) || [];

let editIndex = null;
let deleteIndex = null;

const spielGrid = document.getElementById("spielGrid");

const modal = document.getElementById("modal");
const deleteModal = document.getElementById("deleteModal");

/* =========================
   RENDER SPIELS
========================= */

function renderSpiels(filter = "") {

  spielGrid.innerHTML = "";

  const filtered = spiels.filter(spiel =>
    spiel.title.toLowerCase().includes(filter.toLowerCase())
  );

  if (filtered.length === 0) {

    spielGrid.innerHTML = `
      <p>No spiels found.</p>
    `;

    return;
  }

  filtered.forEach((spiel, index) => {

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
          class="edit-btn" 
          onclick="editSpiel(${index})"
        >
          Edit
        </button>

        <button 
          class="delete-btn" 
          onclick="deleteSpiel(${index})"
        >
          Delete
        </button>

      </div>
    `;

    spielGrid.appendChild(card);

  });

}

/* =========================
   ADD MODAL
========================= */

function openModal() {

  modal.style.display = "flex";

  document.getElementById("spielTitle").value = "";
  document.getElementById("spielText").value = "";

  document.getElementById("modalTitle").innerText = "Add Spiel";

  editIndex = null;
}

function closeModal() {
  modal.style.display = "none";
}

/* =========================
   SAVE SPIEL
========================= */

function saveSpiel() {

  const title = document
    .getElementById("spielTitle")
    .value
    .trim();

  const text = document
    .getElementById("spielText")
    .value
    .trim();

  if (title === "" || text === "") {

    alert("Please fill in all fields.");

    return;
  }

  if (editIndex === null) {

    spiels.push({
      title,
      text
    });

  } else {

    spiels[editIndex] = {
      title,
      text
    };
  }

  localStorage.setItem(
    "spiels",
    JSON.stringify(spiels)
  );

  renderSpiels();

  closeModal();
}

/* =========================
   EDIT SPIEL
========================= */

function editSpiel(index) {

  editIndex = index;

  document.getElementById("spielTitle").value =
    spiels[index].title;

  document.getElementById("spielText").value =
    spiels[index].text;

  document.getElementById("modalTitle").innerText =
    "Edit Spiel";

  modal.style.display = "flex";
}

/* =========================
   DELETE MODAL
========================= */

function deleteSpiel(index) {

  deleteIndex = index;

  deleteModal.style.display = "flex";
}

function closeDeleteModal() {

  deleteModal.style.display = "none";
}

function confirmDelete() {

  if (deleteIndex !== null) {

    spiels.splice(deleteIndex, 1);

    localStorage.setItem(
      "spiels",
      JSON.stringify(spiels)
    );

    renderSpiels();

    deleteIndex = null;
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
   CLOSE MODALS ON OUTSIDE CLICK
========================= */

window.onclick = function(event) {

  if (event.target === modal) {
    closeModal();
  }

  if (event.target === deleteModal) {
    closeDeleteModal();
  }
}

/* =========================
   INITIAL LOAD
========================= */

renderSpiels();
