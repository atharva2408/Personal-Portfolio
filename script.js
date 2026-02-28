const files = document.querySelectorAll(".file");
const sections = document.querySelectorAll(".section");
const tabs = document.querySelectorAll('.tab');
const tabsDiv = document.querySelector('.tabs')
const vscodeLogo = document.querySelector(".vs-code-logo");

function openSection(name) {
    //Remove all active state
    sections.forEach(section => {
        section.classList.add("hidden");
    });

    files.forEach(file => {
        file.classList.remove("active-file");
    });

    tabs.forEach(tab => {
        tab.classList.remove("active-tab");
    });

    // Show selected section
    const activeSection = document.getElementById(name);
    if (activeSection) {
        activeSection.classList.remove("hidden");
    }

    // Activate clicked file
    const activeFile = document.querySelector(`.file[data-file="${name}"]`);
    if (activeFile) {
        activeFile.classList.add("active-file");
    }

    // Activate clicked tab
    const activeTab = document.querySelector(`.tab[data-file="${name}"]`);
    if (activeTab) {
        activeTab.classList.add("active-tab");
    }
}

function showAllSections() {
    sections.forEach(section => {
        section.classList.remove("hidden");
    });
    // Remove active states
    files.forEach(file => file.classList.remove("active-file"));
    tabs.forEach(tab => tab.classList.remove("active-tab"));
}

// FILE CLICK 
files.forEach(file => {
    file.addEventListener("click", () => {
        const fileName = file.getAttribute("data-file");
        openSection(fileName);
    });
});

tabs.forEach(tab => {
  tab.addEventListener('click',() => {
    const fileName = tab.getAttribute("data-file");
    openSection(fileName)
  })
})

// --------- VS CODE LOGO CLICK (HOME) ----------
vscodeLogo.addEventListener("click", () => {
    showAllSections();
});
