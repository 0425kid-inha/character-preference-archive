const dom = {
  grid: document.querySelector("#character-grid"),
  countText: document.querySelector("#character-count"),
  detail: document.querySelector("#character-detail"),
  archiveBody: document.querySelector(".archive-body"),
  sortSelect: document.querySelector("#sort-select"),
};

let state = {
  characters: [],
  affectionTypes: [],
  characterCodes: [],
  characterAffectionMap: [],
  characterCodeMap: [],
  selectedCharacterId: null,
};

initCharactersPage();

async function initCharactersPage() {
  console.log("init character page!");

  try {
    const db = await window.App.dbReady;

    state.characters = db.characters ?? [];
    state.affectionTypes = db.affectionTypes ?? [];
    state.characterCodes = db.characterCodes ?? [];
    state.characterAffectionMap = db.characterAffectionMap ?? [];
    state.characterCodeMap = db.characterCodeMap ?? [];

    applyFiltersAndSort();
    //renderCharacterGrid(state.characters);
    closeCharacterDetail();

    // 필터 및 정렬 기능 할당
    dom.sortSelect?.addEventListener("change", applyFiltersAndSort);

    console.log("캐릭터 페이지 렌더링 완료");
  } catch (error) {
    console.error("캐릭터 페이지 초기화 실패:", error);
  }
}

function renderCharacterGrid(characters) {
  if (!dom.grid) return;

  dom.grid.innerHTML = "";

  if (dom.countText) {
    dom.countText.textContent = characters.length;
  }

  characters.forEach((character) => {
    const card = createCharacterCard(character);
    dom.grid.appendChild(card);
  });
}

function createCharacterCard(character) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "character-card";
  button.dataset.characterId = character.id;

  const affectionNames = getCharacterAffections(character.id)
    .slice(0, 2)
    .map((affection) => affection.name);

  const codeNames = getCharacterCodes(character.id)
    .slice(0, 2)
    .map((code) => code.name);

  const tags = [...affectionNames, ...codeNames].slice(0, 2);
  const affectionLevel = getAffectionLevel(character);

  button.innerHTML = `
    <div class="character-card-top">
      <div class="affection-stars" aria-label="애착도 ${affectionLevel}">
        ${createAffectionStarsHtml(affectionLevel)}
      </div>

      <span class="media-icon">${getSourceIcon(character.sourceTypeId)}</span>
    </div>

    ${createCharacterImageHtml(character)}

    <strong>${character.name}</strong>
    <span>${character.source ?? "작품 정보 없음"}</span>

    <div class="mini-tags">
      ${
        tags.length > 0
          ? tags.map((tag) => `<em>${tag}</em>`).join("")
          : `<em>미분류</em>`
      }
    </div>
  `;

  button.addEventListener("click", () => {
    selectCharacter(character.id);
  });

  return button;
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
        <strong>${character.affection_score ?? "-"}</strong>
      </div>

      <button class="detail-close" type="button" aria-label="상세 정보 닫기">×</button>
    </div>

    <div class="detail-content">
      <div class="detail-title-block">
        <span class="detail-type">${getSourceIcon(character.source)}</span>
        <h3>${character.name}</h3>
        <p class="detail-source">${character.source ?? "소속 정보 없음"}</p>
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
                  .map((code) => `<span class="tag code">${code.name}</span>`)
                  .join("")
              : `<span class="tag empty">등록된 캐릭터 코드 없음</span>`
          }
        </div>
      </div>

      <div id="detail-notes" class="detail-section detail-notes-section">
        <h4>작성된 노트</h4>
        <p class="note-loading">노트를 불러오는 중...</p>
      </div>
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
      const noteId = Number(button.dataset.noteId);
      const noteFile = button.dataset.noteFile;

      console.log("노트 클릭:", noteId, noteFile);

      // 나중에 여기에서 노트 상세보기 함수 호출
      // openNoteDetail(noteId);
      // 또는 loadNoteContent(noteFile);
    });
  });
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