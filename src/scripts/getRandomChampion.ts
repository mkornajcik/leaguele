import formattedChampionsJson from "../data/champions_formatted.json" with { type: "json" };

// Type for the formatted champion structure
export interface FormattedChampion {
  name: string;
  title: string;
  resource: string;
  position: string;
  attackType: string;
  releaseDate: string;
  icon: string;
}

export function getRandomChampion(): FormattedChampion {
  const championsArray = Object.values(formattedChampionsJson) as FormattedChampion[];

  if (championsArray.length === 0) {
    throw new Error("No champions found in formattedChampionsJson");
  }

  const randomIndex = Math.floor(Math.random() * championsArray.length);
  return championsArray[randomIndex];
}

console.log(getRandomChampion());
