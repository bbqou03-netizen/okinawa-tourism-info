import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataPath = path.join(root, "data", "tourism.json");
const sourcePath = path.join(root, "config", "sources.json");
const maxItemsPerSource = 6;
const userAgent = "OkinawaGuideBot/1.0 (+local tourism data updater)";
const today = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" }).format(new Date());

const stripTags = (value = "") =>
  value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&ccedil;/g, "ç")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/\s+/g, " ")
    .trim();

const absoluteUrl = (href, base) => {
  try {
    const url = new URL(href, base);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    return url.href;
  } catch {
    return null;
  }
};

const isSameOrigin = (candidateUrl, sourceUrl) => {
  try {
    return new URL(candidateUrl).origin === new URL(sourceUrl).origin;
  } catch {
    return false;
  }
};

const normalizePath = (url) => {
  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return "/";
  }
};

const parseRobotsRules = (text) => {
  const groups = [];
  let current = null;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*/, "").trim();
    if (!line) {
      current = null;
      continue;
    }

    const [keyPart, ...valueParts] = line.split(":");
    const key = keyPart?.trim().toLowerCase();
    const value = valueParts.join(":").trim();
    if (!key) continue;

    if (key === "user-agent") {
      if (!current || current.rules.length) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      continue;
    }

    if ((key === "allow" || key === "disallow") && current) {
      current.rules.push({ type: key, path: value });
    }
  }

  return groups;
};

const robotPatternMatches = (pattern, targetPath) => {
  if (!pattern) return false;
  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*")
    .replace(/\\\$/g, "$");
  return new RegExp(`^${escaped}`).test(targetPath);
};

const buildRobotsChecker = async (source) => {
  if (source.respectRobotsTxt === false) return () => true;

  const robotsUrl = new URL("/robots.txt", source.url).href;
  try {
    const response = await fetch(robotsUrl, { headers: { "user-agent": userAgent } });
    if (!response.ok) {
      console.warn(`Robots unavailable for ${source.name}: ${response.status}`);
      return () => true;
    }

    const rules = parseRobotsRules(await response.text());
    const agentName = userAgent.toLowerCase().split("/")[0];
    const groups = rules.filter((group) =>
      group.agents.some((agent) => agent === "*" || agentName.includes(agent) || agent.includes(agentName))
    );
    const activeRules = groups.length ? groups.flatMap((group) => group.rules) : [];

    return (candidateUrl) => {
      const targetPath = normalizePath(candidateUrl);
      const matches = activeRules
        .filter((rule) => robotPatternMatches(rule.path, targetPath))
        .sort((a, b) => b.path.length - a.path.length);

      if (!matches.length) return true;
      return matches[0].type === "allow";
    };
  } catch (error) {
    console.warn(`Robots check skipped for ${source.name}: ${error.message}`);
    return () => true;
  }
};

const multilingual = (value, sourceLanguage) => ({
  ja: sourceLanguage === "ja" ? value : value,
  en: sourceLanguage === "en" ? value : value,
  zh: value,
  ko: value
});

const sourceSummary = (sourceName) => ({
  ja: `${sourceName}から収集した観光関連リンクです。公式ページで詳細を確認してください。`,
  en: `A tourism-related link collected from ${sourceName}. Check the official page for details.`,
  zh: `从 ${sourceName} 收集的观光相关链接。请在官方页面确认详细信息。`,
  ko: `${sourceName}에서 수집한 관광 관련 링크입니다. 공식 페이지에서 자세한 내용을 확인해 주세요.`
});

const itemId = (url) =>
  url
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90);

const isTourismLike = (text) => {
  const keywords = [
    "okinawa",
    "tour",
    "travel",
    "event",
    "festival",
    "beach",
    "island",
    "沖縄",
    "観光",
    "イベント",
    "祭",
    "海",
    "島",
    "那覇"
  ];
  const lower = text.toLowerCase();
  return keywords.some((keyword) => lower.includes(keyword.toLowerCase()));
};

const shouldSkipLink = (title, url) => {
  const lowerTitle = title.toLowerCase();
  const lowerUrl = url.toLowerCase();
  const blockedTitles = [
    "advertise",
    "cookie",
    "privacy",
    "terms",
    "tenant",
    "テナント",
    "広告",
    "プライバシー",
    "サイトマップ",
    "お問い合わせ",
    "詳細はこちら"
  ];
  const blockedUrls = [
    "/advertise",
    "/privacy",
    "/terms",
    "/contact",
    "/sitemap",
    "/fr/",
    "/th/",
    "/zh-hant/",
    "/ru/",
    "/de/"
  ];
  const languageTitles = [
    "english",
    "français",
    "繁體中文",
    "русский",
    "deutsch",
    "ภาษาไทย"
  ];

  return blockedTitles.some((word) => lowerTitle.includes(word.toLowerCase())) ||
    blockedUrls.some((word) => lowerUrl.includes(word)) ||
    languageTitles.includes(lowerTitle);
};

const classifyCategory = (text) => {
  const lower = text.toLowerCase();
  if (/(event|festival|イベント|祭|行事)/i.test(lower)) return "event";
  if (/(food|restaurant|cafe|gourmet|食|料理|グルメ)/i.test(lower)) return "food";
  if (/(history|heritage|culture|歴史|文化|世界遺産|伝統)/i.test(lower)) return "culture";
  return "nature";
};

const isValidUpdate = (item) => {
  const title = typeof item.title === "object" ? item.title.ja || item.title.en || "" : item.title || "";
  return Boolean(item.url && absoluteUrl(item.url, item.url) && title && !shouldSkipLink(title, item.url));
};

const parseFeed = (xml, source) => {
  const chunks = [...xml.matchAll(/<(item|entry)\b[\s\S]*?<\/\1>/gi)].map((match) => match[0]);

  return chunks.slice(0, maxItemsPerSource).map((chunk) => {
    const title = stripTags(chunk.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "");
    const summary = stripTags(
      chunk.match(/<description[^>]*>([\s\S]*?)<\/description>/i)?.[1] ||
      chunk.match(/<summary[^>]*>([\s\S]*?)<\/summary>/i)?.[1] ||
      title
    );
    const link =
      chunk.match(/<link[^>]*href=["']([^"']+)["'][^>]*>/i)?.[1] ||
      stripTags(chunk.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1] || "");
    const date = stripTags(
      chunk.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i)?.[1] ||
      chunk.match(/<updated[^>]*>([\s\S]*?)<\/updated>/i)?.[1] ||
      chunk.match(/<published[^>]*>([\s\S]*?)<\/published>/i)?.[1] ||
      new Date().toISOString()
    );
    const url = absoluteUrl(link, source.url);

    if (!title || !url || !isSameOrigin(url, source.url) || !source.isAllowedByRobots(url) || !isTourismLike(`${title} ${summary}`)) return null;

    return {
      id: itemId(url),
      category: classifyCategory(`${title} ${summary} ${url}`),
      date: new Date(date).toISOString().slice(0, 10),
      sourceName: multilingual(source.name, source.language),
      title: multilingual(title, source.language),
      summary: summary ? multilingual(summary.slice(0, 180), source.language) : sourceSummary(source.name),
      url
    };
  }).filter(Boolean);
};

const parseHtml = (html, source) => {
  const links = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
  const seen = new Set();

  return links
    .map((match) => {
      const url = absoluteUrl(match[1], source.url);
      const title = stripTags(match[2]);
      if (!url || !title || title.length < 4 || seen.has(url) || !isSameOrigin(url, source.url)) return null;
      seen.add(url);
      if (!source.isAllowedByRobots(url)) return null;
      if (shouldSkipLink(title, url)) return null;
      if (!isTourismLike(`${title} ${url}`)) return null;

      return {
        id: itemId(url),
        category: classifyCategory(`${title} ${url}`),
        date: today(),
        sourceName: multilingual(source.name, source.language),
        title: multilingual(title.slice(0, 120), source.language),
        summary: sourceSummary(source.name),
        url
      };
    })
    .filter(Boolean)
    .slice(0, maxItemsPerSource);
};

const fetchSource = async (source) => {
  const isAllowedByRobots = await buildRobotsChecker(source);
  if (!isAllowedByRobots(source.url)) {
    throw new Error(`${source.name}: blocked by robots.txt`);
  }

  const response = await fetch(source.url, {
    headers: {
      "user-agent": userAgent
    }
  });
  if (!response.ok) throw new Error(`${source.name}: ${response.status}`);

  const body = await response.text();
  const sourceWithRobots = { ...source, isAllowedByRobots };
  if (source.type === "rss" || source.type === "atom") return parseFeed(body, sourceWithRobots);
  return parseHtml(body, sourceWithRobots);
};

const main = async () => {
  const [tourismData, sources] = await Promise.all([
    fs.readFile(dataPath, "utf8").then(JSON.parse),
    fs.readFile(sourcePath, "utf8").then(JSON.parse)
  ]);

  const collected = [];
  for (const source of sources) {
    try {
      collected.push(...await fetchSource(source));
      console.log(`Collected ${source.name}`);
    } catch (error) {
      console.warn(`Skipped ${source.name}: ${error.message}`);
    }
  }

  const merged = new Map();
  for (const item of [...collected, ...(tourismData.updates || [])].filter(isValidUpdate)) {
    merged.set(item.url, item);
  }

  tourismData.meta = {
    updatedAt: today(),
    sourceCount: sources.length
  };
  tourismData.updates = [...merged.values()]
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .slice(0, 30);

  await fs.writeFile(dataPath, `${JSON.stringify(tourismData, null, 2)}\n`);
  console.log(`Updated ${dataPath} with ${tourismData.updates.length} update items.`);
};

await main();
