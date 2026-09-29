/**
 * Alternative names that should match an existing record. Keys and values
 * are compared with `foldKey()`, so accents and case don't matter. Adding a
 * synonym is a one-line change here.
 */

export const GRAPE_ALIASES: Record<string, string> = {
  shiraz: "Syrah",
  garnacha: "Grenache",
  "garnacha tinta": "Grenache",
  cannonau: "Grenache",
  mataro: "Mourvedre",
  "tinto fino": "Tempranillo",
  "tinta del pais": "Tempranillo",
  "tinta de toro": "Tempranillo",
  aragonez: "Tempranillo",
  spatburgunder: "Pinot Noir",
  "pinot nero": "Pinot Noir",
  "pinot bianco": "Pinot Blanc",
  weissburgunder: "Pinot Blanc",
  grauburgunder: "Pinot Gris",
  cot: "Malbec",
  steen: "Chenin Blanc",
  "fume blanc": "Sauvignon Blanc",
  "trebbiano toscano": "Trebbiano",
};

export const COUNTRY_ALIASES: Record<string, string> = {
  usa: "United States",
  us: "United States",
  "united states of america": "United States",
  america: "United States",
  uk: "United Kingdom",
  "great britain": "United Kingdom",
  england: "United Kingdom",
  wales: "United Kingdom",
  scotland: "United Kingdom",
  "south african republic": "South Africa",
  rsa: "South Africa",
  nz: "New Zealand",
  espana: "Spain",
  italia: "Italy",
  deutschland: "Germany",
  osterreich: "Austria",
  czechia: "Czech Republic",
};

export const REGION_ALIASES: Record<string, string> = {
  toscana: "Tuscany",
  piemonte: "Piedmont",
  sicilia: "Sicily",
  sardegna: "Sardinia",
  lombardia: "Lombardy",
  "valle d aosta": "Aosta Valley",
  rhone: "Rhone Valley",
  "northern rhone": "Rhone Valley",
  "southern rhone": "Rhone Valley",
  "cotes du rhone": "Rhone Valley",
  loire: "Loire Valley",
  bourgogne: "Burgundy",
  douro: "Douro Valley",
  catalunya: "Catalonia",
};
