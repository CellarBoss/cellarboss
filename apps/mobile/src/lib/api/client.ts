import { createApiClient } from "@cellarboss/api-client";
import { makeRequest } from "./request";

export const api = createApiClient({ request: makeRequest });
