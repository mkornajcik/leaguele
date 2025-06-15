import fs from "fs";
import path from "path";
import championsJson from "./champions.json" with { type: "json" };
// Path for output file
const outputPath = path.resolve(__dirname, "../data/champions_formatted.json");
function toTitleCase(raw) {
    let str;
    if (Array.isArray(raw)) {
        str = raw.join(" ");
    }
    else if (typeof raw === "string") {
        str = raw;
    }
    else if (raw != null) {
        str = String(raw);
    }
    else {
        return "";
    }
    return str
        .toLowerCase()
        .split(/[_\s]+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}
function extractYear(dateStr) {
    const match = /^\d{4}/.exec(dateStr);
    return match ? match[0] : dateStr;
}
// Iterate and build formatted object
const formatted = Object.entries(championsJson).reduce((acc, [key, champ]) => {
    acc[key] = {
        name: champ.name,
        title: champ.title,
        resource: toTitleCase(champ.resource),
        position: toTitleCase(champ.positions || champ.position),
        attackType: toTitleCase(champ.attackType),
        releaseDate: extractYear(champ.date || champ.releaseDate),
        icon: champ.icon,
    };
    return acc;
}, {});
// Write to file
fs.writeFileSync(outputPath, JSON.stringify(formatted, null, 2), "utf-8");
console.log(`Formatted data for ${Object.keys(formatted).length} champions written to ${outputPath}`);
