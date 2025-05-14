const videoList = [
  { title: "Sample Video 1", thumbnail: "images/sample-thumbnail.jpg", videoId: 1 },
  { title: "Sample Video 2", thumbnail: "images/sample-thumbnail.jpg", videoId: 2 },
  // Add more videos here
];

const videoGrid = document.getElementById("videoList");

videoList.forEach(video => {
  const videoCard = document.createElement("div");
  videoCard.className = "video-card";
  videoCard.innerHTML = `
    <img src="${video.thumbnail}" alt="${video.title}">
    <h3>${video.title}</h3>
    <a href="video.html?id=${video.videoId}">Watch</a>
  `;
  videoGrid.appendChild(videoCard);
});
