window.onload = () => {
  const video = sessionStorage.getItem("video");
  const videoPlayer = document.getElementById("videoPlayer");
  if (video) {
    videoPlayer.src = `assets/videos/${video}`;
  } else {
    Swal.fire("Error", "No video selected", "error");
  }
};

function addToWatchlist() {
  const video = sessionStorage.getItem("video");
  let list = JSON.parse(localStorage.getItem("watchlist")) || [];
  if (!list.includes(video)) {
    list.push(video);
    localStorage.setItem("watchlist", JSON.stringify(list));
    Swal.fire("Added!", "Video added to your Watchlist", "success");
  } else {
    Swal.fire("Info", "Video already in Watchlist", "info");
  }
}
