// scripts/pages/home.js

async function initHomePage() {
  try {
    const db = await window.App.dbReady;

    renderSummary(db);

    console.log("홈 페이지 렌더링 완료");
  } catch (error) {
    console.error("홈 페이지 초기화 실패:", error);
  }
}

function renderSummary(db) {
  const characterCount = document.querySelector("#character-count");
  const codeCount = document.querySelector("#code-count");
  const affectionCount = document.querySelector("#affection-count");

  if (characterCount) characterCount.textContent = db.characters.length;
  if (codeCount) codeCount.textContent = db.characterCodes.length;
  if (affectionCount) affectionCount.textContent = db.affectionTypes.length;
}

initHomePage();