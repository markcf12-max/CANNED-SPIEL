let spiels = JSON.parse(localStorage.getItem("spiels")) || [];
let editIndex = null;

const spielGrid = document.getElementById("spielGrid");
const modal = document.getElementById("modal");

function renderSpiels(filter = "") {

  spielGrid.innerHTML = "";

  const filtered = spiels.filter(spiel =>
    spiel.title.toLowerCase().includes(filter.toLowerCase())
  );

  if(filtered.length === 0){
    spielGrid.innerHTML = `<p>No spiels found.</p>`;
    return;
  }

  filtered.forEach((spiel, index) => {

    const card = document.createElement("div");
    card.className = "spiel-card";

    card.innerHTML = `
      <div class="spiel-title">${spiel.title}</div>
      <div class="spiel-content">${spiel.text}</div>
      <div class="card-buttons">
        <button class="edit-btn" onclick="editSpiel(${index})">Edit</button>
        <button class="delete-btn" onclick="deleteSpiel(${index})">Delete</button>
      </div>
    `;

    spielGrid.appendChild(card);

  });

}

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

function saveSpiel() {

  const title = document.getElementById("spielTitle").value.trim();
  const text = document.getElementById("spielText").value.trim();

  if(title === "" || text === ""){
    alert("Please fill in all fields.");
    return;
  }

  if(editIndex === null){
    spiels.push({ title, text });
  } else {
    spiels[editIndex] = { title, text };
  }

  localStorage.setItem("spiels", JSON.stringify(spiels));
  renderSpiels();
  closeModal();
}

function editSpiel(index){
  editIndex = index;
  document.getElementById("spielTitle").value = spiels[index].title;
  document.getElementById("spielText").value = spiels[index].text;
  document.getElementById("modalTitle").innerText = "Edit Spiel";
  modal.style.display = "flex";
}

function deleteSpiel(index){
  if(confirm("Delete this spiel?")){
    spiels.splice(index, 1);
    localStorage.setItem("spiels", JSON.stringify(spiels));
    renderSpiels();
  }
}

document.getElementById("searchInput").addEventListener("input", (e) => {
  renderSpiels(e.target.value);
});

window.onclick = function(event){
  if(event.target === modal){
    closeModal();
  }
}

renderSpiels();
