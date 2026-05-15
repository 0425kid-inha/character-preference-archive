export function getCharacterImage(character) {
  return character.image || character.icon || "./images/characters/default.png";
}

export function getCharacterName(character) {
  return character.name || character.character_name || "이름 없음";
}

export function getCharacterWork(character) {
  return character.work || character.source || character.title || "작품 미상";
}