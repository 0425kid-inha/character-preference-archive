const characterAffectionMap = Array.from({ length: 56 }, (_, i) => ({
character_id: i + 1,

main_affection_type_id: null,

sub_affection_type_ids: []
}));

console.log(JSON.stringify(characterAffectionMap, null, 2));