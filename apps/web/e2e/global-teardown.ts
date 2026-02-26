import { stopMockServer } from "./mock-server/index";

export default async function globalTeardown() {
  await stopMockServer();
}
