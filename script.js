/* ==================================================
   RASHUMEDIA - SCRIPT.JS
================================================== */

const NEWS_API_URL =
    "https://henbadhootelevisionrashumediasunonl.vercel.app/api/latest";

const NEWS_REFRESH_TIME = 60 * 1000;


/* ==================================================
   ELEMENTS
================================================== */

const newsGrid = document.getElementById("newsGrid");
const errorMessage = document.getElementById("errorMessage");
const retryButton = document.getElementById("retryButton");
const lastUpdated = document.getElementById("lastUpdated");

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
   HELPERS
================================================== */

function escapeHTML(value) {
    if (value === null || value === undefined) return "";

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function cleanURL(value) {
    return value ? String(value).trim() : "";
}

function cleanArticles(articles) {
    if (!Array.isArray(articles)) return [];

    const seen = new Set();
    const cleaned = [];

    for (const article of articles) {
        if (!article) continue;

        const title = String(article.title || "").trim();
        const url = cleanURL(article.url);

        if (!title || !url || seen.has(url)) continue;

        seen.add(url);

        cleaned.push({
            title,
            url,
            image: cleanURL(article.image),
            source: article.source || "News",
            section: article.section || "Maldives"
        });
    }

    return cleaned.slice(0, 12);
}


/* ==================================================
   LOADING
================================================== */

function showLoadingCards() {
    if (!newsGrid) return;

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

function handleImageError(image) {
    image.style.display = "none";

    const fallback =
        image.parentElement.querySelector(".image-fallback");

    if (fallback) fallback.hidden = false;
}


/* ==================================================
   NEWS RENDERING
================================================== */

function renderNews(articles) {
    if (!newsGrid) return;

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

        const imageHTML = image
            ? `
                <img
                    class="card-image"
                    src="${image}"
                    alt=""
                    loading="lazy"
                    onerror="handleImageError(this)"
                >
            `
            : "";

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
            NEWS_API_URL + "?t=" + Date.now(),
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

        console.log(
            "RashuMedia API response:",
            data
        );

        const articles =
            cleanArticles(data.articles);

        if (!articles.length) {
            throw new Error(
                "The API returned no valid articles."
            );
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
                navigation.classList.toggle("open");

            menuButton.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

        }
    );


    navigation.addEventListener(
        "click",
        event => {

            if (event.target.closest("a")) {

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

   IMPORTANT:
   HTV LIVE DETECTION IS NOT HANDLED HERE.

   htv-live.js is the ONLY file responsible
   for detecting whether HTV is live.
================================================== */

showLoadingCards();

loadNews();


/* ==================================================
   AUTOMATIC NEWS REFRESH
================================================== */

setInterval(
    loadNews,
    NEWS_REFRESH_TIME
);
