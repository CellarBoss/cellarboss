import type { Kysely } from "kysely";

const countries = [
  "Albania",
  "Algeria",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Belgium",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Brazil",
  "Bulgaria",
  "Canada",
  "Chile",
  "China",
  "Croatia",
  "Cyprus",
  "Czech Republic",
  "Egypt",
  "Ethiopia",
  "France",
  "Georgia",
  "Germany",
  "Greece",
  "Hungary",
  "India",
  "Israel",
  "Italy",
  "Japan",
  "Lebanon",
  "Luxembourg",
  "Malta",
  "Mexico",
  "Moldova",
  "Montenegro",
  "Morocco",
  "Netherlands",
  "New Zealand",
  "North Macedonia",
  "Peru",
  "Portugal",
  "Romania",
  "Russia",
  "Serbia",
  "Slovakia",
  "Slovenia",
  "South Africa",
  "Spain",
  "Switzerland",
  "Tunisia",
  "Turkey",
  "Ukraine",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
];

export async function seed(db: Kysely<any>): Promise<void> {
  for (const name of countries) {
    try {
      await db.insertInto("country").values({ name }).execute();
    } catch {
      // duplicate, skip
    }
  }

  console.log(`Seeded ${countries.length} countries`);
}
