/* ==================================================
   RASHUMEDIA - SCRIPT.JS
================================================== */


/* ==================================================
   CONFIGURATION
================================================== */

const NEWS_API_URL =
    "https://henbadhootelevisionrashumediasunonl.vercel.app/api/latest";

const HTV_STATUS_URL = "";

const NEWS_REFRESH_TIME = 60 * 1000;
const HTV_REFRESH_TIME = 60 * 1000;


/* ==================================================
   ELEMENTS
================================================== */

const newsGrid = document.getElementById("newsGrid");
const errorMessage = document.getElementById("errorMessage");
const retryButton = document.getElementById("retryButton");
const lastUpdated = document.getElementById("lastUpdated");

const offlineImage = document.getElementById("offlineImage");
const youtubeContainer = document.getElementById("youtubeContainer");
const youtubePlayer = document.getElementById("youtubePlayer");
const liveStatus = document.getElementById("liveStatus");

const menuButton = document.getElementById("menuButton");
const navigation = document.getElementById("navigation");

const currentYear = document.getElementById("currentYear");


/* ==================================================
   YEAR
================================================== */

if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}


/* ==================================================
   ESCAPE HTML
================================================== */

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ==================================================
   CLEAN URL
================================================== */

function cleanURL(value) {

    if (!value) {
        return "";
    }

    return String(value).trim();
}


/* ==================================================
   CLEAN ARTICLES
================================================== */

function cleanArticles(articles) {

    if (!Array.isArray(articles)) {
        return [];
    }

    const seen = new Set();

    const cleaned = [];

    for (const article of articles) {

        if (!article) {
            continue;
        }

        const title = String(article.title || "").trim();
        const url = cleanURL(article.url);

        if (!title || !url) {
            continue;
        }

        if (seen.has(url)) {
            continue;
        }

        seen.add(url);

        cleaned.push({
            title: title,
            url: url,
            image: cleanURL(article.image),
            source: article.source || "News",
            section: article.section || "Maldives"
        });
    }

    return cleaned.slice(0, 12);
}


/* ==================================================
   SKELETON LOADING
================================================== */

function showLoadingCards() {

    if (!newsGrid) {
        return;
    }

    let html = "";

    for (let i = 0; i < 12; i++) {

        html += `
            <div class="skeleton-card">

                <div class="skeleton-image"></div>

                <div class="skeleton-content">

                    <div class="skeleton-line small"></div>

                    <div class="skeleton-line large"></div>

                    <div class="skeleton-line medium"></div>

                    <div class="skeleton-button"></div>

                </div>

            </div>
        `;
    }

    newsGrid.innerHTML = html;
}


/* ==================================================
   IMAGE FALLBACK
================================================== */

function handleImageError(image) {

    image.style.display = "none";

    const fallback =
        image.parentElement.querySelector(".image-fallback");

    if (fallback) {
        fallback.hidden = false;
    }
}


/* ==================================================
   RENDER NEWS
================================================== */

function renderNews(articles) {

    if (!newsGrid) {
        return;
    }

    if (!articles.length) {

        newsGrid.innerHTML = "";

        if (errorMessage) {
            errorMessage.hidden = false;
        }

        return;
    }

    if (errorMessage) {
        errorMessage.hidden = true;
    }

    newsGrid.innerHTML = articles.map(article => {

        const title = escapeHTML(article.title);
        const url = escapeHTML(article.url);
        const image = escapeHTML(article.image);
        const section = escapeHTML(article.section);

        let imageHTML = "";

        if (image) {

            imageHTML = `
                <img
                    class="card-image"
                    src="${image}"
                    alt=""
                    loading="lazy"
                    onerror="handleImageError(this)"
                >
            `;

        }

        return `
            <article class="news-card">

                <div class="card-image-container">

                    ${imageHTML}

                    <div
                        class="image-fallback"
                        ${image ? "hidden" : ""}
                    >
                        Image unavailable
                    </div>

                </div>


                <div class="card-content">

                    <div class="card-meta">

                        <span class="category">
                            ${section}
                        </span>

                        <span>•</span>

                        <span>
                            News
                        </span>

                    </div>


                    <h3 class="card-title">
                        ${title}
                    </h3>


                    <a
                        class="read-button"
                        href="${url}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Read Full Article From Original Source
                    </a>

                </div>

            </article>
        `;

    }).join("");
}


/* ==================================================
   UPDATED TIME
================================================== */

function getUpdatedText(updatedAt) {

    if (!updatedAt) {
        return "Last updated: just now";
    }

    const date = new Date(updatedAt);

    if (Number.isNaN(date.getTime())) {
        return "Last updated: just now";
    }

    return "Last updated: " +
        date.toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short"
        });
}


/* ==================================================
   LOAD NEWS
================================================== */

async function loadNews() {

    if (!newsGrid) {
        console.error("newsGrid element was not found.");
        return;
    }

    if (errorMessage) {
        errorMessage.hidden = true;
    }

    showLoadingCards();

    try {

        const response = await fetch(
            NEWS_API_URL,
            {
                method: "GET",
                cache: "no-store"
            }
        );

        if (!response.ok) {

            throw new Error(
                `News API returned ${response.status}`
            );
        }

        const data = await response.json();

        console.log("RashuMedia API response:", data);

        const articles = cleanArticles(data.articles);

        if (!articles.length) {
            throw new Error("The API returned no valid articles.");
        }

        renderNews(articles);

        if (lastUpdated) {
            lastUpdated.textContent =
                getUpdatedText(data.updatedAt);
        }

    } catch (error) {

        console.error(
            "RashuMedia news loading error:",
            error
        );

        newsGrid.innerHTML = "";

        if (errorMessage) {
            errorMessage.hidden = false;
        }

        if (lastUpdated) {
            lastUpdated.textContent =
                "Last updated: —";
        }
    }
}


/* ==================================================
   HTV OFFLINE
================================================== */

function showHTVOffline() {

    if (youtubePlayer) {
        youtubePlayer.src = "";
    }

    if (youtubeContainer) {
        youtubeContainer.hidden = true;
    }

    if (offlineImage) {
        offlineImage.hidden = false;
    }

    if (liveStatus) {

        liveStatus.textContent = "Offline";

        liveStatus.className =
            "live-status offline";
    }
}


/* ==================================================
   HTV LIVE
================================================== */

function showHTVLive(videoId) {

    if (!videoId) {
        showHTVOffline();
        return;
    }

    const cleanVideoId =
        String(videoId).trim();

    if (!cleanVideoId) {
        showHTVOffline();
        return;
    }

    if (youtubePlayer) {

        youtubePlayer.src =
            "https://www.youtube.com/embed/" +
            encodeURIComponent(cleanVideoId) +
            "?autoplay=1&rel=0&modestbranding=1";
    }

    if (offlineImage) {
        offlineImage.hidden = true;
    }

    if (youtubeContainer) {
        youtubeContainer.hidden = false;
    }

    if (liveStatus) {

        liveStatus.textContent = "LIVE";

        liveStatus.className =
            "live-status live";
    }
}


/* ==================================================
   CHECK HTV STATUS
================================================== */

async function checkHTVStatus() {

    /*
        Until we connect the real HTV
        live-status endpoint, show
        the offline image.
    */

    if (!HTV_STATUS_URL) {

        showHTVOffline();

        return;
    }

    try {

        const response = await fetch(
            HTV_STATUS_URL,
            {
                method: "GET",
                cache: "no-store"
            }
        );

        if (!response.ok) {
            throw new Error(
                `HTV status returned ${response.status}`
            );
        }

        const data = await response.json();

        console.log(
            "HTV status:",
            data
        );

        if (
            data.live === true &&
            data.videoId
        ) {

            showHTVLive(
                data.videoId
            );

        } else {

            showHTVOffline();

        }

    } catch (error) {

        console.error(
            "HTV status check failed:",
            error
        );

        showHTVOffline();
    }
}


/* ==================================================
   RETRY BUTTON
================================================== */

if (retryButton) {

    retryButton.addEventListener(
        "click",
        loadNews
    );
}


/* ==================================================
   MOBILE MENU
================================================== */

if (menuButton && navigation) {

    menuButton.addEventListener(
        "click",
        () => {

            const isOpen =
                navigation.classList.toggle(
                    "open"
                );

            menuButton.setAttribute(
                "aria-expanded",
                String(isOpen)
            );
        }
    );


    navigation.addEventListener(
        "click",
        event => {

            if (
                event.target.closest("a")
            ) {

                navigation.classList.remove(
                    "open"
                );

                menuButton.setAttribute(
                    "aria-expanded",
                    "false"
                );
            }
        }
    );
}


/* ==================================================
   START WEBSITE
================================================== */

showLoadingCards();

loadNews();

checkHTVStatus();


/* ==================================================
   AUTOMATIC REFRESH
================================================== */

setInterval(
    loadNews,
    NEWS_REFRESH_TIME
);

setInterval(
    checkHTVStatus,
    HTV_REFRESH_TIME
);