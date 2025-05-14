/*
function playVideo(file) {
  sessionStorage.setItem("video", file);
  window.location.href = "video.html";
}

function toggleTheme() {
  const current = document.body.dataset.theme;
  const next = current === "dark" ? "light" : "dark";
  document.body.dataset.theme = next;
  localStorage.setItem("theme", next);
}

window.onload = () => {
  const theme = localStorage.getItem("theme") || "dark";
  document.body.dataset.theme = theme;
};
function setVideo() {
  const video = sessionStorage.getItem("video");
  if (video) {
    const videoElement = document.getElementById("video");
    videoElement.src = `assets/videos/${video}`;
    videoElement.play();
  }
}
*/
const videos = [
  { title: "Mountain Adventure", thumbnail: "assets/thumbnails/mountain.jpg", src: "assets/videos/mountain.mp4" },
  { title: "Ocean Escape", thumbnail: "assets/thumbnails/ocean.jpg", src: "assets/videos/ocean.mp4" },
  { title: "City Lights", thumbnail: "assets/thumbnails/city.jpg", src: "assets/videos/city.mp4" }
];

function loadVideos() {
  const videoList = document.getElementById("videoList");
  videoList.innerHTML = "";
  videos.forEach((video, index) => {
    const card = document.createElement("div");
    card.className = "video-card";
    card.innerHTML = `
      <img src="${video.thumbnail}" alt="${video.title}">
      <h3>${video.title}</h3>
      <button onclick="playVideo(${index})">Watch</button>
    `;
    videoList.appendChild(card);
  });
}

function playVideo(index) {
  localStorage.setItem("currentVideo", JSON.stringify(videos[index]));
  window.location.href = "video.html";
}

function searchVideos(query) {
  const filtered = videos.filter(v => v.title.toLowerCase().includes(query.toLowerCase()));
  const videoList = document.getElementById("videoList");
  videoList.innerHTML = "";
  filtered.forEach((video, index) => {
    const card = document.createElement("div");
    card.className = "video-card";
    card.innerHTML = `
      <img src="${video.thumbnail}" alt="${video.title}">
      <h3>${video.title}</h3>
      <button onclick="playVideo(${index})">Watch</button>
    `;
    videoList.appendChild(card);
  });
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  document.getElementById("themeToggle").checked = newTheme === "light";
}

window.onload = () => {
  loadVideos();
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
  document.getElementById("themeToggle").checked = savedTheme === "light";
};
function setVideo() {
  const videoData = JSON.parse(localStorage.getItem("currentVideo"));
  if (videoData) {
    const videoElement = document.getElementById("video");
    videoElement.src = videoData.src;
    document.getElementById("videoTitle").innerText = videoData.title;
    videoElement.play();
  }
}