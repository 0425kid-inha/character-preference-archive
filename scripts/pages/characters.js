// ==============================
// DOM 요소 캐싱
// ==============================

// ! querySelector 호출없이 html 요소를 미리 저장해뒀다가 사용할 수 있게 하는 역할
const dom = {
  grid: document.querySelector("#character-grid"),
  countText: document.querySelector("#character-count"),
  detail: document.querySelector("#character-detail"),
  archiveBody: document.querySelector(".archive-body"),
  sortSelect: document.querySelector("#sort-select"),
};

// ==============================
// 페이지 상태(State)
// ==============================

// ! 캐릭터 페이지에서 사용하는 전역 상태 데이터
// ! DB 로딩 이후 실제 데이터가 주입된다.
let state = {
  characters: [],
  affectionTypes: [],
  characterCodes: [],
  characterAffectionMap: [],
  characterCodeMap: [],
  selectedCharacterId: null,
};

// ==============================
// 초기 실행
// ==============================

// ! 캐릭터 페이지 초기화 시작
initCharactersPage();

// ==============================
// 페이지 초기화
// ==============================

/**
 * 캐릭터 페이지 초기 렌더링 및 이벤트 연결을 수행한다.
 * 
 * - DB 데이터 로드
 * - state 저장
 * - 필터 및 정렬 적용
 * - 상세 패널 초기화
 * - 정렬 이벤트 연결
 */
async function initCharactersPage() {
  console.log("init character page!");

  try {

    // DB 로딩 완료 대기
    const db = await window.App.dbReady;

    // 전역 상태(state)에 데이터 저장
    state.characters = db.characters ?? [];
    state.affectionTypes = db.affectionTypes ?? [];
    state.characterCodes = db.characterCodes ?? [];
    state.characterAffectionMap = db.characterAffectionMap ?? [];
    state.characterCodeMap = db.characterCodeMap ?? [];

    // 현재 필터 및 정렬 기준으로 캐릭터 목록 렌더링
    applyFiltersAndSort();

    // 상세 패널 기본 닫힘 상태 적용
    closeCharacterDetail();

    // 필터 및 정렬 기능 이벤트 연결
    dom.sortSelect?.addEventListener("change", applyFiltersAndSort);

    console.log("캐릭터 페이지 렌더링 완료");

  } catch (error) {

    // FIXME:
    // 초기화 실패 시 사용자용 오류 UI 추가 필요
    console.error("캐릭터 페이지 초기화 실패:", error);
  }
}


// ==============================
// 캐릭터 그리드 렌더링
// ==============================

/**
 * 캐릭터 카드 목록을 화면에 렌더링한다.
 * 
 * @param {Array} characters - 렌더링할 캐릭터 배열
 */
function renderCharacterGrid(characters) {

  // grid 요소가 없으면 렌더링 중단
  if (!dom.grid) return;

  // 기존 카드 목록 초기화
  dom.grid.innerHTML = "";

  // 현재 표시중인 캐릭터 수 갱신
  if (dom.countText) {
    dom.countText.textContent = characters.length;
  }

  // 캐릭터 카드 생성 및 추가
  characters.forEach((character) => {
    const card = createCharacterCard(character);
    dom.grid.appendChild(card);
  });
}


// ==============================
// 캐릭터 카드 생성
// ==============================

// ==============================
// 캐릭터 카드 생성
// ==============================

/**
 * 캐릭터 카드 DOM 요소를 생성한다.
 * 
 * - 메인 애착 유형
 * - 보조 애착 유형
 * - 캐릭터 코드
 * - 애착도
 * 
 * 등의 정보를 카드 형태로 렌더링한다.
 * 
 * @param {Object} character
 * @returns {HTMLButtonElement}
 */
function createCharacterCard(character) {

  console.log(`create character: ${character}`);
  // 카드 루트 버튼 생성
  const button = document.createElement("button");

  button.type = "button";
  button.className = "character-card";
  button.dataset.characterId = character.id;


  // ==============================
  // 캐릭터 데이터 추출
  // ==============================

  // 메인 애착 유형 조회
  const mainAffection = getCharacterMainAffection(character.id);

  // 보조 애착 유형 조회
  const subAffections = getCharacterSubAffections(character.id);

  // 캐릭터 코드 조회
  const codes = getCharacterCodes(character.id);

  // 애착도 계산
  const affectionLevel = getAffectionLevel(character);


  // ==============================
  // 카드 표시용 데이터 가공
  // ==============================

  // 메인 애착 이름
  const mainAffectionName = mainAffection?.name ?? "미분류";

  // 보조 애착 태그
  const subAffectionTags = subAffections
    .slice(0, 2)
    .map((affection) => affection.name);

  // 캐릭터 코드 태그
  const codeTags = codes
    .slice(0, 2)
    .map((code) => code.name);

  // 카드 하단 태그 목록 구성
  const tags = [...subAffectionTags, ...codeTags].slice(0, 3);


  // ==============================
  // 카드 내부 HTML 생성
  // ==============================

  button.innerHTML = `
    <div class="character-card-top">

      <div class="affection-stars" aria-label="애착도 ${affectionLevel}">
        ${createAffectionStarsHtml(affectionLevel)}
      </div>
      ${createMainAffectionIconHtml(mainAffection)}

    </div>

    ${createCharacterImageHtml(character)}

    <div class="character-card-body">

      <strong class="character-name">
        ${character.name}
      </strong>

      <span class="character-source">
        ${character.source ?? "작품 정보 없음"}
      </span>

      <div class="main-affection-tag">
        ${mainAffection ? `<em>${mainAffection.name}</em>` : `<em class="empty">미분류</em>`}
      </div>

    </div>
  `;


  // ==============================
  // 이벤트 연결
  // ==============================

  // 카드 클릭 시 상세 패널 열기
  button.addEventListener("click", () => {
    selectCharacter(character.id);
  });

  return button;
}

/**
 * 캐릭터의 메인 애착 유형 반환
 */
function getCharacterMainAffection(characterId) {

  const mapData = getCharacterAffectionMap(characterId);

  if (!mapData) return null;

  return state.affectionTypes.find(
    (type) => type.id === mapData.main_affection_type_id
  );
}

/**
 * 캐릭터의 보조 애착 유형 목록 반환
 */
function getCharacterSubAffections(characterId) {

  const mapData = getCharacterAffectionMap(characterId);

  if (!mapData) return [];

  return mapData.sub_affection_type_ids
    .map((id) =>
      state.affectionTypes.find((type) => type.id === id)
    )
    .filter(Boolean);
}

// ==============================
// 애착 유형 fallback 이모지
// ==============================

// ! 아이콘 이미지가 없을 경우 사용할 기본 이모지
const affectionEmojiMap = {
  1: "⭐", // 동경형
  2: "🌌", // 압도형
  3: "💧", // 연민형
  4: "🫂", // 보호형
  5: "🪞", // 자기투영형
  6: "🔗", // 관계몰입형
  7: "🎀", // 모에형
  8: "🍵", // 위안형
  9: "👑", // 미학형
};

/**
 * 메인 애착 유형 아이콘 HTML 생성
 * 
 * - 아이콘 이미지가 존재하면 이미지 사용
 * - 이미지 로딩 실패 시 fallback 이모지 사용
 * 
 * @param {Object|null} affection
 * @returns {string}
 */
function createMainAffectionIconHtml(affection) {

  // 애착 유형이 없는 경우 fallback
  if (!affection) {
    return `<span class="affection-icon-fallback">❔</span>`;
  }

  const iconPath = `images/icons/affections/${affection.id}.png`;

  const fallbackEmoji =
    affectionEmojiMap[affection.id] ?? "✨";

  return `
    <img
      class="main-affection-icon"
      src="${iconPath}"
      alt="${affection.name}"
      title="${affection.name}"
      onerror="
        this.outerHTML =
        '<span class=&quot;affection-icon-fallback&quot; title=&quot;${affection.name}&quot;>${fallbackEmoji}</span>'
      "
    >
  `;
}

function selectCharacter(characterId) {
  state.selectedCharacterId = characterId;

  document.querySelectorAll(".character-card").forEach((card) => {
    card.classList.toggle(
      "selected",
      Number(card.dataset.characterId) === Number(characterId)
    );
  });

  const character = state.characters.find(
    (item) => Number(item.id) === Number(characterId)
  );

  if (!character) return;

  renderCharacterDetail(character);
  openCharacterDetail();
}

async function renderCharacterDetail(character) {
  if (!dom.detail) return;

  const affections = getCharacterAffections(character.id);
  const codes = getCharacterCodes(character.id);
  const affectionMap = getCharacterAffectionMap(character.id);
  const codeMap = getCharacterCodeMap(character.id);

  dom.detail.innerHTML = `
    <div class="detail-top">
      <div class="detail-affection-score">
        <span class="detail-affection-label">애착도</span>
        <strong>${character.attachmentLevel ?? "-"}</strong>
      </div>

      <button class="detail-close" type="button" aria-label="상세 정보 닫기">×</button>
    </div>

    <div class="detail-content">

      <div class="detail-character-view">

        <div class="detail-title-block">
          <h3>${character.name}</h3>

          <p class="detail-source">
            ${character.source ?? "소속 정보 없음"}
          </p>
        </div>

        <div class="detail-profile">
          ${createCharacterDetailImageHtml(character)}

          <div>
            <h4>간단 설명</h4>

            <p>
              ${
                character.description ??
                affectionMap?.notes ??
                codeMap?.notes ??
                "아직 설명이 없습니다."
              }
            </p>
          </div>
        </div>

        <div class="detail-section">
          <h4>애착 유형</h4>

          <div class="tag-group">
            ${
              affections.length > 0
                ? affections
                    .map(
                      (affection) =>
                        `<span class="tag affection">${affection.name}</span>`
                    )
                    .join("")
                : `<span class="tag empty">등록된 애착 유형 없음</span>`
            }
          </div>
        </div>

        <div class="detail-section">
          <h4>캐릭터 코드</h4>

          <div class="tag-group">
            ${
              codes.length > 0
                ? codes
                    .map(
                      (code) =>
                        `<span class="tag code">${code.name}</span>`
                    )
                    .join("")
                : `<span class="tag empty">등록된 캐릭터 코드 없음</span>`
            }
          </div>
        </div>

        <div
          id="detail-notes"
          class="detail-section detail-notes-section"
        >
          <h4>작성된 노트</h4>

          <p class="note-loading">
            노트를 불러오는 중...
          </p>
        </div>

      </div>

      <div class="detail-note-view hidden"></div>

    </div>
  `;

  dom.detail
    .querySelector(".detail-close")
    ?.addEventListener("click", closeCharacterDetail);

  await renderCharacterNoteList(character.id);
}

function openCharacterDetail() {
  dom.archiveBody?.classList.add("detail-open");
  dom.detail?.classList.add("is-open");
}

function closeCharacterDetail() {
  state.selectedCharacterId = null;

  dom.archiveBody?.classList.remove("detail-open");
  dom.detail?.classList.remove("is-open");

  if (dom.detail) {
    dom.detail.innerHTML = "";
  }

  document.querySelectorAll(".character-card").forEach((card) => {
    card.classList.remove("selected");
  });
}

function getCharacterAffections(characterId) {
  const map = getCharacterAffectionMap(characterId);
  if (!map) return [];

  return (map.affection_type_ids ?? [])
    .map((id) =>
      state.affectionTypes.find(
        (affection) => Number(affection.id) === Number(id)
      )
    )
    .filter(Boolean);
}

function getCharacterCodes(characterId) {
  const map = getCharacterCodeMap(characterId);
  if (!map) return [];

  return (map.code_ids ?? [])
    .map((id) =>
      state.characterCodes.find((code) => Number(code.id) === Number(id))
    )
    .filter(Boolean);
}

function getCharacterAffectionMap(characterId) {
  return state.characterAffectionMap.find(
    (item) => Number(item.character_id) === Number(characterId)
  );
}

function getCharacterCodeMap(characterId) {
  return state.characterCodeMap.find(
    (item) => Number(item.character_id) === Number(characterId)
  );
}

function getAffectionLevel(character) {
  const rawLevel = character.attachmentLevel;

  const level = Number(rawLevel);

  if (Number.isNaN(level)) return 0;

  return Math.max(0, Math.min(5, Math.floor(level)));
}

function createAffectionStarsHtml(level) {
  if (level <= 0) return "";

  return Array.from({ length: level }, () => `<span>✦</span>`).join("");
}

function createCharacterImageHtml(character) {
  const imageId = character.image ?? character.slug ?? character.id;

  return `
    <img
      src="../images/characters/${imageId}.png"
      alt="${character.name} 이미지"
      onerror="this.outerHTML='<div class=&quot;character-card-image-fallback&quot;>${getInitial(character.name)}</div>'"
    />
  `;
}

function createCharacterDetailImageHtml(character) {
  const imageId = character.image ?? character.slug ?? character.id;

  return `
    <img
      src="../images/characters/${imageId}.png"
      alt="${character.name} 이미지"
      onerror="this.outerHTML='<div class=&quot;character-card-image-fallback&quot;>${getInitial(character.name)}</div>'"
    />
  `;
}

function getInitial(name) {
  return String(name ?? "?").trim().charAt(0).toUpperCase();
}

function getSourceIcon(sourcetype) {
  switch (sourcetype) {
    case "movie":
      return "🎬";
    case "comic":
      return "💬";
    case "anime":
      return "📺";
    case "game":
      return "🎮";
    case "book":
      return "📚";
    default:
      return "✦";
  }
}

function applyFiltersAndSort() {
  console.log("apply filter!");
  let result = [...state.characters];

  const sortValue = dom.sortSelect?.value;

  switch (sortValue) {
    case "affection-desc":
      result.sort((a, b) => {
        return getAffectionLevel(b) - getAffectionLevel(a);
      });
      break;

    case "name":
      result.sort((a, b) => {
        return a.name.localeCompare(b.name, "ko");
      });
      break;
  }

  renderCharacterGrid(result);
}

/* ================================
   Character Notes
   data/notes/notes_index.json을 기준으로
   현재 캐릭터 index에 연결된 md 노트를 불러온다.
================================ */

let notesIndexCache = null;

async function loadNotesIndex() {
  if (notesIndexCache) return notesIndexCache;

  try {
    const response = await fetch("../data/notes/notes_index.json");

    if (!response.ok) {
      throw new Error("notes_index.json 로드 실패");
    }

    notesIndexCache = await response.json();
    return notesIndexCache;
  } catch (error) {
    console.warn("노트 인덱스 로드 실패:", error);
    notesIndexCache = [];
    return notesIndexCache;
  }
}

async function loadCharacterNoteList(characterIndex) {
  const notesIndex = await loadNotesIndex();

  return notesIndex
    .filter((note) => note.character_index === characterIndex)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

async function renderCharacterNoteList(characterIndex) {
  const notesSection = document.querySelector("#detail-notes");

  if (!notesSection) {
    console.warn("#detail-notes 요소를 찾을 수 없습니다.");
    return;
  }

  notesSection.innerHTML = `
    <h4>작성된 노트</h4>
    <p class="note-loading">노트 목록을 불러오는 중...</p>
  `;

  const notes = await loadCharacterNoteList(characterIndex);
  const note_count = notes.length;

  if (note_count === 0) {
    notesSection.innerHTML = `
      <h4>작성된 노트(0)</h4>
      <p class="note-empty">아직 작성된 노트가 없습니다.</p>
    `;
    return;
  }

  notesSection.innerHTML = `
    <h4>작성된 노트(${note_count})</h4>

    <ul class="note-list">
      ${notes
        .map(
          (note) => `
            <li>
              <button
                type="button"
                class="note-item-button"
                data-note-id="${note.id}"
                data-note-file="${escapeHtml(note.file ?? "")}"
              >
                <span class="note-title">${escapeHtml(note.title || "제목 없는 노트")}</span>
                <span class="note-date">${formatNoteDate(note.created_at)}</span>
              </button>
            </li>
          `
        )
        .join("")}
    </ul>
  `;

  notesSection.querySelectorAll(".note-item-button").forEach((button) => {
    button.addEventListener("click", () => {

      const note = notes.find(
        (item) => item.id === Number(button.dataset.noteId)
      );

      if (!note) return;

      openNoteView(note);
    });
  });
}

async function openNoteView(note) {
  

  const detail = document.querySelector("#character-detail");

  const characterView = detail.querySelector(".detail-character-view");
  console.log(`캐릭터 뷰: ${characterView}`);
  const noteView = detail.querySelector(".detail-note-view");

  const detailContent = detail.querySelector(".detail-content");
  detailContent.scrollTop = 0;

  detail.classList.add("note-open");

  characterView.classList.add("hidden");
  noteView.classList.remove("hidden");

  noteView.innerHTML = `
    <div class="note-view-header">
      <button class="note-back-button" type="button">
        ← 캐릭터 상세로 돌아가기
      </button>

      <h2 class="note-view-title">${escapeHtml(note.title)}</h2>

      <p class="note-view-date">
        ${formatNoteDate(note.created_at)}
      </p>
    </div>

    <div class="note-markdown">
      로딩중...
    </div>
  `;

  noteView
    .querySelector(".note-back-button")
    ?.addEventListener("click", closeNoteView);

  // md 파일 fetch
  const markdown = await loadNoteMarkdown(note.file);

  noteView.querySelector(".note-markdown").innerHTML =
    parseMarkdown(markdown);
}

function closeNoteView() {
  const detail = document.querySelector("#character-detail");

  const characterView = detail.querySelector(".detail-character-view");
  const noteView = detail.querySelector(".detail-note-view");

  detail.classList.remove("note-open");

  characterView.classList.remove("hidden");
  noteView.classList.add("hidden");

  noteView.innerHTML = "";
}

function formatNoteDate(dateString) {
  if (!dateString) return "";

  return dateString.replaceAll("-", ".");
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function loadNoteMarkdown(fileName) {
  if (!fileName) {
    return "# 오류\n\n노트 파일 정보가 없습니다.";
  }

  try {
    const response = await fetch(`../data/notes/${fileName}`);

    if (!response.ok) {
      throw new Error("노트 파일 로드 실패");
    }

    const rawText = await response.text();

    return removeFrontMatter(rawText);

  } catch (error) {
    console.error(error);

    return `
# 노트를 불러올 수 없습니다

파일:
${fileName}
`;
  }
}

function removeFrontMatter(markdown) {

  return markdown.replace(
    /^---\s*\n[\s\S]*?\n---\s*\n?/,
    ""
  );
}

function parseMarkdown(markdown) {

  return markdown
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")

    .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/gim, "<em>$1</em>")

    .replace(/\n\n/g, "</p><p>")

    .replace(/^/, "<p>")
    .replace(/$/, "</p>");
}