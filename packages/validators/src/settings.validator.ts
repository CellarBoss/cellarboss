import { z } from "zod";

export const updateSettingSchema = z.object({
  value: z.string().min(0).max(10000).trim().describe("Value of the setting"),
});
