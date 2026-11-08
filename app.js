(() => {
  "use strict";
  const places = window.TRAVELGO_PLACES || [];
  const categories = ["All destinations", ...new Set(places.map(p => p.category))];
  const $ = (id) => document.getElementById(id);
  const safe = (s) => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const card = (p) => `<a class="destination-card" href="destination.html?id=${encodeURIComponent(p.id)}" aria-label="Explore ${safe(p.name)}">
    <img src="${safe(p.image)}" alt="${safe(p.name)}" loading="lazy" referrerpolicy="no-referrer">
    <span class="card-category">${safe(p.category)}</span>
    <div class="card-info"><h3>${safe(p.name)}</h3><p>${safe(p.location)}</p></div><span class="card-arrow" aria-hidden="true">↗</span>
  </a>`;
  const menuToggle = $("menuToggle"), navLinks = $("navLinks");
  if (menuToggle && navLinks) menuToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.textContent = open ? "×" : "☰";
  });
  if ($("year")) $("year").textContent = new Date().getFullYear();

  const grid = $("destinationGrid");
  if (grid) {
    let selected = "All destinations", query = "";
    const filters = $("filterRow");
    categories.forEach((category, i) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "filter-chip"; b.textContent = category;
      b.setAttribute("aria-pressed", String(i === 0));
      b.addEventListener("click", () => {
        selected = category;
        [...filters.children].forEach(x => x.setAttribute("aria-pressed", String(x === b)));
        render();
      });
      filters.appendChild(b);
    });
    const search = $("searchInput"), sort = $("sortSelect");
    function render() {
      const q = query.trim().toLocaleLowerCase();
      let result = places.filter(p =>
        (selected === "All destinations" || p.category === selected) &&
        [p.name,p.location,p.division,p.category,p.description].join(" ").toLocaleLowerCase().includes(q)
      );
      if (sort && sort.value === "az") result.sort((a,b) => a.name.localeCompare(b.name));
      grid.innerHTML = result.map(card).join("");
      $("totalCount").textContent = result.length;
      $("resultsText").textContent = `Showing ${result.length} of ${places.length} destinations`;
      $("emptyState").hidden = result.length !== 0;
      grid.hidden = result.length === 0;
    }
    search.addEventListener("input", e => { query = e.target.value; render(); });
    sort.addEventListener("change", render);
    $("clearFilters").addEventListener("click", () => {
      query = ""; selected = "All destinations"; search.value = ""; sort.value = "featured";
      [...filters.children].forEach((x,i) => x.setAttribute("aria-pressed", String(i===0)));
      render();
    });
    document.addEventListener("keydown", e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); search.focus(); }
      if (e.key === "Escape" && document.activeElement === search) { search.value = ""; query = ""; render(); search.blur(); }
    });
    render();
  }

  const detail = $("destinationDetail");
  if (detail) {
    const id = new URLSearchParams(location.search).get("id");
    const p = places.find(x => x.id === id);
    if (!p) {
      detail.innerHTML = `<div class="detail-main"><h1>Destination not found</h1><p>That destination could not be found in the TravelGo guide.</p><a class="btn btn-yellow" href="index.html#destinations">Browse all destinations ↗</a></div>`;
    } else {
      document.title = `${p.name} | TravelGo Bangladesh`;
      const related = places.filter(x => x.id !== p.id && x.division === p.division).slice(0,4);
      detail.innerHTML = `
        <header class="detail-hero"><img src="${safe(p.image)}" alt="${safe(p.name)}"><div class="detail-hero-content">
          <span class="section-kicker" style="color:#ffdf61">${safe(p.category)}</span><h1>${safe(p.name)}</h1><p>${safe(p.location)} · ${safe(p.division)} Division</p>
        </div></header>
        <section class="detail-main">
          <div class="detail-facts">
            <div class="fact"><small>LOCATION</small><b>${safe(p.location)}</b></div>
            <div class="fact"><small>DIVISION</small><b>${safe(p.division)}</b></div>
            <div class="fact"><small>TRAVEL CATEGORY</small><b>${safe(p.category)}</b></div>
          </div>
          <div class="detail-copy"><span class="section-kicker">GET TO KNOW THE PLACE</span><h2>Discover ${safe(p.name)}</h2><p>${safe(p.description)}</p><p><strong>What makes it special:</strong> ${safe(p.highlights)}</p>
          <div class="detail-actions"><a class="btn btn-yellow" href="${safe(p.map)}" target="_blank" rel="noopener noreferrer">Open location in Google Maps <b>↗</b></a><a class="outline-btn" href="index.html#destinations">← All destinations</a></div>
          </div>
          <p class="disclaimer">Please verify current transport, access, permits, opening hours, weather and local safety guidance before traveling. Information on this page is a general destination overview, not a live travel advisory.</p>
          ${related.length ? `<h2 style="font-family:'Playfair Display';color:#173957;margin:45px 0 18px">More places in ${safe(p.division)}</h2><div class="related-grid">${related.map(card).join("")}</div>` : ""}
        </section>`;
    }
  }
})();