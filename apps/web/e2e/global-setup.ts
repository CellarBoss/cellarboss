import { startMockServer } from "@cellarboss/mock-server";

export default async function globalSetup() {
  await startMockServer(5173);
}
