import * as fs from "fs";
import * as path from "path";

import formattedChampionsJson from "../data/champions_formatted.json";
import genderJson from "../data/genders.json";

interface ChampionDetails {
  name: string;
  title: string;
  resource: string;
  position: string;
  attackType: string;
  releaseDate: string;
  icon: string;
}

interface Champion extends ChampionDetails {
  gender: string;
}

interface ChampionsData {
  [key: string]: ChampionDetails;
}

interface GenderInfo {
  gender: string;
}
interface GendersData {
  [key: string]: GenderInfo;
}

interface MergedChampionsData {
  [key: string]: Champion;
}

function mergeChampionData(champions: ChampionsData, genders: GendersData): MergedChampionsData {
  const mergedChampions: MergedChampionsData = {};

  for (const championKey in champions) {
    if (Object.prototype.hasOwnProperty.call(champions, championKey)) {
      const championDetails = champions[championKey];
      const genderInfo = genders[championKey];

      mergedChampions[championKey] = {
        ...championDetails,
        gender: genderInfo ? genderInfo.gender : "Not Specified",
      };
    }
  }
  return mergedChampions;
}

try {
  const mergedData: MergedChampionsData = mergeChampionData(
    formattedChampionsJson as ChampionsData,
    genderJson as GendersData //
  );

  const outputDir = path.resolve(__dirname, "../data");
  const outputFilePath = path.join(outputDir, "champions_full.json");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`Created directory: ${outputDir}`);
  }

  fs.writeFileSync(outputFilePath, JSON.stringify(mergedData, null, 2), "utf-8");

  console.log(`Successfully merged champion data!`);
  console.log(`Output file created at: ${outputFilePath}`);
} catch (error) {
  console.error("An error occurred during the merge process:", error);
}
