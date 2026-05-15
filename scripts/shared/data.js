async function loadJson(basePath, fileName) {
  const response = await fetch(`${basePath}${fileName}`);

  if (!response.ok) {
    throw new Error(`${fileName} 파일을 불러오지 못했습니다.`);
  }

  return await response.json();
}

export async function loadDatabase(basePath = "./data/") {
  const [
    characters,
    characterCodes,
    affectionTypes,
    characterCodeMap,
    characterAffectionMap,
  ] = await Promise.all([
    loadJson(basePath, "characters.json"),
    loadJson(basePath, "character_codes.json"),
    loadJson(basePath, "affection_types.json"),
    loadJson(basePath, "character_code_map.json"),
    loadJson(basePath, "character_affection_map.json"),
  ]);

  return {
    characters,
    characterCodes,
    affectionTypes,
    characterCodeMap,
    characterAffectionMap,
  };
}