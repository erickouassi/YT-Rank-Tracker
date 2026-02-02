// ui.js 
import {
  formatViews,
  formatDate,
  animateCounter,
  growthLabel,
  rankClass,
  rankEmoji,
  rankLabel,
  formatDuration,
  relativeTime   
} from './utils.js';


let currentData = [];
let filteredType = "all";
let sortField = null;
let sortDirection = "desc";

export function setCurrentData(data) { currentData = data; }
export function getCurrentData() { return currentData; }

export function applyFilter(data, type) {
  if (type === "video") return data.filter(v => !v.isShort);
  if (type === "short") return data.filter(v => v.isShort);
  return data;
}

export function sortData(data) {
  if (!sortField) return data;
  const sorted = [...data];
  sorted.sort((a, b) => {
    let valA, valB;
    switch (sortField) {
      case "rank":      valA = a.currentRank; valB = b.currentRank; break;
      case "title":     valA = a.title.toLowerCase(); valB = b.title.toLowerCase(); break;
      case "views":     valA = a.views; valB = b.views; break;
      case "published": valA = new Date(a.publishedAt).getTime(); valB = new Date(b.publishedAt).getTime(); break;
      case "duration":  valA = a.duration; valB = b.duration; break;
      case "movement":  valA = a.rankChange; valB = b.rankChange; break;
      default: return 0;
    }
    if (typeof valA === "string") {
      return sortDirection === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortDirection === "asc" ? valA - valB : valB - valA;
  });
  return sorted;
}

export function renderChannelSummary(info, videos, prevSnapshot) {
  const totalLikes = videos.reduce((sum, v) => sum + v.likes, 0);
  const avgViews = info.totalVideos ? Math.round(info.totalViews / info.totalVideos) : 0;

  document.getElementById("channelIcon").src = info.icon;
  document.getElementById("channelName").textContent = info.name;
  document.getElementById("channelHandle").textContent = info.handle;
  document.getElementById("channelDescription").textContent = info.description;

  animateCounter("subsCount", info.subscribers);
  animateCounter("viewsCount", info.totalViews);
  animateCounter("likesCount", totalLikes);
  animateCounter("avgViewsCount", avgViews);

  const subsEl   = document.getElementById("subsGrowth");
  const viewsEl  = document.getElementById("viewsGrowth");
  const likesEl  = document.getElementById("likesGrowth");
  const engageEl = document.getElementById("engagementScore");

  let lastTimeStr = "First snapshot";
  let subsDelta = null, viewsDelta = null, likesDelta = null;

  if (prevSnapshot?.timestamp) {
    const last = new Date(prevSnapshot.timestamp);
    const hours = Math.round((Date.now() - last.getTime()) / 3600000);
    lastTimeStr = hours < 48 ? `Last snapshot: ${hours} hour${hours === 1 ? '' : 's'} ago`
                             : `Last: ${last.toLocaleDateString()}`;

    subsDelta  = info.subscribers - (prevSnapshot.lastSubscribers  ?? 0);
    viewsDelta = info.totalViews    - (prevSnapshot.lastTotalViews   ?? 0);
    likesDelta = totalLikes         - (prevSnapshot.lastTotalLikes  ?? 0);
  }

  subsEl.textContent  = subsDelta !== null ? growthLabel(subsDelta, "subs")   : "First snapshot";
  viewsEl.textContent = viewsDelta !== null ? growthLabel(viewsDelta, "views") : "First snapshot";
  likesEl.textContent = likesDelta !== null ? growthLabel(likesDelta, "likes") : "First snapshot";

  const engagement = info.totalViews ? (totalLikes / info.totalViews * 100).toFixed(2) : 0;
  engageEl.textContent = `Engagement: ${engagement}% • ${lastTimeStr}`;
}

export function renderTopVideo(videos) {
  if (!videos.length) return;
  const top = [...videos].sort((a, b) => b.views - a.views)[0];
  document.getElementById("topVideoThumb").style.backgroundImage = `url("${top.thumbnail}")`;
  document.getElementById("topVideoTitle").textContent = top.title;
  document.getElementById("topVideoStats").textContent =
    `${formatViews(top.views)} views • ${top.likes.toLocaleString()} likes`;
  document.getElementById("topVideoMeta").textContent =
    `${top.isShort ? "Short" : "Video"} • ${formatDate(top.publishedAt)}`;
}

export function renderTable(reset = false) {
  const tableBody = document.getElementById("tableBody");
  if (reset) {
    tableBody.innerHTML = "";
    window.renderIndex = 0;
  }

  let filtered = applyFilter(currentData, filteredType);
  filtered = sortData(filtered);

  const chunk = filtered.slice(window.renderIndex, window.renderIndex + 30);
  chunk.forEach(v => {
    const tr = document.createElement("tr");
    tr.classList.add("fade-in-row");
    tr.innerHTML = `
      <td>${v.currentRank}</td>
      <td class="title-cell">
        <div class="thumb" style="background-image:url('${v.thumbnail}')"></div>
        <div>
          <div class="title-main">${v.title}</div>
          <div class="title-meta">
            <span class="chip ${v.isShort ? "short" : "video"}">${v.isShort ? "Short" : "Video"}</span>
            <span>${formatViews(v.views)} views</span>
          </div>
        </div>
      </td>
      <td>${formatViews(v.views)}</td>
      <td class="${rankClass(v.rankChange)}">
        ${rankEmoji(v.rankChange)} ${rankLabel(v.rankChange)}
        ${v.viewsDelta > 0 ? `<br><small>+${formatViews(v.viewsDelta)} today</small>` : ""}
      </td>
      <!--<td>${formatDate(v.publishedAt)}</td>-->
      <td title="${new Date(v.publishedAt).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'})}">
  ${relativeTime(v.publishedAt)}
</td>
      <td>${formatDuration(v.duration)}</td>
    `;
    tableBody.appendChild(tr);
  });

  window.renderIndex += 30;
  document.getElementById("countInfo").textContent =
    `${filtered.length} uploads • showing ${Math.min(window.renderIndex, filtered.length)}`;
}

export function updateSortIndicators() {
  document.querySelectorAll(".sortable").forEach(th => {
    const field = th.dataset.sort;
    let indicator = th.querySelector(".sort-indicator");
    if (field === sortField) {
      if (!indicator) {
        indicator = document.createElement("span");
        indicator.className = "sort-indicator";
        th.appendChild(indicator);
      }
      indicator.textContent = sortDirection === "asc" ? " ▲" : " ▼";
    } else if (indicator) {
      indicator.remove();
    }
  });
}

export function initUI() {
  const themeToggle   = document.getElementById("themeToggle");
  const refreshBtn    = document.getElementById("refreshBtn");
  const resetBtn      = document.getElementById("resetBtn");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const backToTop     = document.getElementById("backToTop");

  // Theme
  const savedTheme = localStorage.getItem("yt_theme");
  if (savedTheme === "light") {
    document.body.classList.remove("theme-dark");
    document.body.classList.add("theme-light");
    themeToggle.textContent = "☀️ Light";
  }
  themeToggle.addEventListener("click", () => {
    if (document.body.classList.contains("theme-dark")) {
      document.body.classList.remove("theme-dark");
      document.body.classList.add("theme-light");
      themeToggle.textContent = "☀️ Light";
      localStorage.setItem("yt_theme", "light");
    } else {
      document.body.classList.remove("theme-light");
      document.body.classList.add("theme-dark");
      themeToggle.textContent = "🌙 Dark";
      localStorage.setItem("yt_theme", "dark");
    }
  });

  // Filters
  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      filteredType = btn.dataset.type;
      renderTable(true);
    });
  });

  // Sorting
  document.querySelectorAll(".sortable").forEach(header => {
    header.addEventListener("click", () => {
      const field = header.dataset.sort;
      if (sortField === field) {
        sortDirection = sortDirection === "asc" ? "desc" : "asc";
      } else {
        sortField = field;
        sortDirection = "desc";
      }
      updateSortIndicators();
      renderTable(true);
    });
  });
  updateSortIndicators();

  // Infinite scroll + back to top
  window.addEventListener("scroll", () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) {
      renderTable(false);
    }
    backToTop.classList.toggle("visible", window.scrollY > 400);
  });
  backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // Reset
  resetBtn.addEventListener("click", () => {
    if (!confirm("Reset all saved snapshots for this channel?")) return;
    localStorage.removeItem(`yt_rank_snapshot_v2_${CHANNEL_ID}`);
    location.reload();
  });

  return { refreshBtn };
}