// Cloudflare Worker: Kuwo Music Proxy + Frontend Demo
const KUWO_HOST_PATTERN = /(^|\.)kuwo\.cn$/i;
const SAFE_RESPONSE_HEADERS = [
  "content-type",
  "cache-control",
  "accept-ranges",
  "content-length",
  "content-range",
  "etag",
  "last-modified",
  "expires"
];

function createCorsHeaders(init) {
  const headers = new Headers();
  if (init) {
    for (const [key, value] of init.entries()) {
      if (SAFE_RESPONSE_HEADERS.includes(key.toLowerCase())) {
        headers.set(key, value);
      }
    }
  }
  headers.set("Access-Control-Allow-Origin", "*");
  if (!headers.has("Cache-Control")) {
    headers.set("Cache-Control", "public, max-age=3600");
  }
  return headers;
}

function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Max-Age": "86400"
    }
  });
}

function isAllowedKuwoHost(hostname) {
  return hostname && KUWO_HOST_PATTERN.test(hostname);
}

function normalizeKuwoUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    if (!isAllowedKuwoHost(parsed.hostname)) return null;
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    parsed.protocol = "http:";
    return parsed;
  } catch {
    return null;
  }
}

async function proxyKuwoAudio(targetUrl, request) {
  const normalized = normalizeKuwoUrl(targetUrl);
  if (!normalized) {
    return new Response("Invalid Kuwo URL", { status: 400 });
  }

  const init = {
    method: "GET",
    headers: {
      "User-Agent": request.headers.get("User-Agent") ?? "Mozilla/5.0",
      "Referer": "https://www.kuwo.cn/"
    }
  };

  const rangeHeader = request.headers.get("Range");
  if (rangeHeader) init.headers["Range"] = rangeHeader;

  const upstream = await fetch(normalized.toString(), init);
  const headers = createCorsHeaders(upstream.headers);
  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers
  });
}

function renderHomePage() {
  return new Response(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Kuwo Proxy Test</title>
<style>
  body { font-family: system-ui; display:flex; flex-direction:column; align-items:center; padding:2em; background:#f5f6fa; }
  h1 { color:#2c3e50; }
  input { width:80%; max-width:600px; padding:10px; border-radius:8px; border:1px solid #ccc; }
  button { margin-top:1em; padding:10px 20px; background:#3498db; color:#fff; border:none; border-radius:8px; cursor:pointer; }
  audio { margin-top:2em; width:80%; max-width:600px; }
  footer { margin-top:3em; color:#888; font-size:14px; }
</style>
</head>
<body>
  <h1>🎵 Kuwo Music Proxy Test</h1>
  <input id="urlInput" placeholder="请输入 Kuwo 音频链接，如：https://antiserver.kuwo.cn/anti.s?rid=MUSIC_123456" />
  <button onclick="play()">播放音频</button>
  <audio id="player" controls></audio>
  <footer>Powered by Cloudflare Worker</footer>
  <script>
    function play() {
      const input = document.getElementById('urlInput');
      const player = document.getElementById('player');
      const target = input.value.trim();
      if (!target) return alert('请输入酷我音频 URL');
      player.src = '?target=' + encodeURIComponent(target);
      player.play();
    }
  </script>
</body>
</html>`, {
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}

export default {
  async fetch(request) {
    const { method } = request;
    if (method === "OPTIONS") return handleOptions();
    if (method !== "GET" && method !== "HEAD")
      return new Response("Method not allowed", { status: 405 });

    const url = new URL(request.url);
    const target = url.searchParams.get("target");

    if (target) return proxyKuwoAudio(target, request);
    return renderHomePage();
  }
};
