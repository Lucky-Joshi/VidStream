const watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
const watchlistContainer = document.getElementById("watchlistContainer");

watchlist.forEach(video => {
  const videoCard = document.createElement("div");
  videoCard.className = "video-card";
  videoCard.innerHTML = `
    <img src="${video.thumbnail}" alt="${video.title}">
    <h3>${video.title}</h3>
    <a href="video.html?id=${video.videoId}">Watch</a>
    <button onclick="removeFromWatchlist(${video.videoId})">Remove</button>
  `;
  watchlistContainer.appendChild(videoCard);
});

function removeFromWatchlist(videoId) {
  const updatedWatchlist = watchlist.filter(item => item.videoId !== videoId);
  localStorage.setItem("watchlist", JSON.stringify(updatedWatchlist));
  window.location.reload();
}
