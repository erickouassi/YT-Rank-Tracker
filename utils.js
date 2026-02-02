// utils.js
export function formatViews(n) {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000) return sign + (abs / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (abs >= 1_000) return sign + (abs / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return sign + abs.toString();
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString();
}

export function formatDuration(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function parseDuration(iso) {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const h = parseInt(match[1] || "0");
  const m = parseInt(match[2] || "0");
  const s = parseInt(match[3] || "0");
  return h * 3600 + m * 60 + s;
}

export function animateCounter(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  const duration = 700;
  const start = Number(el.textContent.replace(/,/g, "")) || 0;
  const startTime = performance.now();

  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const value = Math.floor(start + (target - start) * progress);
    el.textContent = value.toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

export function growthLabel(diff, label) {
  if (diff > 0) return `📈 +${formatViews(diff)} ${label}`;
  if (diff < 0) return `📉 ${formatViews(diff)} ${label}`;
  return `➖ No change`;
}

export function rankClass(change) {
  if (change > 0) return "rank-up";
  if (change < 0) return "rank-down";
  return "rank-same";
}

export function rankEmoji(change) {
  if (change > 0) return "📈";
  if (change < 0) return "📉";
  return "➖";
}

export function rankLabel(change) {
  if (change > 0) return `+${change}`;
  if (change < 0) return `${change}`;
  return "0";
}

// Compact relative time: 45d, 3m 12d, 2y ago, etc.
export function relativeTime(isoDate) {
  if (!isoDate) return "—";

  const past = new Date(isoDate);
  const now  = new Date();

  if (past > now) return "future";

  let years  = now.getFullYear() - past.getFullYear();
  let months = now.getMonth()    - past.getMonth();
  let days   = now.getDate()     - past.getDate();

  if (days < 0) {
    months--;
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    days += lastDay;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  // Today / very recent
  if (years === 0 && months === 0 && days === 0) {
    const diffMs = now - past;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins  = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0)  return `${hours}h ago`;
    if (mins  > 0)  return `${mins}m ago`;
    return "now";
  }

  if (years >= 1) {
    return `${years}y ago`;
  }

  if (months >= 1) {
    return days > 0 ? `${months}m ${days}d` : `${months}m`;
  }

  return `${days}d`;
}

