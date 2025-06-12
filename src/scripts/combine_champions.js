const fs = require("fs").promises;

async function combineChampionData() {
  const fullData = JSON.parse(await fs.readFile("champions_full.json", "utf8"));
  const speciesRegionData = JSON.parse(await fs.readFile("champion_species_region.json", "utf8"));

  // Merge species and region
  for (const champName of Object.keys(fullData)) {
    if (speciesRegionData[champName]) {
      fullData[champName].species = speciesRegionData[champName].species;
      fullData[champName].region = speciesRegionData[champName].region;
    } else {
      fullData[champName].species = "Unknown";
      fullData[champName].region = "Unknown";
    }
  }

  // Write to new file
  await fs.writeFile("champions_final.json", JSON.stringify(fullData, null, 2));
  console.log("Combined data written to champions_final.json");
}

combineChampionData().catch(console.error);
