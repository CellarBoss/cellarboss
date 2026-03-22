import { stopMockServer } from "@cellarboss/mock-server";

export default async function globalTeardown() {
  await stopMockServer();
}
