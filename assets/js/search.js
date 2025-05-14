const videos = [
  { title: "Sample Video", file: "sample-video.mp4", thumbnail: "sample-thumb.jpg" },
  { title: "Another Clip", file: "sample-video.mp4", thumbnail: "sample-thumb.jpg" }
];

document.getElementById("searchInput").addEventListener("input", function () {
  const query = this.value.toLowerCase();
  const results = videos.filter(v => v.title.toLowerCase().includes(query));
  const container = document.getElementById("results");
  container.innerHTML = "";

  results.forEach(v => {
    const div = document.createElement("div");
    div.classList.add("video-card");
    div.innerHTML = `
      <img src="assets/images/thumbnails/${v.thumbnail}" />
      <h3>${v.title}</h3>
      <button onclick="playVideo('${v.file}')">▶ Play</button>
    `;
    container.appendChild(div);
  });
});

function playVideo(file) {
  sessionStorage.setItem("video", file);
  window.location.href = "video.html";
}
