import { createApiClient } from "@cellarboss/common";
import { makeRequest } from "./request";

export const api = createApiClient({ request: makeRequest });
