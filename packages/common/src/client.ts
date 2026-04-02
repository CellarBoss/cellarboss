import type { RequestFn } from "./types";
import { winesResource } from "./resources/wines";
import { bottlesResource } from "./resources/bottles";
import { countriesResource } from "./resources/countries";
import { regionsResource } from "./resources/regions";
import { grapesResource } from "./resources/grapes";
import { locationsResource } from "./resources/locations";
import { storagesResource } from "./resources/storages";
import { winemakersResource } from "./resources/winemakers";
import { vintagesResource } from "./resources/vintages";
import { winegrapesResource } from "./resources/winegrapes";
import { tastingNotesResource } from "./resources/tasting-notes";
import { settingsResource } from "./resources/settings";
import { usersResource } from "./resources/users";
import { versionResource } from "./resources/version";
import { imagesResource } from "./resources/images";

export type ApiClientConfig = {
  request: RequestFn;
};

export function createApiClient(config: ApiClientConfig) {
  const { request } = config;
  return {
    wines: winesResource(request),
    bottles: bottlesResource(request),
    countries: countriesResource(request),
    regions: regionsResource(request),
    grapes: grapesResource(request),
    locations: locationsResource(request),
    storages: storagesResource(request),
    winemakers: winemakersResource(request),
    vintages: vintagesResource(request),
    winegrapes: winegrapesResource(request),
    tastingNotes: tastingNotesResource(request),
    settings: settingsResource(request),
    users: usersResource(request),
    version: versionResource(request),
    images: imagesResource(request),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
