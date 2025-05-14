window.onload = () => {
  const username = localStorage.getItem("username");
  if (!username) window.location.href = "login.html";

  document.getElementById("app").innerHTML = `
    <!-- sidebar html from above -->
  `;
  document.getElementById("sidebar-username").textContent = username;
  applyTheme();
};

function logout() {
  localStorage.removeItem("username");
  window.location.href = "login.html";
}

function applyTheme() {
  const theme = localStorage.getItem("theme") || "light";
  document.body.className = theme;
  document.getElementById("themeToggle").checked = theme === "dark";
}

document.addEventListener("change", (e) => {
  if (e.target.id === "themeToggle") {
    const theme = e.target.checked ? "dark" : "light";
    document.body.className = theme;
    localStorage.setItem("theme", theme);
  }
});
