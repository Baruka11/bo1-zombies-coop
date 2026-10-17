// Every language has every text the English one has, with the same shape, and the card's language can be switched.
//   node test/strings.test.mjs
import assert from "node:assert/strict";
import { STRING_TABLES, T, LANGUAGES, setLanguage, savedLanguage } from "../src/ui/strings.js";
import { TEXT as FUN } from "../src/fun/text.js";

// What functions get called with: numbers and a word cover every text function in the tables.
const SAMPLES = [3, "kino", 2, 4];

/** Lists the paths of a table with the kind of value at each ("string", "function" or "array:<length>"). */
function shape(value, path = "", out = new Map()) {
  if (typeof value === "function") out.set(path, "function");
  else if (Array.isArray(value)) out.set(path, `array:${value.length}`);
  else if (value && typeof value === "object") for (const [key, child] of Object.entries(value)) shape(child, path ? `${path}.${key}` : key, out);
  else out.set(path, typeof value);
  return out;
}

function checkTables(name, tables) {
  const reference = shape(tables.en);
  for (const [code] of LANGUAGES) {
    assert.ok(tables[code], `${name}: no table for ${code}`);
    const other = shape(tables[code]);
    const missing = [...reference.keys()].filter((key) => !other.has(key));
    const extra = [...other.keys()].filter((key) => !reference.has(key));
    assert.deepEqual(missing, [], `${name}.${code} lacks: ${missing.join(", ")}`);
    assert.deepEqual(extra, [], `${name}.${code} has keys English does not: ${extra.join(", ")}`);
    for (const [key, kind] of reference) assert.equal(other.get(key), kind, `${name}.${code}.${key} is a ${other.get(key)}, English has a ${kind}`);
    // text actually produced
    const visit = (value, path) => {
      if (typeof value === "function") {
        const text = value(...SAMPLES);
        assert.ok(typeof text === "string" && text.length > 0, `${name}.${code}.${path}() gives no text`);
      } else if (typeof value === "string") assert.ok(value.length > 0, `${name}.${code}.${path} is empty`);
      else if (Array.isArray(value)) value.forEach((v, i) => visit(v, `${path}[${i}]`));
      else if (value && typeof value === "object") for (const [k, v] of Object.entries(value)) visit(v, path ? `${path}.${k}` : k);
    };
    visit(tables[code], "");
  }
}

checkTables("card", STRING_TABLES);
checkTables("fun", FUN);
console.log("ok  card and fun mode texts complete in", LANGUAGES.map(([c]) => c).join(", "));

// no machine-translation leftovers: a French text must not be identical to the English one except for names
const same = [];
for (const [key] of shape(STRING_TABLES.en)) {
  const read = (table) => key.split(".").reduce((v, k) => v?.[k], table);
  const en = read(STRING_TABLES.en);
  const fr = read(STRING_TABLES.fr);
  if (typeof en === "string" && en === fr && en.length > 12) same.push(key);
}
assert.deepEqual(same, [], `French texts still in English: ${same.join(", ")}`);
console.log("ok  no long French text left in English");

// switching the language: no storage here, so the choice lasts only while the module lives
setLanguage("fr");
assert.equal(T.host, STRING_TABLES.fr.host);
assert.equal(T.chip.solo, STRING_TABLES.fr.chip.solo);
assert.equal(T.inviteAside(2), STRING_TABLES.fr.inviteAside(2));
setLanguage("pt");
assert.equal(T.host, STRING_TABLES.pt.host);
setLanguage("en");
assert.equal(T.host, STRING_TABLES.en.host);
setLanguage("xx"); // unknown: back to automatic
assert.ok(["", undefined].includes(savedLanguage()) || savedLanguage() === "");
console.log("ok  T follows the chosen language");
console.log("strings: all passed");
