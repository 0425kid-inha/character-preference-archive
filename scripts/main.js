// scripts/main.js
import { loadDatabase } from "./shared/data.js";
import { bindPageMoveButtons } from "./shared/navigation.js";

window.App = {
  db: null,
  dbReady: null,
};

window.App.dbReady = loadDatabase("../data/").then((db) => {
  window.App.db = db;
  console.log("DB 로딩 완료:", db);
  return db;
});

window.App.printDB = function () {
  console.log("현재 DB:", window.App.db);
};

window.App.goTo = function (href) {
  window.location.href = href;
};

bindPageMoveButtons();