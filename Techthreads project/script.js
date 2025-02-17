const apiKey = "7e61b90dea3e436aa49eb65730b91669";

async function fetchNews(category = "all") {
    try {
        const url = `https://newsapi.org/v2/everything?domains=techcrunch.com&apiKey=${apiKey}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        const rssContainer = document.getElementById("rss-entries");
        rssContainer.innerHTML = "";

        // Get current page
        const currentPage = window.location.pathname.split("/").pop();

        // Carousel setup only for homepage
        if (currentPage === "index.html") {
            const carouselArticles = data.articles.filter(article => 
                article.urlToImage && article.description
            ).slice(0, 10);

            const carouselInner = document.querySelector(".carousel-inner");
            const carouselIndicators = document.querySelector(".carousel-indicators");

            if (carouselArticles.length > 0) {
                carouselInner.innerHTML = "";
                carouselIndicators.innerHTML = "";

                carouselArticles.forEach((article, index) => {
                    // Create carousel item
                    const carouselItem = document.createElement("div");
                    carouselItem.className = `carousel-item ${index === 0 ? 'active' : ''}`;
                    carouselItem.innerHTML = `
                        <img src="${article.urlToImage}" class="d-block w-100" alt="${article.title}">
                        <div class="carousel-caption">
                            <h3>${article.title}</h3>
                            <p>${article.description}</p>
                        </div>
                    `;
                    carouselInner.appendChild(carouselItem);

                    // Create indicators
                    const indicator = document.createElement("button");
                    indicator.type = "button";
                    indicator.dataset.bsTarget = "#newsCarousel";
                    indicator.dataset.bsSlideTo = index.toString();
                    if (index === 0) indicator.classList.add("active");
                    carouselIndicators.appendChild(indicator);
                });
            } else {
                document.getElementById("newsCarousel").style.display = "none";
            }
        }

        // Filter articles for current category
        const filteredArticles = data.articles.filter(article => {
            if (category === "all") return true;
            return article.title.toLowerCase().includes(category.toLowerCase());
        });

        // Display RSS entries with tags
        filteredArticles.forEach(article => {
            const tags = generateTags(article);

            const entry = document.createElement("div");
            entry.className = "rss-entry";
            entry.onclick = () => openArticle(article);
            entry.innerHTML = `
                ${article.urlToImage ? `<img src="${article.urlToImage}" alt="${article.title}" class="rss-image">` : ''}
                <div class="rss-content">
                    <h3>${article.title}</h3>
                    <p>${article.description || "No description available."}</p>
                    <small>Published on: ${new Date(article.publishedAt).toLocaleDateString()}</small>
                    <div class="tags">${tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}</div>
                </div>
            `;
            rssContainer.appendChild(entry);
        });

    } catch (error) {
        console.error("Error fetching news:", error);
    }
}

function generateTags(article) {
    const keywords = {
        ai: ["AI", "Artificial Intelligence", "Machine Learning", "Deep Learning"],
        security: ["Cybersecurity", "Hacking", "Data Breach", "Privacy", "Encryption"],
        startups: ["Startup", "Funding", "Entrepreneur", "Venture Capital"],
        apps: ["App", "iOS", "Android", "Mobile", "Software"],
        venture: ["Investment", "VC", "Funding", "Seed", "Series A", "Series B"]
    };

    let tags = [];

    Object.keys(keywords).forEach(category => {
        if (keywords[category].some(keyword => 
            article.title.toLowerCase().includes(keyword.toLowerCase()) || 
            (article.description && article.description.toLowerCase().includes(keyword.toLowerCase()))
        )) {
            tags.push(category);
        }
    });

    return tags.length ? tags : ["General"];
}

function openArticle(article) {
    localStorage.setItem("selectedArticle", JSON.stringify(article));
    window.location.href = "article.html";
}

document.addEventListener("DOMContentLoaded", () => {
    const currentPage = window.location.pathname.split("/").pop();
    const categoryMap = {
        "index.html": "all",
        "startups.html": "startups",
        "ai.html": "ai",
        "security.html": "security",
        "apps.html": "apps",
        "venture.html": "venture"
    };
    fetchNews(categoryMap[currentPage] || "all");
});
