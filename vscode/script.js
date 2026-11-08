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

// --------- ACCESSIBILITY: files and tabs work from the keyboard ----------
[...files, ...tabs].forEach(el => {
    el.setAttribute("tabindex", "0");
    el.setAttribute("role", "button");
    el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openSection(el.getAttribute("data-file"));
        }
    });
});

vscodeLogo.setAttribute("tabindex", "0");
vscodeLogo.setAttribute("role", "button");
vscodeLogo.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        showAllSections();
    }
});

// --------- DEEP LINK: vscode/#experience opens that file ----------
function openFromHash() {
    const name = decodeURIComponent(location.hash.replace("#", ""));
    if (name && document.getElementById(name)) {
        openSection(name);
    }
}
window.addEventListener("hashchange", openFromHash);
openFromHash();

// keep the URL hash in sync so a view can be shared
document.querySelectorAll(".file, .tab").forEach(el => {
    el.addEventListener("click", () => {
        if (history.replaceState) {
            history.replaceState(null, "", "#" + el.getAttribute("data-file"));
        }
    });
});
