const fs = require('fs');

// Load the champions.json file
const champions = JSON.parse(fs.readFileSync('champions.json', 'utf8'));

// Output objects
const championAbilities = {};
const championSplashes = {};

for (const [championName, data] of Object.entries(champions)) {
  // --- Extract Abilities ---
  const abilities = data.abilities || {};
  championAbilities[championName] = {};

  ['P', 'Q', 'W', 'E', 'R'].forEach((key) => {
    const abilityData = abilities[key]?.[0];
    if (abilityData) {
      championAbilities[championName][key] = [abilityData.name, abilityData.icon];
    }
  });

  // --- Extract Skins ---
  const skins = data.skins || [];
  const skinsOutput = {};
  skins.forEach((skin) => {
    if (skin.name && skin.cost !== undefined && skin.uncenteredSplashPath) {
      skinsOutput[skin.name] = [skin.cost, skin.uncenteredSplashPath];
    }
  });
  championSplashes[championName] = skinsOutput;
}

fs.writeFileSync('champion_abilities.json', JSON.stringify(championAbilities, null, 2));
fs.writeFileSync('champions_splash.json', JSON.stringify(championSplashes, null, 2));

console.log('Files created');
