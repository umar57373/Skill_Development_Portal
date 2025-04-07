document.addEventListener("DOMContentLoaded", function () {
    const playlistsContainer = document.getElementById("playlists-container");
    
    if (!playlistsContainer) return;
  
    // Example Data (Replace this with actual playlist data from a server if needed)
    const playlists = [
      {
        id: "ai-ml-1",
        title: "Deep Learning Basics",
        description: "Introduction to neural networks and deep learning.",
        category: "ai-ml",
        videos: [
          { id: "video-1", title: "Intro to Deep Learning", watched: false },
          { id: "video-2", title: "Neural Networks Explained", watched: false }
        ]
      },
      {
        id: "ai-ml-2",
        title: "Machine Learning for Beginners",
        description: "Understanding ML algorithms and applications.",
        category: "ai-ml",
        videos: [
          { id: "video-3", title: "What is Machine Learning?", watched: false },
          { id: "video-4", title: "Supervised vs Unsupervised Learning", watched: false }
        ]
      }
    ];
  
    function loadPlaylists() {
      playlistsContainer.innerHTML = "";
  
      playlists.forEach((playlist) => {
        const playlistCard = document.createElement("div");
        playlistCard.classList.add("playlist-card");
  
        const watchedCount = playlist.videos.filter((video) => video.watched).length;
        const progress = (watchedCount / playlist.videos.length) * 100;
        const isStarted = watchedCount > 0;
  
        playlistCard.innerHTML = `
          <h2>${playlist.title}</h2>
          <p>${playlist.description}</p>
          <p><strong>Videos:</strong> ${playlist.videos.length}</p>
          <p><strong>Progress:</strong> ${Math.round(progress)}%</p>
          <div class="progress-bar">
            <div class="progress" style="width: ${progress}%;"></div>
          </div>
          <button class="view-chapters" data-id="${playlist.id}">View Chapters</button>
          <ul class="chapter-list hidden" id="chapters-${playlist.id}"></ul>
        `;
  
        playlistsContainer.appendChild(playlistCard);
      });
  
      document.querySelectorAll(".view-chapters").forEach((button) => {
        button.addEventListener("click", function () {
          const playlistId = this.getAttribute("data-id");
          toggleChapters(playlistId);
        });
      });
    }
  
    function toggleChapters(playlistId) {
      const chapterList = document.getElementById(`chapters-${playlistId}`);
      chapterList.classList.toggle("hidden");
  
      if (!chapterList.innerHTML) {
        const playlist = playlists.find((p) => p.id === playlistId);
        chapterList.innerHTML = playlist.videos
          .map((video) => `<li>${video.title} <input type="checkbox" data-video-id="${video.id}" ${video.watched ? "checked" : ""}></li>`)
          .join("");
  
        document.querySelectorAll(`#chapters-${playlistId} input[type="checkbox"]`).forEach((checkbox) => {
          checkbox.addEventListener("change", function () {
            const videoId = this.getAttribute("data-video-id");
            toggleWatchedStatus(playlistId, videoId);
          });
        });
      }
    }
  
    function toggleWatchedStatus(playlistId, videoId) {
      const playlist = playlists.find((p) => p.id === playlistId);
      const video = playlist.videos.find((v) => v.id === videoId);
      video.watched = !video.watched;
  
      loadPlaylists();
    }
  
    loadPlaylists();
  });
  