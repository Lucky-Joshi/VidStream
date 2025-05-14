function uploadVideo() {
  const title = document.getElementById("title").value;
  const thumbnail = document.getElementById("thumbnail").files[0];
  const videoFile = document.getElementById("videoFile").files[0];

  if (!title || !thumbnail || !videoFile) {
    Swal.fire("Error", "Please fill all fields", "error");
    return;
  }

  const reader = new FileReader();
  reader.onloadend = function () {
    const videoData = {
      title: title,
      thumbnail: reader.result,
      video: videoFile,
    };
    const uploadedVideos = JSON.parse(localStorage.getItem("uploadedVideos")) || [];
    uploadedVideos.push(videoData);
    localStorage.setItem("uploadedVideos", JSON.stringify(uploadedVideos));
    Swal.fire("Uploaded", "Your video has been uploaded", "success");
    displayUploadedVideos();
  };
  reader.readAsDataURL(thumbnail);
}

function displayUploadedVideos() {
  const uploadedVideos = JSON.parse(localStorage.getItem("uploadedVideos")) || [];
  const uploadedVideosContainer = document.getElementById("uploadedVideos");

  uploadedVideosContainer.innerHTML = '';
  uploadedVideos.forEach(video => {
    const videoCard = document.createElement("div");
    videoCard.className = "video-card";
    videoCard.innerHTML = `
      <img src="${video.thumbnail}" alt="${video.title}">
      <h3>${video.title}</h3>
      <video controls>
        <source src="${video.video}" type="video/mp4">
      </video>
    `;
    uploadedVideosContainer.appendChild(videoCard);
  });
}

displayUploadedVideos();
