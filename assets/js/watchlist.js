const container = document.getElementById("watchlist");
const videos = [
  { title: "Sample Video", file: "sample-video.mp4", thumbnail: "sample-thumb.jpg" }
];

const watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

if (watchlist.length === 0) {
  container.innerHTML = "<p>No videos in Watchlist.</p>";
}

watchlist.forEach(file => {
  const video = videos.find(v => v.file === file);
  if (video) {
    const div = document.createElement("div");
    div.classList.add("video-card");
    div.innerHTML = `
      <img src="assets/images/thumbnails/${video.thumbnail}" />
      <h3>${video.title}</h3>
      <button onclick="playVideo('${video.file}')">▶ Play</button>
    `;
    container.appendChild(div);
  }
});

function playVideo(file) {
  sessionStorage.setItem("video", file);
  window.location.href = "video.html";
}
function removeFromWatchlist(file) {
  let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
  watchlist = watchlist.filter(v => v !== file);
  localStorage.setItem("watchlist", JSON.stringify(watchlist));
  location.reload();
}