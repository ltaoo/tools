const chapterEditor = document.querySelector("#chapterEditor");
const fileInput = document.querySelector("#fileInput");
const fileName = document.querySelector("#fileName");
const totalWordCount = document.querySelector("#totalWordCount");
const statusText = document.querySelector("#statusText");
const chapterCount = document.querySelector("#chapterCount");
const tocList = document.querySelector("#tocList");
const tocSearch = document.querySelector("#tocSearch");
const parseButton = document.querySelector("#parseButton");
const saveButton = document.querySelector("#saveButton");
const exportButton = document.querySelector("#exportButton");
const rulesButton = document.querySelector("#rulesButton");
const currentChapterTitle = document.querySelector("#currentChapterTitle");
const currentChapterRange = document.querySelector("#currentChapterRange");
const viewSourceButton = document.querySelector("#viewSourceButton");
const dropOverlay = document.querySelector("#dropOverlay");
const sourceDialog = document.querySelector("#sourceDialog");
const closeSourceButton = document.querySelector("#closeSourceButton");
const sourceDialogTitle = document.querySelector("#sourceDialogTitle");
const sourceDialogRange = document.querySelector("#sourceDialogRange");
const sourceViewer = document.querySelector("#sourceViewer");
const rulesDialog = document.querySelector("#rulesDialog");
const closeRulesButton = document.querySelector("#closeRulesButton");
const rulesList = document.querySelector("#rulesList");
const ruleNameInput = document.querySelector("#ruleNameInput");
const ruleTypeInput = document.querySelector("#ruleTypeInput");
const ruleLevelInput = document.querySelector("#ruleLevelInput");
const rulePatternInput = document.querySelector("#rulePatternInput");
const ruleBlankInput = document.querySelector("#ruleBlankInput");
const addRuleButton = document.querySelector("#addRuleButton");
const ruleError = document.querySelector("#ruleError");

const STORAGE_KEY = "txt-chapter-editor-state";
const RULES_STORAGE_KEY = "txt-chapter-editor-heading-rules";
const TEXT_HEAD_BYTES = 65536;
const legacyEncodingCandidates = [
  { name: "GBK", label: "gbk", minScore: 0.5 },
  { name: "GB18030", label: "gb18030", minScore: 0.5 },
  { name: "Big5", label: "big5", minScore: 0.3 },
];
const cnNumberToken =
  "零〇○一二两三四五六七八九十百千万萬亿億壹贰貳叁參肆伍陆陸柒捌玖拾佰仟";
const numberToken = `[0-9０-９]+|[${cnNumberToken}]+`;
const headingTail = `[\\s:：、.．·-]*[^\\n\\r]{0,80}`;
const headingRules = [
  {
    id: "volume-cn-en",
    name: "卷标题",
    level: 1,
    type: "卷",
    description: "第 N 卷、卷 N、Volume N、Book N",
    pattern: new RegExp(
      `^\\s*((?:第\\s*(?:${numberToken})\\s*卷|卷\\s*(?:${numberToken})|(?:volume|vol|book)\\s*(?:${numberToken}))${headingTail})\\s*$`,
      "i",
    ),
  },
  {
    id: "chapter-cn-en",
    name: "章节标题",
    level: 2,
    type: "章",
    description: "第 N 章、第 N 回、第 N 部、第 N 篇、Chapter N",
    pattern: new RegExp(
      `^\\s*((?:第\\s*(?:${numberToken})\\s*[章回部篇]|(?:chapter|chap)\\s*(?:${numberToken}))${headingTail})\\s*$`,
      "i",
    ),
  },
  {
    id: "section-cn-en",
    name: "小节标题",
    level: 3,
    type: "节",
    description: "第 N 节、节 N、Section N",
    pattern: new RegExp(
      `^\\s*((?:第\\s*(?:${numberToken})\\s*节|节\\s*(?:${numberToken})|section\\s*(?:${numberToken}))${headingTail})\\s*$`,
      "i",
    ),
  },
  {
    id: "numeric-list",
    name: "数字序号标题",
    level: 2,
    type: "章",
    description: "1. 标题、01、标题、１２. 标题",
    pattern: /^\s*((?:[0-9０-９]{1,5})[.、]\s*[^\n\r]{0,80})\s*$/,
  },
  {
    id: "cn-number-space",
    name: "中文数字空格标题",
    level: 2,
    type: "章",
    description: "一 标题、十 标题，要求前后为空行",
    requiresBlankAround: true,
    pattern: new RegExp(
      `^\\s*(([${cnNumberToken}]{1,8})\\s+[^\\s\\n\\r][^\\n\\r]{0,80})\\s*$`,
    ),
  },
];

let chapters = [];
let activeChapterIndex = -1;
let suppressChapterEdit = false;
let suppressTitleEdit = false;
let chapterParseTimer = 0;
let pendingActiveStart = null;
let fullText = "";
let gbkEncodeMap = null;
let customHeadingRules = loadCustomHeadingRules();
let compiledCustomHeadingRules = customHeadingRules
  .map(compileCustomHeadingRule)
  .filter(Boolean);

function parseChapters(text) {
  const matches = [];
  let start = 0;
  let lineNumber = 1;

  while (start < text.length) {
    let end = start;
    while (end < text.length && text[end] !== "\n" && text[end] !== "\r") {
      end += 1;
    }

    const line = text.slice(start, end).trim();
    if (line) {
      const heading = detectHeading(line, {
        hasBlankAround:
          isPreviousLineBlank(text, start) && isNextLineBlank(text, end),
      });
      if (heading) {
        matches.push({
          title: heading.title,
          level: heading.level,
          type: heading.type,
          parentIndex: findParentIndex(matches, heading.level),
          start,
          contentStart: getNextLineStart(text, end),
          line: lineNumber,
        });
      }
    }

    if (end >= text.length) break;
    start = text[end] === "\r" && text[end + 1] === "\n" ? end + 2 : end + 1;
    lineNumber += 1;
  }

  if (matches.length === 0 && text.trim()) {
    return [
      {
        title: "全文",
        level: 1,
        displayLevel: 1,
        type: "全文",
        parentIndex: -1,
        start: 0,
        contentStart: 0,
        end: text.length,
        line: 1,
      },
    ];
  }

  const displayLevelByLevel = buildDisplayLevelMap(matches);
  return matches.map((chapter, index) => ({
    ...chapter,
    displayLevel: displayLevelByLevel.get(chapter.level) ?? chapter.level,
    end: findHeadingEnd(matches, index, text.length),
  }));
}

function detectHeading(line, context = {}) {
  if (line.length > 100) return null;

  for (const rule of getActiveHeadingRules()) {
    if (rule.requiresBlankAround && !context.hasBlankAround) continue;

    const match = line.match(rule.pattern);
    if (match) {
      const title = match[1] || match[0];
      return {
        title: title.replace(/\s+/g, " ").trim(),
        level: rule.level,
        type: rule.type,
      };
    }
  }

  return null;
}

function getActiveHeadingRules() {
  return [...headingRules, ...compiledCustomHeadingRules];
}

function compileCustomHeadingRule(rule) {
  try {
    return {
      ...rule,
      pattern: new RegExp(rule.pattern, rule.flags || ""),
    };
  } catch {
    return null;
  }
}

function loadCustomHeadingRules() {
  const raw = localStorage.getItem(RULES_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isStoredHeadingRule);
  } catch {
    return [];
  }
}

function isStoredHeadingRule(rule) {
  return (
    rule &&
    typeof rule.id === "string" &&
    typeof rule.name === "string" &&
    typeof rule.type === "string" &&
    typeof rule.pattern === "string" &&
    Number.isInteger(rule.level) &&
    rule.level >= 1 &&
    rule.level <= 6
  );
}

function saveCustomHeadingRules() {
  compiledCustomHeadingRules = customHeadingRules
    .map(compileCustomHeadingRule)
    .filter(Boolean);
  localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(customHeadingRules));
}

function openRulesDialog() {
  renderRulesDialog();
  ruleError.textContent = "";
  if (typeof rulesDialog.showModal === "function") {
    rulesDialog.showModal();
    return;
  }
  rulesDialog.setAttribute("open", "");
}

function closeRulesDialog() {
  if (typeof rulesDialog.close === "function") {
    rulesDialog.close();
    return;
  }
  rulesDialog.removeAttribute("open");
}

function renderRulesDialog() {
  const builtInItems = headingRules.map((rule) => ({
    ...rule,
    source: "内置",
    patternText: rule.pattern.source,
  }));
  const customItems = customHeadingRules.map((rule) => ({
    ...rule,
    source: "手动",
    patternText: rule.pattern,
  }));

  rulesList.innerHTML = "";
  [...builtInItems, ...customItems].forEach((rule) => {
    const item = document.createElement("div");
    item.className = "rule-item";
    item.innerHTML = `
      <div class="rule-main">
        <strong>${escapeHtml(rule.name || rule.type)}</strong>
        <span>${escapeHtml(rule.description || rule.patternText)}</span>
        <code>${escapeHtml(rule.patternText)}</code>
      </div>
      <div class="rule-meta">
        <span>${escapeHtml(rule.source)}</span>
        <span>${escapeHtml(rule.type)} · L${rule.level}</span>
        ${rule.requiresBlankAround ? "<span>前后空行</span>" : ""}
      </div>
    `;

    if (rule.source === "手动") {
      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "rule-delete";
      deleteButton.textContent = "删除";
      deleteButton.addEventListener("click", () =>
        removeCustomHeadingRule(rule.id),
      );
      item.appendChild(deleteButton);
    }

    rulesList.appendChild(item);
  });
}

function addCustomHeadingRule() {
  const name = ruleNameInput.value.trim();
  const type = ruleTypeInput.value.trim();
  const level = Number(ruleLevelInput.value);
  const pattern = rulePatternInput.value.trim();
  const requiresBlankAround = ruleBlankInput.checked;

  ruleError.textContent = "";
  if (!name || !type || !pattern) {
    ruleError.textContent = "请填写规则名称、类型和正则表达式。";
    return;
  }
  if (!Number.isInteger(level) || level < 1 || level > 6) {
    ruleError.textContent = "层级必须是 1 到 6。";
    return;
  }

  let regex = null;
  try {
    regex = new RegExp(pattern);
  } catch (error) {
    ruleError.textContent = `正则表达式无效：${error.message}`;
    return;
  }

  customHeadingRules.push({
    id: `custom-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name,
    level,
    type,
    pattern,
    requiresBlankAround,
  });
  saveCustomHeadingRules();
  renderRulesDialog();
  reparse({ keepSelection: true });
  ruleNameInput.value = "";
  rulePatternInput.value = "";
  ruleBlankInput.checked = false;
  setStatus("标题规则已添加并重新解析");
}

function removeCustomHeadingRule(id) {
  customHeadingRules = customHeadingRules.filter((rule) => rule.id !== id);
  saveCustomHeadingRules();
  renderRulesDialog();
  reparse({ keepSelection: true });
  setStatus("标题规则已删除并重新解析");
}

function isPreviousLineBlank(text, lineStart) {
  if (lineStart <= 0) return true;

  let previousEnd = lineStart - 1;
  if (text[previousEnd] === "\n" && text[previousEnd - 1] === "\r") {
    previousEnd -= 1;
  }

  let previousStart = previousEnd - 1;
  while (
    previousStart >= 0 &&
    text[previousStart] !== "\n" &&
    text[previousStart] !== "\r"
  ) {
    previousStart -= 1;
  }

  return text.slice(previousStart + 1, previousEnd).trim() === "";
}

function isNextLineBlank(text, lineEnd) {
  if (lineEnd >= text.length) return true;

  const nextStart = getNextLineStart(text, lineEnd);
  if (nextStart >= text.length) return true;

  let nextEnd = nextStart;
  while (
    nextEnd < text.length &&
    text[nextEnd] !== "\n" &&
    text[nextEnd] !== "\r"
  ) {
    nextEnd += 1;
  }

  return text.slice(nextStart, nextEnd).trim() === "";
}

function findParentIndex(items, level) {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (items[index].level < level) return index;
  }
  return -1;
}

function findHeadingEnd(items, index, textLength) {
  const current = items[index];
  for (let nextIndex = index + 1; nextIndex < items.length; nextIndex += 1) {
    if (items[nextIndex].level <= current.level) {
      return items[nextIndex].start;
    }
  }
  return textLength;
}

function getNextLineStart(text, lineEnd) {
  if (lineEnd >= text.length) return lineEnd;
  return text[lineEnd] === "\r" && text[lineEnd + 1] === "\n"
    ? lineEnd + 2
    : lineEnd + 1;
}

function buildDisplayLevelMap(items) {
  const levels = [...new Set(items.map((item) => item.level))].sort(
    (a, b) => a - b,
  );
  return new Map(levels.map((level, index) => [level, index + 1]));
}

function updateStats() {
  const chars = countWords(fullText);
  const lines = fullText ? fullText.split(/\r\n|\r|\n/).length : 0;
  totalWordCount.textContent = `总字数：${chars.toLocaleString()} 字`;
  return `${chars.toLocaleString()} 字 / ${lines.toLocaleString()} 行`;
}

function countWords(text) {
  return Array.from(text.replace(/\s/g, "")).length;
}

function setStatus(message) {
  statusText.textContent = message;
}

function renderToc() {
  const query = tocSearch.value.trim().toLowerCase();
  const visibleIndexes = getVisibleTocIndexes(query);
  const visibleChapters = visibleIndexes.map((index) => ({
    ...chapters[index],
    index,
  }));

  chapterCount.textContent = `${chapters.length} 项`;

  if (visibleChapters.length === 0) {
    tocList.innerHTML = `<div class="toc-empty">没有匹配目录项。导入 TXT 后会自动解析。</div>`;
    return;
  }

  tocList.innerHTML = "";
  visibleChapters.forEach((chapter) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `toc-item toc-level-${chapter.displayLevel}${chapter.index === activeChapterIndex ? " active" : ""}`;
    button.dataset.index = String(chapter.index);
    button.innerHTML = `
      <span class="toc-title" title="${escapeHtml(chapter.title)}">${escapeHtml(chapter.title)}</span>
      <span class="toc-meta">${chapter.type} · L${chapter.line}</span>
    `;
    tocList.appendChild(button);
  });
}

function getVisibleTocIndexes(query) {
  if (!query) return chapters.map((_, index) => index);

  const visible = new Set();
  chapters.forEach((chapter, index) => {
    if (!chapter.title.toLowerCase().includes(query)) return;

    visible.add(index);
    let parentIndex = chapter.parentIndex;
    while (parentIndex >= 0) {
      visible.add(parentIndex);
      parentIndex = chapters[parentIndex].parentIndex;
    }
  });

  return chapters
    .map((_, index) => index)
    .filter((index) => visible.has(index));
}

function selectChapter(index, shouldFocus = false) {
  if (index < 0 || index >= chapters.length) {
    activeChapterIndex = -1;
    chapterEditor.value = "";
    suppressTitleEdit = true;
    currentChapterTitle.value = "当前章节";
    currentChapterTitle.disabled = true;
    suppressTitleEdit = false;
    currentChapterRange.textContent = "未选择";
    viewSourceButton.disabled = true;
    renderToc();
    return;
  }

  activeChapterIndex = index;
  const chapter = chapters[index];
  suppressChapterEdit = true;
  chapterEditor.value = fullText
    .slice(chapter.contentStart, chapter.end)
    .trimStart();
  suppressChapterEdit = false;
  chapterEditor.scrollTop = 0;
  chapterEditor.setSelectionRange(0, 0);

  suppressTitleEdit = true;
  currentChapterTitle.value = chapter.title;
  currentChapterTitle.disabled = chapter.type === "全文";
  suppressTitleEdit = false;
  currentChapterRange.textContent = formatChapterRange(
    chapter.start,
    chapter.end,
  );
  viewSourceButton.disabled = false;
  if (shouldFocus) {
    chapterEditor.focus();
    chapterEditor.scrollTop = 0;
    chapterEditor.setSelectionRange(0, 0);
  }
  renderToc();
}

function reparse({ keepSelection = true } = {}) {
  const previousTitle = chapters[activeChapterIndex]?.title;
  const previousStart = keepSelection
    ? (pendingActiveStart ?? chapters[activeChapterIndex]?.start)
    : null;
  chapters = parseChapters(fullText);
  pendingActiveStart = null;
  const nextIndex =
    keepSelection && previousTitle
      ? chapters.findIndex((chapter) => chapter.title === previousTitle)
      : -1;
  const nextStartIndex =
    nextIndex >= 0 || previousStart == null
      ? nextIndex
      : chapters.findIndex((chapter) => chapter.start === previousStart);

  const stats = updateStats();
  renderToc();
  selectChapter(
    nextStartIndex >= 0 ? nextStartIndex : chapters.length > 0 ? 0 : -1,
  );
  setStatus(`已解析 ${chapters.length} 个目录项，${stats}`);
}

function replaceActiveChapter(nextChapterText) {
  if (activeChapterIndex < 0) return;

  const chapter = chapters[activeChapterIndex];
  const prefix = fullText.slice(0, chapter.contentStart);
  const suffix = fullText.slice(chapter.end);
  const normalized = normalizeChapterText(nextChapterText, suffix);

  fullText = prefix + normalized + suffix;

  const nextEnd = prefix.length + normalized.length;
  chapters[activeChapterIndex] = {
    ...chapter,
    end: nextEnd,
  };
  updateStats();
  currentChapterRange.textContent = formatChapterRange(chapter.start, nextEnd);
  scheduleChapterParse(chapter.start);
}

function replaceActiveChapterTitle(nextTitle) {
  if (activeChapterIndex < 0) return;

  const chapter = chapters[activeChapterIndex];
  const normalizedTitle = nextTitle.trim();
  if (!normalizedTitle || chapter.type === "全文") return;

  const prefix = fullText.slice(0, chapter.start);
  const suffix = fullText.slice(chapter.contentStart);
  const originalTitleBlock = fullText.slice(
    chapter.start,
    chapter.contentStart,
  );
  const lineBreak = originalTitleBlock.match(/\r\n|\r|\n/)?.[0] ?? "\n";

  fullText = `${prefix}${normalizedTitle}${lineBreak}${suffix}`;
  pendingActiveStart = chapter.start;
  reparse({ keepSelection: true });
  setStatus("章节标题已同步到目录");
}

function scheduleChapterParse(activeStart) {
  pendingActiveStart = activeStart;
  window.clearTimeout(chapterParseTimer);
  chapterParseTimer = window.setTimeout(() => {
    reparse({ keepSelection: true });
  }, 450);
}

function normalizeChapterText(text, suffix) {
  if (!text) return "";
  if (!suffix) return text;
  return /\n$/.test(text) ? text : `${text}\n\n`;
}

function formatChapterRange(start, end) {
  return `位置 ${start.toLocaleString()}-${end.toLocaleString()}`;
}

function openSourceDialog() {
  if (activeChapterIndex < 0) return;

  const chapter = chapters[activeChapterIndex];

  sourceDialogTitle.textContent = chapter.title || "原文";
  sourceViewer.value = fullText;
  const selection = resolveSourceSelection(chapter);
  sourceDialogRange.textContent = formatChapterRange(
    selection.start,
    selection.end,
  );

  sourceDialog.showModal();
  window.requestAnimationFrame(() => {
    sourceViewer.focus();
    sourceViewer.setSelectionRange(selection.start, selection.end);
    scrollSourceViewerToOffset(selection.start);
  });
}

function closeSourceDialog() {
  sourceDialog.close();
}

function scrollSourceViewerToOffset(offset) {
  const style = window.getComputedStyle(sourceViewer);
  const lineHeight = Number.parseFloat(style.lineHeight) || 24;
  const targetTop = measureTextareaOffsetTop(sourceViewer, offset);

  sourceViewer.scrollTop = Math.max(0, targetTop - lineHeight * 2);
}

function measureTextareaOffsetTop(textarea, offset) {
  const style = window.getComputedStyle(textarea);
  const marker = document.createElement("span");
  const mirror = document.createElement("div");
  const mirroredProperties = [
    "borderBottomWidth",
    "borderLeftWidth",
    "borderRightWidth",
    "borderTopWidth",
    "boxSizing",
    "fontFamily",
    "fontSize",
    "fontStyle",
    "fontVariant",
    "fontWeight",
    "letterSpacing",
    "lineHeight",
    "paddingBottom",
    "paddingLeft",
    "paddingRight",
    "paddingTop",
    "tabSize",
    "textIndent",
    "textTransform",
    "wordBreak",
    "wordSpacing",
  ];

  mirroredProperties.forEach((property) => {
    mirror.style[property] = style[property];
  });
  mirror.style.position = "absolute";
  mirror.style.visibility = "hidden";
  mirror.style.left = "-9999px";
  mirror.style.top = "0";
  mirror.style.width = `${textarea.clientWidth}px`;
  mirror.style.minHeight = "0";
  mirror.style.height = "auto";
  mirror.style.overflow = "hidden";
  mirror.style.whiteSpace = "pre-wrap";
  mirror.style.overflowWrap = "break-word";

  marker.textContent = "\u200b";
  mirror.append(
    document.createTextNode(textarea.value.slice(0, offset)),
    marker,
  );
  document.body.appendChild(mirror);
  const top = marker.offsetTop;
  mirror.remove();

  return top;
}

function resolveSourceSelection(chapter) {
  const sourceText = sourceViewer.value;
  const bodyText = normalizeTextareaText(chapterEditor.value).trim();
  const preferredStart = normalizeTextareaText(
    fullText.slice(0, chapter.contentStart),
  ).length;
  const matchedRange = bodyText
    ? findBestSourceMatch(sourceText, bodyText, preferredStart)
    : null;

  if (matchedRange) return matchedRange;

  const start = Math.max(
    0,
    Math.min(
      normalizeTextareaText(fullText.slice(0, chapter.start)).length,
      sourceText.length,
    ),
  );
  const end = Math.max(
    start,
    Math.min(
      normalizeTextareaText(fullText.slice(0, chapter.end)).length,
      sourceText.length,
    ),
  );
  return { start, end };
}

function findBestSourceMatch(sourceText, bodyText, preferredStart) {
  const exactMatches = findAllTextRanges(sourceText, bodyText);
  if (exactMatches.length > 0) {
    return exactMatches.reduce((best, range) =>
      Math.abs(range.start - preferredStart) <
      Math.abs(best.start - preferredStart)
        ? range
        : best,
    );
  }

  const snippet = getSourceSearchSnippet(bodyText);
  if (!snippet) return null;

  const snippetMatches = findAllTextRanges(sourceText, snippet);
  if (snippetMatches.length === 0) return null;

  const bestSnippet = snippetMatches.reduce((best, range) =>
    Math.abs(range.start - preferredStart) <
    Math.abs(best.start - preferredStart)
      ? range
      : best,
  );
  return {
    start: bestSnippet.start,
    end: Math.min(sourceText.length, bestSnippet.start + bodyText.length),
  };
}

function findAllTextRanges(sourceText, needle) {
  const ranges = [];
  let start = 0;

  while (start <= sourceText.length) {
    const index = sourceText.indexOf(needle, start);
    if (index < 0) break;
    ranges.push({ start: index, end: index + needle.length });
    start = index + Math.max(1, needle.length);
  }

  return ranges;
}

function getSourceSearchSnippet(text) {
  return (
    text
      .split("\n")
      .map((line) => line.trim())
      .find((line) => line.length >= 12)
      ?.slice(0, 120) ?? ""
  );
}

function normalizeTextareaText(text) {
  return text.replace(/\r\n?/g, "\n");
}

function loadText(text, name) {
  fullText = text;
  fileName.textContent = name;
  reparse({ keepSelection: false });
}

async function loadFile(file) {
  if (!file) return;

  const isTxt =
    file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt");
  if (!isTxt) {
    setStatus("只支持导入 .txt 文本文件");
    return;
  }

  const { text, encoding, repaired } = await readTextFile(file);
  loadText(text, file.name);
  if (repaired) {
    setStatus(`已导入 ${file.name}，已尝试修复 UTF-8 乱码`);
    return;
  }
  setStatus(
    `已导入 ${file.name}${encoding === "UTF-8" ? "" : `，已从 ${encoding} 转为 UTF-8`}`,
  );
}

async function readTextFile(file) {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const encoding = detectTextEncoding(bytes);
  const text = decodeText(bytes, encoding);
  const repaired = encoding === "UTF-8" ? repairUtf8Mojibake(text) : null;
  if (repaired?.repaired) {
    return { text: repaired.text, encoding, repaired: true };
  }
  return { text, encoding, repaired: false };
}

function detectTextEncoding(bytes) {
  if (bytes.length === 0) return "UTF-8";
  if (hasUtf8Bom(bytes)) return "UTF-8";

  const head = bytes.slice(0, Math.min(bytes.length, TEXT_HEAD_BYTES));
  if (isValidUtf8(trimIncompleteUtf8(head))) return "UTF-8";

  const best = legacyEncodingCandidates
    .map((candidate) => ({
      ...candidate,
      score: scoreDecodedText(bytes, candidate.label),
    }))
    .sort((a, b) => b.score - a.score)[0];

  return best && best.score >= best.minScore ? best.name : "UTF-8";
}

function decodeText(bytes, encoding) {
  const label = getDecoderLabel(encoding);
  const offset = encoding === "UTF-8" && hasUtf8Bom(bytes) ? 3 : 0;
  return new TextDecoder(label).decode(bytes.slice(offset));
}

function repairUtf8Mojibake(text) {
  if (!looksLikeMojibake(text)) return { text, repaired: false };

  let currentText = text;
  let currentScore = scoreReadableChinese(currentText);
  let bestText = currentText;
  let bestScore = currentScore;
  let repaired = false;

  for (let pass = 0; pass < 2; pass += 1) {
    const bytes = encodeStringAsGbkBytes(currentText);
    if (bytes.length === 0) break;

    const nextText = new TextDecoder("utf-8").decode(bytes);
    const nextScore = scoreReadableChinese(nextText);
    currentText = nextText;
    currentScore = nextScore;

    if (nextScore > bestScore) {
      bestText = nextText;
      bestScore = nextScore;
    }
  }

  repaired = bestScore > scoreReadableChinese(text) + 0.08;
  return { text: repaired ? bestText : text, repaired };
}

function looksLikeMojibake(text) {
  const sample = text.slice(0, 200000);
  const replacementCount = (sample.match(/\uFFFD/g) || []).length;
  const mojibakeMarkerCount = (
    sample.match(/[閸閺閳閵鐏鐠鏉娑绱鈧偓锟]/g) || []
  ).length;
  return replacementCount > 5 || mojibakeMarkerCount > 30;
}

function scoreReadableChinese(text) {
  const sample = text.slice(0, 200000);
  const chars = Array.from(sample);
  if (chars.length === 0) return 0;

  const cjkCount = chars.filter((char) => isCjk(char.codePointAt(0))).length;
  const commonChineseCount = chars.filter((char) =>
    "的一是在不了有人和中上小说我他她你这那们到说来去道".includes(char),
  ).length;
  const replacementCount = (sample.match(/\uFFFD/g) || []).length;
  const mojibakeMarkerCount = (
    sample.match(/[閸閺閳閵鐏鐠鏉娑绱鈧偓锟]/g) || []
  ).length;
  const unexpectedCount = chars.filter((char) =>
    isUnexpectedReadableChar(char.codePointAt(0)),
  ).length;

  return (
    cjkCount / chars.length +
    (commonChineseCount / chars.length) * 8 -
    (replacementCount / chars.length) * 4 -
    (mojibakeMarkerCount / chars.length) * 2 -
    (unexpectedCount / chars.length) * 2
  );
}

function encodeStringAsGbkBytes(text) {
  const map = getGbkEncodeMap();
  const bytes = [];

  for (const char of text) {
    const codePoint = char.codePointAt(0);
    if (codePoint <= 0x7f) {
      bytes.push(codePoint);
      continue;
    }

    const encoded = map.get(char);
    if (encoded) {
      bytes.push(...encoded);
    }
  }

  return new Uint8Array(bytes);
}

function getGbkEncodeMap() {
  if (gbkEncodeMap) return gbkEncodeMap;

  const decoder = new TextDecoder("gbk");
  gbkEncodeMap = new Map();
  for (let byte = 0; byte <= 0x7f; byte += 1) {
    gbkEncodeMap.set(String.fromCodePoint(byte), [byte]);
  }
  for (let lead = 0x81; lead <= 0xfe; lead += 1) {
    for (let trail = 0x40; trail <= 0xfe; trail += 1) {
      if (trail === 0x7f) continue;
      const char = decoder.decode(new Uint8Array([lead, trail]));
      if (char && char !== "\uFFFD" && !gbkEncodeMap.has(char)) {
        gbkEncodeMap.set(char, [lead, trail]);
      }
    }
  }

  return gbkEncodeMap;
}

function getDecoderLabel(encoding) {
  if (encoding === "GBK") return "gbk";
  if (encoding === "GB18030") return "gb18030";
  if (encoding === "Big5") return "big5";
  return "utf-8";
}

function hasUtf8Bom(bytes) {
  return (
    bytes.length >= 3 &&
    bytes[0] === 0xef &&
    bytes[1] === 0xbb &&
    bytes[2] === 0xbf
  );
}

function trimIncompleteUtf8(bytes) {
  let trimmed = bytes;
  for (let index = 0; index < 4 && trimmed.length > 0; index += 1) {
    if (isValidUtf8(trimmed)) return trimmed;
    trimmed = trimmed.slice(0, -1);
  }
  return trimmed;
}

function isValidUtf8(bytes) {
  try {
    new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return true;
  } catch {
    return false;
  }
}

function scoreDecodedText(bytes, label) {
  let decoded = "";
  try {
    decoded = new TextDecoder(label).decode(
      bytes.slice(0, Math.min(bytes.length, TEXT_HEAD_BYTES)),
    );
  } catch {
    return 0;
  }

  const chars = Array.from(decoded);
  if (chars.length === 0) return 0;

  const readableScore = scoreReadableChinese(decoded);
  const replacementPenalty =
    (decoded.match(/\uFFFD/g) || []).length / chars.length;
  const controlPenalty =
    chars.filter((char) => isUnexpectedControl(char.codePointAt(0))).length /
    chars.length;
  const headingBonus = parseChapters(decoded).some(
    (chapter) => chapter.type !== "全文",
  )
    ? 0.2
    : 0;
  return (
    readableScore + headingBonus - replacementPenalty * 3 - controlPenalty * 2
  );
}

function isCjk(codePoint) {
  return (
    (codePoint >= 0x4e00 && codePoint <= 0x9fff) ||
    (codePoint >= 0x3400 && codePoint <= 0x4dbf) ||
    (codePoint >= 0xf900 && codePoint <= 0xfaff) ||
    (codePoint >= 0x3000 && codePoint <= 0x303f) ||
    (codePoint >= 0xff00 && codePoint <= 0xffef) ||
    (codePoint >= 0x20000 && codePoint <= 0x2a6df)
  );
}

function isUnexpectedControl(codePoint) {
  return (
    codePoint < 0x20 &&
    codePoint !== 0x09 &&
    codePoint !== 0x0a &&
    codePoint !== 0x0d
  );
}

function isUnexpectedReadableChar(codePoint) {
  return (
    (codePoint >= 0x0370 && codePoint <= 0x03ff) ||
    (codePoint >= 0x0400 && codePoint <= 0x052f) ||
    (codePoint >= 0x0590 && codePoint <= 0x06ff) ||
    (codePoint >= 0x0900 && codePoint <= 0x0dff) ||
    (codePoint >= 0x1100 && codePoint <= 0x11ff) ||
    (codePoint >= 0x3130 && codePoint <= 0x318f) ||
    (codePoint >= 0xac00 && codePoint <= 0xd7af)
  );
}

function saveState() {
  const state = {
    fileName: fileName.textContent,
    text: fullText,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  setStatus("已保存到浏览器本地存储");
}

function restoreState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;

  try {
    const state = JSON.parse(raw);
    if (!state.text) return false;
    loadText(state.text, state.fileName || "本地草稿");
    setStatus("已恢复本地草稿");
    return true;
  } catch {
    return false;
  }
}

function exportText() {
  const outputText = buildExportText();
  const utf8Bytes = new TextEncoder().encode(outputText);
  const blob = new Blob([utf8Bytes], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const baseName = (fileName.textContent || "novel").replace(/\.txt$/i, "");
  link.href = url;
  link.download = `${baseName || "novel"}-edited.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setStatus("已生成导出文件");
}

function buildExportText() {
  if (chapters.length === 0) {
    return normalizeExportText(fullText);
  }

  if (chapters.length === 1 && chapters[0].type === "全文") {
    return normalizeExportText(
      fullText.slice(chapters[0].contentStart, chapters[0].end),
    );
  }

  const tocText = [
    "目录",
    "",
    ...chapters.map(
      (chapter) =>
        `${"  ".repeat(Math.max(0, chapter.displayLevel - 1))}${chapter.title}`,
    ),
  ].join("\n");

  const bodyParts = chapters
    .map((chapter, index) => formatExportChapter(chapter, index))
    .filter(Boolean);

  return normalizeExportText(`${tocText}\n\n正文\n\n${bodyParts.join("\n\n")}`);
}

function formatExportChapter(chapter, index) {
  const ownBodyEnd = findFirstChildStart(index) ?? chapter.end;
  const body = fullText.slice(chapter.contentStart, ownBodyEnd).trim();
  const title = chapter.title.trim();
  const lines = title ? [title] : [];

  if (body) {
    lines.push(trimTrailingBookNoise(body));
  }

  return lines.join("\n\n").trim();
}

function findFirstChildStart(parentIndex) {
  for (let index = parentIndex + 1; index < chapters.length; index += 1) {
    if (chapters[index].parentIndex === parentIndex) {
      return chapters[index].start;
    }
    if (chapters[index].level <= chapters[parentIndex].level) {
      break;
    }
  }
  return null;
}

function trimTrailingBookNoise(text) {
  let lines = trimTrailingAdLines(text.replace(/\r\n?/g, "\n").split("\n"));
  const markerPattern =
    /^\s*(?:[-=*_~·　 ]*)?(?:[（(【\[]?\s*)?(?:全书完|全文完|正文完|本书完|完本|完结|大结局|完)(?:\s*[。.!！）)】\]]*)?(?:[-=*_~·　 ]*)?\s*$/;

  for (
    let index = lines.length - 1;
    index >= Math.max(0, lines.length - 80);
    index -= 1
  ) {
    if (!markerPattern.test(lines[index])) continue;

    const trailingText = lines
      .slice(index + 1)
      .join("")
      .trim();
    if (trailingText) {
      return lines
        .slice(0, index + 1)
        .join("\n")
        .trim();
    }
  }

  return lines.join("\n").trim();
}

function trimTrailingAdLines(lines) {
  const adPattern =
    /(https?:\/\/|www\.|小说网|中文网|最新网址|最新章节|无弹窗|全文字|TXT下载|txt下载|电子书下载|手机阅读|请记住|请收藏|加入书签|推荐票|月票|本书来自|更多精彩|广告)/i;
  const trimmed = [...lines];

  while (trimmed.length > 0) {
    const line = trimmed[trimmed.length - 1].trim();
    if (!line || adPattern.test(line)) {
      trimmed.pop();
      continue;
    }
    break;
  }

  return trimmed;
}

function normalizeExportText(text) {
  return `${text.replace(/\r\n?/g, "\n").trim()}\n`;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

fileInput.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  await loadFile(file);
  fileInput.value = "";
});

tocList.addEventListener("click", (event) => {
  const button = event.target.closest(".toc-item");
  if (!button) return;
  selectChapter(Number(button.dataset.index), true);
});

chapterEditor.addEventListener("input", () => {
  if (suppressChapterEdit) return;
  replaceActiveChapter(chapterEditor.value);
  setStatus("当前章节已同步到全文，目录稍后刷新");
});

currentChapterTitle.addEventListener("change", () => {
  if (suppressTitleEdit) return;
  replaceActiveChapterTitle(currentChapterTitle.value);
});

currentChapterTitle.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    currentChapterTitle.blur();
  }
});

tocSearch.addEventListener("input", renderToc);
parseButton.addEventListener("click", () => reparse({ keepSelection: true }));
saveButton.addEventListener("click", saveState);
exportButton.addEventListener("click", exportText);
viewSourceButton.addEventListener("click", openSourceDialog);
closeSourceButton.addEventListener("click", closeSourceDialog);
sourceDialog.addEventListener("click", (event) => {
  if (event.target === sourceDialog) closeSourceDialog();
});
rulesButton.addEventListener("click", openRulesDialog);
closeRulesButton.addEventListener("click", closeRulesDialog);
addRuleButton.addEventListener("click", addCustomHeadingRule);
rulesDialog.addEventListener("click", (event) => {
  if (event.target === rulesDialog) closeRulesDialog();
});

window.addEventListener("dragenter", (event) => {
  if (!hasDraggedFile(event)) return;
  event.preventDefault();
  document.body.classList.add("dragging-file");
});

window.addEventListener("dragover", (event) => {
  if (!hasDraggedFile(event)) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = "copy";
});

window.addEventListener("dragleave", (event) => {
  if (!event.relatedTarget) {
    document.body.classList.remove("dragging-file");
  }
});

window.addEventListener("drop", async (event) => {
  if (!hasDraggedFile(event)) return;
  event.preventDefault();
  document.body.classList.remove("dragging-file");
  await loadFile(event.dataTransfer.files?.[0]);
});

dropOverlay.addEventListener("click", () => {
  document.body.classList.remove("dragging-file");
});

function hasDraggedFile(event) {
  return Array.from(event.dataTransfer?.types || []).includes("Files");
}

if (!restoreState()) {
  updateStats();
  renderToc();
}
