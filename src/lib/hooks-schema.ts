import { z } from "zod";

export const hooksSchema = z.object({
  hooks: z.array(z.string()).length(5),
});
