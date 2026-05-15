// scripts/shared/navigation.js

export function bindPageMoveButtons() {
  const buttons = document.querySelectorAll("[data-href]");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const href = button.dataset.href;
      if (!href) return;

      window.location.href = href;
    });
  });
}