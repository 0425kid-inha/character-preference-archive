let dom = {};

async function initAffectionPage() {
  try {
    initDom();

    const db = await window.App.dbReady;

    renderAffectionGallery(db.affectionTypes);

    console.log("애착유형 페이지 렌더링 완료");
  } catch (error) {
    console.error("애착유형 페이지 초기화 실패:", error);
  }
}

function initDom() {
  dom = {
    gallery: document.querySelector("#affection-gallery"),
    searchInput: document.querySelector("#affection-search"),
    countText: document.querySelector("#affection-count"),
    sortSelect: document.querySelector("#affection-sort"),
    categoryFilter: document.querySelector("#affection-category-filter"),
  };

  return dom;
}

function renderAffectionGallery(affections) {
  if (!dom.gallery) return;
  console.log("render affection gallery");
  console.log(affections)

  dom.gallery.innerHTML = "";
  dom.countText.textContent = affections.length;

  affections.forEach((affection) => {
    const card = createaffectionCard(affection);
    dom.gallery.appendChild(card);
  });
}

function createaffectionCard(affection) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "affection-gallery-card";

  button.innerHTML = `
    <div class="affection-card-image">
      <img src="../images/affections/${affection.id}.png" alt="${affection.name} 아이콘" />
    </div>

    <div class="affection-card-body">
      <span class="affection-card-kicker">Character affection</span>
      <h3>${affection.name}</h3>
      <p>${affection.description ?? "설명이 아직 없습니다."}</p>
    </div>
  `;

  return button;
}

initAffectionPage();