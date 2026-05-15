const dom = {
  grid: document.querySelector("#character-grid"),
  countText: document.querySelector("#character-count"),
  detail: document.querySelector("#character-detail"),
  archiveBody: document.querySelector(".archive-body"),
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

    renderCharacterGrid(state.characters);
    closeCharacterDetail();

    console.log("캐릭터 페이지 렌더링 완료");
  } catch (error) {
    console.error("캐릭터 페이지 초기화 실패:", error);
  }
}

function renderCharacterGrid(characters) {
  console.log("render character grid");
  console.log(dom);
  if (!dom.grid) return;

  console.log("grid가 있네요");
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

  button.innerHTML = `
    <span class="media-icon">${getSourceIcon(character.source)}</span>

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

function renderCharacterDetail(character) {
  console.log("상세정보 보여주기");
  console.log(dom);
  if (!dom.detail) return;

  const affections = getCharacterAffections(character.id);
  const codes = getCharacterCodes(character.id);
  const affectionMap = getCharacterAffectionMap(character.id);
  const codeMap = getCharacterCodeMap(character.id);

  dom.detail.innerHTML = `
    <button class="detail-close" type="button" aria-label="상세 정보 닫기">×</button>

    <div class="detail-top">
      <span class="detail-type">${getSourceIcon(character.source)} ${getSourceCategory(character.source)}</span>
      <h3>${character.name}</h3>
      <p class="detail-source">${character.source ?? "소속 정보 없음"}</p>
    </div>

    <div class="detail-profile">
      ${createCharacterDetailImageHtml(character)}

      <div>
        <h4>간단 설명</h4>
        <p>
          ${character.description ?? affectionMap?.notes ?? codeMap?.notes ?? "아직 설명이 없습니다."}
        </p>
      </div>
    </div>

    <div class="detail-section">
      <h4>애착 유형</h4>
      <div class="tag-group">
        ${
          affections.length > 0
            ? affections.map((affection) => `<span class="tag affection">${affection.name}</span>`).join("")
            : `<span class="tag empty">등록된 애착 유형 없음</span>`
        }
      </div>
    </div>

    <div class="detail-section">
      <h4>캐릭터 코드</h4>
      <div class="tag-group">
        ${
          codes.length > 0
            ? codes.map((code) => `<span class="tag code">${code.name}</span>`).join("")
            : `<span class="tag empty">등록된 캐릭터 코드 없음</span>`
        }
      </div>
    </div>

    <div class="detail-section">
      <h4>작성된 노트</h4>
      ${createNoteListHtml(character, affectionMap, codeMap)}
    </div>
  `;

  dom.detail.querySelector(".detail-close")?.addEventListener("click", closeCharacterDetail);
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
    .map((id) => state.affectionTypes.find((affection) => Number(affection.id) === Number(id)))
    .filter(Boolean);
}

function getCharacterCodes(characterId) {
  const map = getCharacterCodeMap(characterId);
  if (!map) return [];

  return (map.code_ids ?? [])
    .map((id) => state.characterCodes.find((code) => Number(code.id) === Number(id)))
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

function createNoteListHtml(character, affectionMap, codeMap) {
  const notes = [];

  if (character.notes) {
    notes.push({
      title: `${character.name} 기본 메모`,
      text: character.notes,
    });
  }

  if (affectionMap?.notes) {
    notes.push({
      title: "애착 유형 메모",
      text: affectionMap.notes,
    });
  }

  if (codeMap?.notes) {
    notes.push({
      title: "캐릭터 코드 메모",
      text: codeMap.notes,
    });
  }

  if (Array.isArray(character.note_ids) && character.note_ids.length > 0) {
    character.note_ids.forEach((noteId) => {
      notes.push({
        title: `노트 #${noteId}`,
        text: "연결된 노트가 있습니다.",
      });
    });
  }

  if (notes.length === 0) {
    return `<p class="empty-note">아직 작성된 노트가 없습니다.</p>`;
  }

  return `
    <ul class="note-list">
      ${notes
        .map(
          (note) => `
            <li>
              <a href="#">${note.title}</a>
              <span>${note.text}</span>
            </li>
          `
        )
        .join("")}
    </ul>
  `;
}

function getInitial(name) {
  return String(name ?? "?").trim().charAt(0).toUpperCase();
}

function getSourceIcon(source) {
  const text = String(source ?? "").toLowerCase();

  if (
    text.includes("dc") ||
    text.includes("dark knight") ||
    text.includes("terminator") ||
    text.includes("movie") ||
    text.includes("film")
  ) {
    return "🎬";
  }

  if (
    text.includes("blue archive") ||
    text.includes("dragon ball") ||
    text.includes("evangelion") ||
    text.includes("death note") ||
    text.includes("re:zero")
  ) {
    return "📺";
  }

  if (
    text.includes("game") ||
    text.includes("blue archive") ||
    text.includes("nier")
  ) {
    return "🎮";
  }

  if (
    text.includes("book") ||
    text.includes("novel")
  ) {
    return "📚";
  }

  return "✦";
}

function getSourceCategory(source) {
  const text = String(source ?? "").toLowerCase();

  if (
    text.includes("dc") ||
    text.includes("dark knight") ||
    text.includes("terminator")
  ) {
    return "영화/코믹스";
  }

  if (
    text.includes("dragon ball") ||
    text.includes("evangelion") ||
    text.includes("death note") ||
    text.includes("re:zero")
  ) {
    return "애니메이션";
  }

  if (
    text.includes("blue archive") ||
    text.includes("nier")
  ) {
    return "게임";
  }

  return "작품";
}