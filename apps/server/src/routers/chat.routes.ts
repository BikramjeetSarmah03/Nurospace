import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { streamText } from "hono/streaming";
import { z } from "zod";

const NewChatSchema = z.object({
  message: z.string(),
});

export const chatRoutes = new Hono().post(
  "/",
  zValidator("json", NewChatSchema),
  async (c) => {
    const { message } = c.req.valid("json");

    const text =
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Adipisci enim et eum voluptatem ab, omnis doloribus molestiae asperiores itaque dolor quaerat molestias ea eaque ipsa tempora libero sunt provident sequi fuga voluptatibus, ullam facere vitae. Sed delectus, aliquid soluta temporibus impedit quos explicabo quidem et quis rerum, corrupti dolore beatae at enim, in earum adipisci omnis odio natus nemo? Quaerat amet eos voluptatibus? Odio quod nemo repellat maiores perspiciatis, qui similique, debitis voluptate, minima hic aperiam accusantium dolorum cupiditate? Dicta modi doloremque, alias molestias temporibus quia, sapiente sequi aspernatur dolor enim in vel expedita illo cum veniam cupiditate voluptatibus nulla!";

    return streamText(c, async (stream) => {
      const words = text.split(" ");

      for (const word of words) {
        await stream.write(`${word} `);
        await stream.sleep(200); // 200ms between each word
      }
    });
  },
);
