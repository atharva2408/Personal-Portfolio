const files = {
  about: `# About Me

class Atharva:

    def __init__(self):
        self.degree = "Computer Engineering"
        self.interests = ["ML", "DL", "Web Dev"]

    def goal(self):
        return "Build impactful systems 🚀"
`,

  projects: `# Projects

- Electricity Meter Management System
- Expense Tracker
- ML Model Experiments
`,

  contact: `# Contact

email = "yourmail@email.com"
github = "github.com/yourusername"
linkedin = "linkedin.com/in/yourprofile"
`
};

function openFile(name) {
  document.getElementById("editor-content").innerText = files[name];
  document.getElementById("tab-title").innerText = name + ".py";
}

openFile("about");
