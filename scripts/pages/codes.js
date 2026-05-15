let dom = {};

async function initCodesPage() {
  try {
    //initDom();

    const db = await window.App.dbReady;

    renderCodeGallery(db.affectionTypes);

    console.log("코드 페이지 렌더링 완료");
  } catch (error) {
    console.error("코드 페이지 초기화 실패:", error);
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

function renderCodeGallery(codes) {
  const gallery = document.querySelector("#affection-gallery");
  if (!gallery) return;

  gallery.innerHTML = "";

//   codes.forEach((code) => {
//     const card = createCodeCard(code);
//     gallery.appendChild(card);
//   });
}

function createCodeCard(code) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "code-gallery-card";

  button.innerHTML = `
    <div class="code-card-image">
      <img src="../images/codes/${code.id}.png" alt="${code.name} 아이콘" />
    </div>

    <div class="code-card-body">
      <span class="code-card-kicker">Character Code</span>
      <h3>${code.name}</h3>
      <p>${code.description ?? "설명이 아직 없습니다."}</p>
    </div>
  `;

  return button;
}

initCodesPage();