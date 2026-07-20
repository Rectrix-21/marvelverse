// One-off/occasional script: resolves the character roster in app/unmasked/class.json
// against the Comic Vine API and writes a static dataset to app/data/marvelCharacters.json.
// Run with: COMICVINE_API_KEY=xxxx node scripts/build-marvel-roster.mjs
//
// Comic Vine caps requests at 200/resource/hour, so this only resolves a capped batch
// of unique base character names per run. Re-run later (next rate-limit window) with
// an increased SKIP value to extend the roster.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_KEY = process.env.COMICVINE_API_KEY;
const MAX_CHARACTERS = Number(process.env.ROSTER_LIMIT || 150);
const SKIP = Number(process.env.ROSTER_SKIP || 0);
const REQUEST_DELAY_MS = 300;

if (!API_KEY) {
  console.error("Missing COMICVINE_API_KEY env var.");
  process.exit(1);
}

const classDataPath = path.join(__dirname, "../app/unmasked/class.json");
const outPath = path.join(__dirname, "../app/data/marvelCharacters.json");
const existingOutPath = fs.existsSync(outPath) ? outPath : null;

const classData = JSON.parse(fs.readFileSync(classDataPath, "utf-8"));

const stripVariant = (name) => name.replace(/\s*\([^)]*\)\s*$/, "").trim();

const seen = new Set();
const roster = []; // [{ displayName, baseName, characterClass }]
for (const entry of classData.characters) {
  const baseName = stripVariant(entry.name);
  const key = baseName.toLowerCase();
  if (seen.has(key)) continue;
  seen.add(key);
  roster.push({ displayName: entry.name, baseName, characterClass: entry.class });
}

const batch = roster.slice(SKIP, SKIP + MAX_CHARACTERS);
console.log(`Resolving ${batch.length} characters (skip=${SKIP}) of ${roster.length} unique names...`);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function resolveCharacter(baseName) {
  const url = new URL("https://comicvine.gamespot.com/api/characters/");
  url.searchParams.set("api_key", API_KEY);
  url.searchParams.set("format", "json");
  url.searchParams.set("filter", `name:${baseName}`);
  url.searchParams.set(
    "field_list",
    "id,name,real_name,gender,origin,teams,powers,image,publisher,count_of_issue_appearances,deck,first_appeared_in_issue"
  );
  url.searchParams.set("limit", "10");

  const res = await fetch(url, {
    headers: { "User-Agent": "MarvelverseApp/1.0 (portfolio project)" },
  });
  if (!res.ok) {
    console.warn(`  HTTP ${res.status} for "${baseName}"`);
    return null;
  }
  const data = await res.json();
  const results = Array.isArray(data.results) ? data.results : [];
  const marvelResults = results.filter(
    (c) =>
      c.publisher?.name === "Marvel" &&
      c.image?.super_url &&
      !c.image.super_url.includes("blank.png")
  );
  if (marvelResults.length === 0) return null;

  const exact = marvelResults.find(
    (c) => c.name.toLowerCase() === baseName.toLowerCase()
  );
  const best = exact || marvelResults[0];

  const genderMap = { 1: "Male", 2: "Female" };

  return {
    cvId: best.id,
    realName: best.real_name || null,
    gender: genderMap[best.gender] || "Unknown",
    origin: best.origin?.name || "Unknown",
    team: best.teams?.[0]?.name || "None",
    powersCount: Array.isArray(best.powers) ? best.powers.length : 0,
    issueAppearances: best.count_of_issue_appearances || 0,
    imageUrl: best.image.super_url,
    deck: best.deck || null,
    firstAppearance: best.first_appeared_in_issue?.name || null,
  };
}

async function main() {
  const resolved = [];
  const failures = [];

  for (const [i, { displayName, baseName, characterClass }] of batch.entries()) {
    process.stdout.write(`[${i + 1}/${batch.length}] ${baseName} ... `);
    try {
      const data = await resolveCharacter(baseName);
      if (data) {
        resolved.push({
          name: displayName,
          baseName,
          characterClass,
          ...data,
        });
        console.log("ok");
      } else {
        failures.push(baseName);
        console.log("no match");
      }
    } catch (err) {
      failures.push(baseName);
      console.log(`error: ${err.message}`);
    }
    await sleep(REQUEST_DELAY_MS);
  }

  let combined = resolved;
  if (existingOutPath) {
    const existing = JSON.parse(fs.readFileSync(existingOutPath, "utf-8"));
    const existingNames = new Set(existing.map((c) => c.name));
    combined = [...existing, ...resolved.filter((c) => !existingNames.has(c.name))];
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(combined, null, 2));
  console.log(`\nWrote ${combined.length} total characters to ${outPath}`);
  if (failures.length) {
    console.log(`Unresolved (${failures.length}): ${failures.join(", ")}`);
  }
  if (roster.length > SKIP + MAX_CHARACTERS) {
    console.log(
      `\n${roster.length - SKIP - MAX_CHARACTERS} names left. Re-run next hour with ROSTER_SKIP=${SKIP + MAX_CHARACTERS} to add more.`
    );
  }
}

main();
