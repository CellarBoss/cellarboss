import { createApiClient } from "@cellarboss/common";
import { makeServerRequest } from "./server";

export const api = createApiClient({ request: makeServerRequest });
