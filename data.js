// data.js
import { API_KEY, CHANNEL_ID } from './config.js';
import { parseDuration } from './utils.js';   

const STORAGE_KEY = `yt_rank_snapshot_v2_${CHANNEL_ID}`;

export async function getChannelInfo() {
  const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${CHANNEL_ID}&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const info = data.items[0];
  return {
    id: info.id,
    name: info.snippet.title,
    handle: info.snippet.customUrl ? "@" + info.snippet.customUrl.replace("@", "") : "",
    description: info.snippet.description || "",
    icon: info.snippet.thumbnails.default.url,
    subscribers: Number(info.statistics.subscriberCount),
    totalViews: Number(info.statistics.viewCount),
    totalVideos: Number(info.statistics.videoCount)
  };
}

export async function getUploadsPlaylist() {
  const url = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${API_KEY}`;
  const res = await fetch(url);
  return (await res.json()).items[0].contentDetails.relatedPlaylists.uploads;
}

export async function getAllVideoIds(playlistId) {
  let ids = [];
  let nextPage = "";
  while (true) {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${playlistId}&maxResults=50&pageToken=${nextPage}&key=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    ids.push(...data.items.map(v => v.contentDetails.videoId));
    if (!data.nextPageToken) break;
    nextPage = data.nextPageToken;
  }
  return ids;
}

export async function getVideoStats(videoIds) {
  const chunks = [];
  for (let i = 0; i < videoIds.length; i += 50) {
    chunks.push(videoIds.slice(i, i + 50));
  }
  let results = [];
  for (const chunk of chunks) {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${chunk.join(",")}&key=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    results.push(...data.items.map(v => ({
      id: v.id,
      title: v.snippet.title,
      thumbnail: v.snippet.thumbnails.medium.url,
      views: Number(v.statistics.viewCount || 0),
      likes: Number(v.statistics.likeCount || 0),
      duration: parseDuration(v.contentDetails.duration),
      publishedAt: v.snippet.publishedAt,
      isShort: parseDuration(v.contentDetails.duration) < 60
    })));
  }
  return results;
}

export function loadPreviousSnapshot() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveSnapshot(channelInfo, videos) {
  const snapshot = {
    timestamp: new Date().toISOString(),
    lastTotalViews: channelInfo.totalViews,
    lastTotalLikes: videos.reduce((sum, v) => sum + v.likes, 0),
    lastSubscribers: channelInfo.subscribers,
    videos: videos.map(v => ({
      id: v.id,
      currentRank: v.currentRank,
      views: v.views,
      likes: v.likes
    }))
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}