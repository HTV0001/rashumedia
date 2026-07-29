const HTV_API = "https://rashumedia-htv-api.shaain630.workers.dev/htv-live";

async function checkHTVLive() {
    try {
        const response = await fetch(HTV_API);
        const data = await response.json();

        if (data.live && data.videoId) {
            console.log("HTV IS LIVE:", data.videoId);

            // Make the livestream ID available to your website
            window.HTVLive = {
                live: true,
                videoId: data.videoId,
                title: data.title || "HTV Live"
            };

            document.dispatchEvent(
                new CustomEvent("htv-live", {
                    detail: window.HTVLive
                })
            );
        } else {
            console.log("HTV is currently offline.");

            window.HTVLive = {
                live: false,
                videoId: null
            };

            document.dispatchEvent(
                new CustomEvent("htv-offline")
            );
        }
    } catch (error) {
        console.error("HTV detector error:", error);
    }
}

// Check immediately
checkHTVLive();

// Check again every 60 seconds
setInterval(checkHTVLive, 60000);
