import { startMockServer } from "./index";

const port = Number(process.env.MOCK_SERVER_PORT) || 5174;

startMockServer(port).then(() => {
  console.log(`Mock server ready on port ${port}`);
});
