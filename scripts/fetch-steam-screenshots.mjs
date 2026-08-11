/**
 * Offline Steam screenshot fetcher for GitHub Pages static export.
 * Usage: npm run steam:screenshots
 *
 * Downloads public screenshots into public/img/screenshot/steam/{appId}/
 * and writes src/data/screenshotsData.generated.ts
 */

import { mkdir, writeFile, access } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public', 'img', 'screenshot', 'steam');
const OUT_TS = path.join(ROOT, 'src', 'data', 'screenshotsData.generated.ts');

const PROFILE = 'https://steamcommunity.com/id/Gosloto';
const STEAM_ID64 = '76561199001573821';
const LIMIT = Number(process.env.STEAM_SHOTS_LIMIT || 60);
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

const APP_MAP = {
  292030: { gameId: 'witcher3', game: 'The Witcher 3: Wild Hunt' },
  2555430: { gameId: 'tradesman', game: 'TRADESMAN: Deal to Dealer' },
  2477340: { gameId: 'expeditions', game: 'Expeditions: A MudRunner Game' },
  8500: { gameId: 'eve', game: 'EVE Online' },
  230410: { gameId: 'warframe', game: 'Warframe' },
  493520: { gameId: 'gtfo', game: 'GTFO' },
  72850: { gameId: 'skyrim', game: 'The Elder Scrolls V: Skyrim' },
  381210: { gameId: 'dbd', game: 'Dead by Daylight' },
  602960: { gameId: 'barotrauma', game: 'Barotrauma' },
  548430: { gameId: 'drg', game: 'Deep Rock Galactic' },
  2605790: { gameId: 'drgrougecore', game: 'Deep Rock Galactic: Rogue Core' },
  594650: { gameId: 'hunt', game: 'Hunt: Showdown 1896' },
  2198150: { gameId: 'tinyglade', game: 'Tiny Glade' },
  704270: { gameId: 'genzero', game: 'Generation Zero®' },
  2483190: { gameId: 'mewgenics', game: 'Mewgenics' },
  2246340: { gameId: 'monsterhunter', game: 'Monster Hunter Wilds' },
  686060: { gameId: 'kletka', game: 'KLETKA' }
};

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': UA,
      Accept: 'text/html,application/xhtml+xml'
    }
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  if (/Sign In|login_form|Steam Guard/i.test(text) && !/screenshot_showcase|profile_media_item|rgScreenshots/i.test(text)) {
    throw new Error('Steam returned a login wall — keep previous snapshot.');
  }
  return text;
}

function parseScreenshotsFromHtml(html) {
  const items = [];
  const seen = new Set();

  // Current Steam image wall markup
  const blockRe =
    /data-appid="(\d+)"\s+data-publishedfileid="(\d+)"[\s\S]{0,400}?background-image:\s*url\('([^']+)'\)/gi;

  let m;
  while ((m = blockRe.exec(html)) !== null) {
    const appId = Number(m[1]);
    const fileId = m[2];
    const imageUrl = m[3].replace(/&amp;/g, '&');
    if (seen.has(fileId)) continue;
    seen.add(fileId);
    const mapped = APP_MAP[appId];
    items.push({
      fileId,
      steamUrl: `https://steamcommunity.com/sharedfiles/filedetails/?id=${fileId}`,
      imageUrl,
      appId,
      game: mapped?.game || `App ${appId}`,
      gameId: mapped?.gameId || `app${appId}`
    });
  }

  return items;
}

async function enrichFromFileDetails(item) {
  try {
    const html = await fetchText(item.steamUrl);
    const appMatch = html.match(/steamcommunity\.com\/app\/(\d+)/i);
    if (appMatch) item.appId = Number(appMatch[1]);
    const titleMatch = html.match(/class="apphub_AppName"[^>]*>([^<]+)/i);
    if (titleMatch) item.game = titleMatch[1].trim();
    const imgMatch = html.match(
      /(https?:\/\/[^"'\s]*steamuserimages[^"'\s]+\.(?:jpg|jpeg|png|webp))/i
    );
    if (imgMatch) item.imageUrl = imgMatch[1].replace(/&amp;/g, '&');
  } catch {
    /* keep partial */
  }
  const mapped = APP_MAP[item.appId];
  if (mapped) {
    item.gameId = mapped.gameId;
    item.game = mapped.game;
  } else if (item.appId) {
    item.gameId = `app${item.appId}`;
  }
  return item;
}

async function downloadFile(url, dest) {
  if (await exists(dest)) return false;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok || !res.body) throw new Error(`Download failed ${res.status}: ${url}`);
  await mkdir(path.dirname(dest), { recursive: true });
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
  return true;
}

function toTs(entries) {
  const rows = entries
    .map(
      (e) => `  {
    id: ${JSON.stringify(e.id)},
    filename: ${JSON.stringify(e.filename)},
    game: ${JSON.stringify(e.game)},
    gameId: ${JSON.stringify(e.gameId)},
    appId: ${e.appId},
    date: ${JSON.stringify(e.date)},
    timestamp: ${e.timestamp},
    path: ${JSON.stringify(e.path)},
    thumbnail: ${JSON.stringify(e.thumbnail)},
    steamUrl: ${JSON.stringify(e.steamUrl)}
  }`
    )
    .join(',\n');

  return `// AUTO-GENERATED by scripts/fetch-steam-screenshots.mjs — do not edit by hand

export interface GeneratedScreenshot {
  id: string;
  filename: string;
  game: string;
  gameId: string;
  appId?: number;
  date: string;
  timestamp: number;
  path: string;
  thumbnail: string;
  steamUrl?: string;
}

export const generatedScreenshots: GeneratedScreenshot[] = [
${rows}
];
`;
}

async function main() {
  console.log('Fetching Steam screenshots for Gosloto…');
  const sources = [
    `https://steamcommunity.com/profiles/${STEAM_ID64}/screenshots/?appid=0&sort=newestfirst&browsefilter=myfiles&view=grid`,
    `${PROFILE}/screenshots/?appid=0&sort=newestfirst&browsefilter=myfiles&view=grid`,
    `${PROFILE}/screenshots/`
  ];

  let html = '';
  let items = [];
  for (const url of sources) {
    try {
      console.log('GET', url);
      html = await fetchText(url);
      items = parseScreenshotsFromHtml(html).slice(0, LIMIT);
      if (items.length) break;
    } catch (err) {
      console.warn(String(err.message || err));
    }
  }

  if (items.length === 0) {
    console.error('No screenshots parsed from Steam HTML. Previous snapshot kept.');
    process.exitCode = 1;
    return;
  }

  console.log(`Parsed ${items.length} screenshot refs.`);
  // Light enrich only when game name unknown
  for (const item of items) {
    if (!APP_MAP[item.appId]) {
      await enrichFromFileDetails(item);
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  const written = [];
  for (const item of items) {
    const appKey = item.appId || 'unknown';
    // Steamusercontent ugc URLs often have no extension — store as .jpg
    const extMatch = item.imageUrl.match(/\.(jpe?g|png|webp)(?:$|\?)/i);
    const ext = extMatch ? extMatch[1].replace(/jpeg/i, 'jpg') : 'jpg';
    const filename = `${item.fileId}.${ext}`;
    const rel = `/img/screenshot/steam/${appKey}/${filename}`;
    const abs = path.join(OUT_DIR, String(appKey), filename);
    try {
      const fresh = await downloadFile(item.imageUrl, abs);
      console.log(`${fresh ? '↓' : '='} ${rel}`);
      written.push({
        id: `steam_${item.fileId}`,
        filename,
        game: item.game,
        gameId: item.gameId,
        appId: item.appId || 0,
        date: new Date().toISOString().slice(0, 10),
        timestamp: Date.now(),
        path: rel,
        thumbnail: rel,
        steamUrl: item.steamUrl
      });
    } catch (err) {
      console.warn(`Skip ${item.fileId}: ${err.message}`);
    }
  }

  await mkdir(path.dirname(OUT_TS), { recursive: true });
  await writeFile(OUT_TS, toTs(written), 'utf8');
  console.log(`Wrote ${written.length} entries → ${path.relative(ROOT, OUT_TS)}`);
  console.log(`SteamID64 reference: ${STEAM_ID64}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
