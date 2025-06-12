import formattedChampionsJson from "../data/champions_formatted.json";
export function getRandomChampion() {
    const championsArray = Object.values(formattedChampionsJson);
    if (championsArray.length === 0) {
        throw new Error("No champions found in formattedChampionsJson");
    }
    const randomIndex = Math.floor(Math.random() * championsArray.length);
    return championsArray[randomIndex];
}
console.log(getRandomChampion());
