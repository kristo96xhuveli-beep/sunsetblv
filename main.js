// GLOBAL EDIT MODE SYSTEM

let editMode = false;

// BUTTONS
const editBtn = document.getElementById("editBtn");
const saveBtn = document.getElementById("saveBtn");
const exitBtn = document.getElementById("exitBtn");

// ENABLE EDIT
function enableEdit() {
  document.querySelectorAll(".editable").forEach(el => {
    el.setAttribute("contenteditable", "true");
    el.style.outline = "2px dashed red";
  });
}

// DISABLE EDIT
function disableEdit() {
  document.querySelectorAll(".editable").forEach(el => {
    el.removeAttribute("contenteditable");
    el.style.outline = "none";
  });
}

// SAVE CONTENT
function saveContent() {
  const data = {};

  document.querySelectorAll(".editable").forEach(el => {
    const key = el.dataset.key;
    if (key) {
      data[key] = el.innerHTML;
    }
  });

  localStorage.setItem("siteContent", JSON.stringify(data));
  alert("Saved!");
}

// LOAD CONTENT
function loadContent() {
  const saved = localStorage.getItem("siteContent");

  if (saved) {
    const data = JSON.parse(saved);

    document.querySelectorAll(".editable").forEach(el => {
      const key = el.dataset.key;
      if (key && data[key]) {
        el.innerHTML = data[key];
      }
    });
  }
}

// BUTTON EVENTS
if (editBtn) {
  editBtn.onclick = () => {
    editMode = true;
    enableEdit();
  };
}

if (saveBtn) {
  saveBtn.onclick = () => {
    saveContent();
  };
}

if (exitBtn) {
  exitBtn.onclick = () => {
    editMode = false;
    disableEdit();
  };
}

document.addEventListener("DOMContentLoaded", () => {

  loadContent();

  fetch('./ourstory.html')
  .then(res => res.text())
  .then(html => {

    const temp = document.createElement('div');
    temp.innerHTML = html;

    const desktopContent = temp.querySelector('#ourstory-anchor');
    const mobileContent = temp.querySelector('#ourstory-anchor-mobile');


    if(desktop && desktopContent){
      desktop.innerHTML = desktopContent.outerHTML;
    }

    if(mobile && mobileContent){
      mobile.innerHTML = mobileContent.outerHTML;
    }

    if (typeof applyLang === "function" && typeof currentLang !== "undefined") {
      applyLang(currentLang);
    }

  });
