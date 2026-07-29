const HTV_API =
    "https://rashumedia-htv-api.shaain630.workers.dev/htv-live";

const offlineImage = document.getElementById("offlineImage");
const youtubeContainer = document.getElementById("youtubeContainer");
const youtubePlayer = document.getElementById("youtubePlayer");
const liveStatus = document.getElementById("liveStatus");

let currentVideoId = null;

async function checkHTVLive() {
    try {
        const response = await fetch(
            HTV_API + "?t=" + Date.now(),
            {
                cache: "no-store"
            }
        );

        if (!response.ok) {
            throw new Error("HTV API request failed");
        }

        const data = await response.json();

        if (data.live && data.videoId) {
            showHTVLive(data.videoId);
        } else {
            showHTVOffline();
        }

    } catch (error) {
        console.error("HTV detector error:", error);

        // If the detector itself fails,
        // don't pretend HTV is live.
        showHTVOffline();
    }
}


function showHTVLive(videoId) {

    liveStatus.textContent = "LIVE";
    liveStatus.classList.add("is-live");

    offlineImage.hidden = true;
    youtubeContainer.hidden = false;

    // Only reload the player when the video changes.
    if (currentVideoId !== videoId) {

        currentVideoId = videoId;

        youtubePlayer.src =
            "https://www.youtube.com/embed/" +
            encodeURIComponent(videoId) +
            "?autoplay=1&rel=0";
    }
}


function showHTVOffline() {

    liveStatus.textContent = "OFFLINE";
    liveStatus.classList.remove("is-live");

    youtubeContainer.hidden = true;
    offlineImage.hidden = false;

    // Stop the YouTube video completely.
    youtubePlayer.src = "";

    currentVideoId = null;
}


// Check immediately when the page loads.
checkHTVLive();

// Check every 60 seconds.
setInterval(checkHTVLive, 60000);
