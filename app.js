const state = {
  lang: localStorage.getItem("okinawa-guide-lang") || "ja",
  category: "all",
  query: "",
  data: null,
  lastDataSignature: ""
};

const i18n = {
  ja: {
    heroEyebrow: "Okinawa travel intelligence",
    heroTitle: "沖縄の今を見つける観光ガイド",
    heroCopy: "海、島、歴史、食、イベント情報を多言語で整理し、更新スクリプトで新しい情報を反映できます。",
    exploreNow: "観光情報を見る",
    automationLink: "自動更新の仕組み",
    searchLabel: "検索",
    filterAll: "すべて",
    filterNature: "自然",
    filterCulture: "文化",
    filterFood: "食",
    filterEvent: "イベント",
    featuredEyebrow: "Featured",
    featuredTitle: "おすすめ観光情報",
    featuredCopy: "定番スポットから季節の話題まで、旅行者が比較しやすい形で表示します。",
    emptyState: "条件に合う観光情報がありません。",
    eventsEyebrow: "Live updates",
    eventsTitle: "新着・イベント",
    eventsCopy: "外部ソースから取得した情報は、確認用リンク付きで表示されます。",
    planEyebrow: "Trip planning",
    planTitle: "旅の組み立て",
    planOneTitle: "初めての沖縄",
    planOneCopy: "那覇、首里、北部の自然を組み合わせ、移動時間に余裕を持たせるルートがおすすめです。",
    planTwoTitle: "離島を楽しむ",
    planTwoCopy: "天候や船・航空便の変更に備え、滞在日程に予備時間を入れて計画します。",
    planThreeTitle: "文化を深く知る",
    planThreeCopy: "史跡、工芸、音楽、食文化をつなげると、沖縄らしさを立体的に体験できます。",
    automationEyebrow: "Automation",
    automationTitle: "自動収集と更新",
    automationCopy: "更新スクリプトが観光関連ソースを巡回し、重複を避けてデータJSONを更新します。GitHub Actionsで毎日実行できます。",
    sourceTitle: "データ状態",
    lastUpdated: "最終更新",
    sourceCount: "登録ソース",
    autoCollectStatus: "自動収集",
    collectNow: "今すぐ収集",
    collecting: "収集中",
    collectUnavailable: "ローカル自動収集サーバ未使用",
    footerText: "掲載内容は公式情報の確認リンクと合わせてご利用ください。",
    legalLink: "免責・著作権・削除依頼",
    details: "詳細を見る",
    source: "情報源"
  },
  en: {
    heroEyebrow: "Okinawa travel intelligence",
    heroTitle: "A live travel guide to Okinawa",
    heroCopy: "Beaches, islands, history, food, and events organized in four languages with a refresh script for new information.",
    exploreNow: "Explore",
    automationLink: "Automation",
    searchLabel: "Search",
    filterAll: "All",
    filterNature: "Nature",
    filterCulture: "Culture",
    filterFood: "Food",
    filterEvent: "Events",
    featuredEyebrow: "Featured",
    featuredTitle: "Recommended travel ideas",
    featuredCopy: "Classic sights and seasonal updates are structured for easy comparison.",
    emptyState: "No travel information matches your filters.",
    eventsEyebrow: "Live updates",
    eventsTitle: "News and events",
    eventsCopy: "Collected items include source links for confirmation.",
    planEyebrow: "Trip planning",
    planTitle: "Build your itinerary",
    planOneTitle: "First Okinawa trip",
    planOneCopy: "Combine Naha, Shuri, and northern nature with enough time between stops.",
    planTwoTitle: "Enjoy outer islands",
    planTwoCopy: "Add buffer time in case weather affects ferries or flights.",
    planThreeTitle: "Go deeper into culture",
    planThreeCopy: "Connect historic sites, crafts, music, and food to understand Okinawa more fully.",
    automationEyebrow: "Automation",
    automationTitle: "Automatic collection and updates",
    automationCopy: "The update script checks tourism sources, avoids duplicates, and refreshes the JSON data. GitHub Actions can run it daily.",
    sourceTitle: "Data status",
    lastUpdated: "Last updated",
    sourceCount: "Sources",
    autoCollectStatus: "Auto collection",
    collectNow: "Collect now",
    collecting: "Collecting",
    collectUnavailable: "Local auto-collection server is not active",
    footerText: "Use listed source links to confirm official details.",
    legalLink: "Legal notice and takedown requests",
    details: "View details",
    source: "Source"
  },
  zh: {
    heroEyebrow: "Okinawa travel intelligence",
    heroTitle: "探索冲绳当下的旅行指南",
    heroCopy: "以四种语言整理海滩、离岛、历史、美食和活动信息，并可通过更新脚本反映新内容。",
    exploreNow: "查看景点",
    automationLink: "自动更新",
    searchLabel: "搜索",
    filterAll: "全部",
    filterNature: "自然",
    filterCulture: "文化",
    filterFood: "美食",
    filterEvent: "活动",
    featuredEyebrow: "Featured",
    featuredTitle: "推荐观光信息",
    featuredCopy: "从经典景点到季节话题，信息以便于比较的方式呈现。",
    emptyState: "没有符合条件的观光信息。",
    eventsEyebrow: "Live updates",
    eventsTitle: "最新消息与活动",
    eventsCopy: "从外部来源取得的信息会附上确认链接。",
    planEyebrow: "Trip planning",
    planTitle: "规划行程",
    planOneTitle: "第一次到冲绳",
    planOneCopy: "建议组合那霸、首里和北部自然景点，并预留充足移动时间。",
    planTwoTitle: "享受离岛",
    planTwoCopy: "考虑天气、船班和航班变化，在行程中加入缓冲时间。",
    planThreeTitle: "深入了解文化",
    planThreeCopy: "把史迹、工艺、音乐和饮食文化串联起来，能更立体地体验冲绳。",
    automationEyebrow: "Automation",
    automationTitle: "自动收集与更新",
    automationCopy: "更新脚本会巡回观光来源，避免重复并更新数据JSON。也可使用 GitHub Actions 每日执行。",
    sourceTitle: "数据状态",
    lastUpdated: "最后更新",
    sourceCount: "来源数量",
    autoCollectStatus: "自动收集",
    collectNow: "立即收集",
    collecting: "收集中",
    collectUnavailable: "本地自动收集服务器未启用",
    footerText: "请同时参考官方确认链接使用掲載内容。",
    legalLink: "免责声明、版权与删除请求",
    details: "查看详情",
    source: "来源"
  },
  ko: {
    heroEyebrow: "Okinawa travel intelligence",
    heroTitle: "오키나와의 지금을 만나는 여행 가이드",
    heroCopy: "바다, 섬, 역사, 음식, 이벤트 정보를 네 가지 언어로 정리하고 업데이트 스크립트로 새 정보를 반영합니다.",
    exploreNow: "관광 정보 보기",
    automationLink: "자동 업데이트",
    searchLabel: "검색",
    filterAll: "전체",
    filterNature: "자연",
    filterCulture: "문화",
    filterFood: "음식",
    filterEvent: "이벤트",
    featuredEyebrow: "Featured",
    featuredTitle: "추천 관광 정보",
    featuredCopy: "대표 명소부터 계절 소식까지 여행자가 비교하기 쉽게 보여줍니다.",
    emptyState: "조건에 맞는 관광 정보가 없습니다.",
    eventsEyebrow: "Live updates",
    eventsTitle: "새 소식과 이벤트",
    eventsCopy: "외부 소스에서 수집한 정보는 확인 링크와 함께 표시됩니다.",
    planEyebrow: "Trip planning",
    planTitle: "여행 구성",
    planOneTitle: "첫 오키나와 여행",
    planOneCopy: "나하, 슈리, 북부 자연을 조합하고 이동 시간에 여유를 두는 코스를 추천합니다.",
    planTwoTitle: "외딴섬 즐기기",
    planTwoCopy: "날씨와 선박, 항공편 변경에 대비해 일정에 여유 시간을 넣어 계획합니다.",
    planThreeTitle: "문화를 깊이 알기",
    planThreeCopy: "사적, 공예, 음악, 식문화를 연결하면 오키나와다움을 입체적으로 경험할 수 있습니다.",
    automationEyebrow: "Automation",
    automationTitle: "자동 수집과 업데이트",
    automationCopy: "업데이트 스크립트가 관광 관련 소스를 확인하고 중복을 피하며 데이터 JSON을 갱신합니다. GitHub Actions로 매일 실행할 수 있습니다.",
    sourceTitle: "데이터 상태",
    lastUpdated: "최종 업데이트",
    sourceCount: "등록 소스",
    autoCollectStatus: "자동 수집",
    collectNow: "지금 수집",
    collecting: "수집 중",
    collectUnavailable: "로컬 자동 수집 서버가 활성화되지 않았습니다",
    footerText: "게재 내용은 공식 확인 링크와 함께 이용해 주세요.",
    legalLink: "면책, 저작권, 삭제 요청",
    details: "자세히 보기",
    source: "정보 출처"
  }
};

const categoryLabels = {
  nature: { ja: "自然", en: "Nature", zh: "自然", ko: "자연" },
  culture: { ja: "文化", en: "Culture", zh: "文化", ko: "문화" },
  food: { ja: "食", en: "Food", zh: "美食", ko: "음식" },
  event: { ja: "イベント", en: "Event", zh: "活动", ko: "이벤트" }
};

const text = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[state.lang] || value.ja || value.en || "";
};

const setLanguage = (lang) => {
  state.lang = lang;
  localStorage.setItem("okinawa-guide-lang", lang);
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = i18n[lang][node.dataset.i18n] || node.textContent;
  });
  document.querySelectorAll(".lang-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.lang === lang);
  });
  render();
};

const normalize = (value) => value.toLowerCase().trim();

const matchesItem = (item) => {
  const categoryMatches = state.category === "all" || item.category === state.category;
  const query = normalize(state.query);
  if (!query) return categoryMatches;

  const searchable = [
    text(item.title),
    text(item.summary),
    item.area,
    item.tags?.join(" ")
  ].join(" ").toLowerCase();

  return categoryMatches && searchable.includes(query);
};

const renderCards = () => {
  const grid = document.getElementById("cardGrid");
  const emptyState = document.getElementById("emptyState");
  const items = (state.data?.places || []).filter(matchesItem);

  grid.innerHTML = items.map((item) => `
    <article class="place-card">
      <img src="${item.image}" alt="${text(item.title)}" loading="lazy" />
      <div class="place-card-content">
        <div class="meta-row">
          <span class="tag">${categoryLabels[item.category]?.[state.lang] || item.category}</span>
          <span class="tag">${item.area}</span>
        </div>
        <h3>${text(item.title)}</h3>
        <p>${text(item.summary)}</p>
        <a class="card-link" href="${item.url}" target="_blank" rel="noopener">${i18n[state.lang].details}</a>
      </div>
    </article>
  `).join("");

  emptyState.classList.toggle("hidden", items.length > 0);
};

const renderUpdates = () => {
  const list = document.getElementById("updatesList");
  const updates = state.data?.updates || [];

  list.innerHTML = updates.slice(0, 8).map((item) => `
    <article class="update-item">
      <div>
        <p class="update-date">${item.date || ""} · ${text(item.sourceName) || i18n[state.lang].source}</p>
        <h3>${text(item.title)}</h3>
        <p>${text(item.summary)}</p>
      </div>
      <a class="update-link" href="${item.url}" target="_blank" rel="noopener">${i18n[state.lang].details}</a>
    </article>
  `).join("");
};

const renderStatus = () => {
  document.getElementById("lastUpdated").textContent = state.data?.meta?.updatedAt || "-";
  document.getElementById("sourceCount").textContent = String(state.data?.meta?.sourceCount || 0);
};

const renderCollectStatus = (status) => {
  const node = document.getElementById("collectStatus");
  const button = document.getElementById("collectNowButton");
  if (!node || !button) return;

  if (!status) {
    node.textContent = i18n[state.lang].collectUnavailable;
    button.classList.add("hidden");
    return;
  }

  button.classList.remove("hidden");
  button.disabled = status.running;
  node.textContent = status.running
    ? i18n[state.lang].collecting
    : `${i18n[state.lang].autoCollectStatus}: ${status.lastFinishedAt || status.message}`;
};

const render = () => {
  if (!state.data) return;
  renderCards();
  renderUpdates();
  renderStatus();
};

const setupEvents = () => {
  document.querySelectorAll(".lang-button").forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.lang));
  });

  document.querySelectorAll(".filter-button").forEach((button) => {
    button.addEventListener("click", () => {
      state.category = button.dataset.category;
      document.querySelectorAll(".filter-button").forEach((node) => {
        node.classList.toggle("active", node === button);
      });
      renderCards();
    });
  });

  document.getElementById("searchInput").addEventListener("input", (event) => {
    state.query = event.target.value;
    renderCards();
  });

  document.getElementById("collectNowButton").addEventListener("click", async () => {
    const button = document.getElementById("collectNowButton");
    button.disabled = true;
    renderCollectStatus({ running: true });
    try {
      const response = await fetch("./__collect-now", { cache: "no-store" });
      const status = await response.json();
      renderCollectStatus(status);
      await refreshData();
    } catch {
      renderCollectStatus(null);
    } finally {
      button.disabled = false;
    }
  });
};

const loadData = async () => {
  const response = await fetch("./data/tourism.json", { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to load tourism data");
  const data = await response.json();
  const signature = JSON.stringify(data.meta || {}) + String(data.updates?.[0]?.id || "");
  const changed = signature !== state.lastDataSignature;
  state.data = data;
  state.lastDataSignature = signature;
  return changed;
};

const refreshData = async () => {
  try {
    const changed = await loadData();
    if (changed) render();
  } catch (error) {
    console.warn(error);
  }
};

const refreshCollectStatus = async () => {
  try {
    const response = await fetch("./__collect-status", { cache: "no-store" });
    if (!response.ok) throw new Error("Collector status unavailable");
    renderCollectStatus(await response.json());
  } catch {
    renderCollectStatus(null);
  }
};

setupEvents();
await loadData();
setLanguage(state.lang);
await refreshCollectStatus();
setInterval(refreshData, 5 * 60 * 1000);
setInterval(refreshCollectStatus, 60 * 1000);
