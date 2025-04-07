let player;
const playlistVideos = JSON.parse(document.querySelector("script[type='application/json']").textContent);
let selectedVideoIndex = 0;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        height: '450',
        width: '100%',
        videoId: playlistVideos[selectedVideoIndex].url,
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    event.target.playVideo();
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        const nextIndex = selectedVideoIndex + 1;
        if (nextIndex < playlistVideos.length) {
            selectedVideoIndex = nextIndex;
            player.loadVideoById(playlistVideos[nextIndex].url);
        }
    }
}

// Handle clicking on videos
document.querySelectorAll('.video-item').forEach((item, index) => {
    item.addEventListener('click', () => {
        selectedVideoIndex = index;
        player.loadVideoById(playlistVideos[index].url);
        document.querySelectorAll('.video-item').forEach(el => el.classList.remove('active'));
        item.classList.add('active');
    });
});
