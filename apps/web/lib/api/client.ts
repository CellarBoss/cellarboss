import { createApiClient } from "@cellarboss/api-client";
import { makeServerRequest } from "./server";

export const api = createApiClient({ request: makeServerRequest });
