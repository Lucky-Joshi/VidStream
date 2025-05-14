const videoId = new URLSearchParams(window.location.search).get("id");
const video = videoList.find(v => v.videoId === parseInt(videoId));

if (video) {
  const videoPlayer = document.getElementById("videoPlayer");
  videoPlayer.innerHTML = `
    <video controls>
      <source src="videos/sample.mp4" type="video/mp4">
      Your browser does not support the video tag.
    </video>
  `;
}

function toggleWatchlist() {
  const watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
  if (watchlist.some(item => item.videoId === video.videoId)) {
    Swal.fire("Removed", "Video removed from your watchlist", "info");
  } else {
    watchlist.push(video);
    Swal.fire("Added", "Video added to your watchlist", "success");
  }
  localStorage.setItem("watchlist", JSON.stringify(watchlist));
}
