import { startMockServer } from "./mock-server/index";

export default async function globalSetup() {
  await startMockServer(5173);
}
