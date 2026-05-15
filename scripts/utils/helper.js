export function findById(items, id) {
  return items.find((item) => String(item.id) === String(id));
}

export function getSafeText(value, fallback = "") {
  return value ?? fallback;
}

export function clearElement(element) {
  if (element) element.innerHTML = "";
}

export function printState(){
  console.log(state);
}