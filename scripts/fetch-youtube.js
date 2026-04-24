#!/usr/bin/env node
/**
 * Fetch latest YouTube video metadata via the public RSS feed and write it to
 * data/youtube.json. No API key needed.
 *
 * Requires data/config.json with either a youtubeChannelId (preferred) or a
 * youtubeHandle that the script will try to resolve. Falls back to env vars
 * YOUTUBE_CHANNEL_ID / YOUTUBE_HANDLE when running in CI.
 *
 * On failure, writes a stub {error, fetched} so downstream builds still run.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CONFIG_PATH = path.join(ROOT, 'data/config.json');
const OUT_PATH = path.join(ROOT, 'data/youtube.json');

function loadJson(p, fallback) {
  if (!fs.existsSync(p)) return fallback;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return fallback; }
}

function writeStub(err) {
  fs.writeFileSync(OUT_PATH, JSON.stringify({
    error: err, fetched: new Date().toISOString(),
  }, null, 2));
  console.error(`stub written: ${err}`);
}

async function discoverChannelId(handle) {
  try {
    const res = await fetch(`https://www.youtube.com/@${handle}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (profile-refresh-bot)' },
    });
    const html = await res.text();
    const m = html.match(/"channelId":"(UC[^"]+)"/) || html.match(/"externalId":"(UC[^"]+)"/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

function parseLatestEntry(xml) {
  const entryMatch = xml.match(/<entry>([\s\S]*?)<\/entry>/);
  if (!entryMatch) throw new Error('feed contains no entries');
  const body = entryMatch[1];
  const pick = (re) => {
    const m = body.match(re);
    return m ? m[1] : '';
  };
  return {
    title: pick(/<title>([^<]+)<\/title>/),
    url: pick(/<link[^>]*rel="alternate"[^>]*href="([^"]+)"/) || pick(/<link[^>]*href="([^"]+)"/),
    published: pick(/<published>([^<]+)<\/published>/),
    thumbnail: pick(/<media:thumbnail[^>]*url="([^"]+)"/),
    fetched: new Date().toISOString(),
  };
}

async function main() {
  const cfg = loadJson(CONFIG_PATH, {});
  let channelId = cfg.youtubeChannelId || process.env.YOUTUBE_CHANNEL_ID;
  const handle = cfg.youtubeHandle || process.env.YOUTUBE_HANDLE;

  if (!channelId && handle) {
    channelId = await discoverChannelId(handle);
    if (channelId) console.log(`resolved handle @${handle} -> ${channelId}`);
  }

  if (!channelId) {
    return writeStub('no channel id configured (set data/config.json youtubeChannelId)');
  }

  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
    if (!res.ok) throw new Error(`http ${res.status}`);
    const xml = await res.text();
    const entry = parseLatestEntry(xml);
    fs.writeFileSync(OUT_PATH, JSON.stringify(entry, null, 2));
    console.log(`wrote ${OUT_PATH}: ${entry.title}`);
  } catch (e) {
    writeStub(`fetch failed: ${e.message}`);
  }
}

main();
