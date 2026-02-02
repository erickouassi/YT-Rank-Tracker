// main.js
import { CHANNEL_ID } from './config.js';
import { getChannelInfo, getUploadsPlaylist, getAllVideoIds, getVideoStats, loadPreviousSnapshot, saveSnapshot } from './data.js';
import { renderChannelSummary, renderTopVideo, renderTable, setCurrentData } from './ui.js';
import { initUI } from './ui.js';

const { refreshBtn } = initUI();

let currentData = [];

// ───────────────────────────────────────────────
// Refresh tracking (last time + daily count)
// ───────────────────────────────────────────────
const STORAGE_PREFIX = `yt_refresh_${CHANNEL_ID}_`;
const KEY_COUNT      = STORAGE_PREFIX + 'count';
const KEY_LAST_DAY   = STORAGE_PREFIX + 'lastDay';

function getCurrentNYDate() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
}

let refreshCount = parseInt(localStorage.getItem(KEY_COUNT) || '0', 10);
let lastKnownDay = localStorage.getItem(KEY_LAST_DAY) || getCurrentNYDate();

// Reset count if it's a new day in New York time
const todayNY = getCurrentNYDate();
if (lastKnownDay !== todayNY) {
  refreshCount = 0;
  localStorage.setItem(KEY_COUNT, '0');
  localStorage.setItem(KEY_LAST_DAY, todayNY);
}
/*
function updateRefreshDisplay() {
  const timeEl  = document.getElementById('lastRefreshTime');
  const countEl = document.getElementById('refreshCount');
  if (!timeEl || !countEl) return;

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/New_York'
  });

  timeEl.textContent = `Last: ${timeStr}`;
  countEl.textContent = `Refreshed today: ${refreshCount}×`;
} */

  function updateRefreshDisplay() {
  const timeEl  = document.getElementById('lastRefreshTime');
  const countEl = document.getElementById('refreshCount');
  if (!timeEl || !countEl) return;

  const now = new Date();

  // Format: "2/2/2026 10:34 AM" (short date + short time, NY timezone)
  const dateTimeStr = now.toLocaleString('en-US', {
    month: 'numeric',      // 2
    day:   'numeric',      // 2
    year:  'numeric',      // 2026
    hour:  'numeric',      // 10
    minute:'2-digit',      // 34
    hour12: true,          // AM/PM
    timeZone: 'America/New_York'
  });

  timeEl.textContent = `Last: ${dateTimeStr}`;
  countEl.textContent = `Refreshed today: ${refreshCount}×`;
}



// ───────────────────────────────────────────────
// Main load function
// ───────────────────────────────────────────────
async function loadTracker() {
  document.getElementById("tableBody").innerHTML = ""; // clear

  const prevSnapshot = loadPreviousSnapshot();

  try {
    const channelInfo   = await getChannelInfo();
    const playlistId    = await getUploadsPlaylist();
    const videoIds      = await getAllVideoIds(playlistId);
    const videos        = await getVideoStats(videoIds);

const ranked = [...videos]
  .sort((a, b) => {
    // Primary: highest views first
    if (a.views !== b.views) {
      return b.views - a.views;
    }
    
    // Secondary: when views are equal (incl. both 0), newest published first
    return new Date(b.publishedAt) - new Date(a.publishedAt);
  })
  .map((v, i) => ({ ...v, currentRank: i + 1 }));

    const withMovement = ranked.map(v => {
      const prev = prevSnapshot?.videos?.find(p => p.id === v.id);
      return {
        ...v,
        rankChange: prev ? prev.currentRank - v.currentRank : 0,
        viewsDelta: prev ? v.views - prev.views : 0
      };
    });

    currentData = withMovement;
    setCurrentData(currentData);

    renderChannelSummary(channelInfo, currentData, prevSnapshot);
    renderTopVideo(currentData);
    renderTable(true);

    // Save snapshot only on success
    saveSnapshot(channelInfo, currentData);

    // ─── Success: update refresh stats ───
    refreshCount++;
    localStorage.setItem(KEY_COUNT, refreshCount.toString());
    updateRefreshDisplay();

  } catch (err) {
    console.error("Snapshot refresh failed:", err);
    // Optional: you could show a small toast/error message here
  }
}

refreshBtn.addEventListener("click", loadTracker);

// Initial load + show initial stats
loadTracker();
updateRefreshDisplay();   // show 0× or previous count on first open