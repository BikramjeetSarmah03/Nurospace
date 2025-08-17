import puppeteer from "puppeteer";

import env from "@packages/env/server";

import { waitFor } from "../../lib/waitFor";
import type { ExecutionEnvironment } from "../../types/executor";
import type { LaunchBrowserTask } from "../task/launch-browser";

export async function LaunchBrowserExecutor(
  environment: ExecutionEnvironment<typeof LaunchBrowserTask>,
): Promise<boolean> {
  try {
    const websiteUrl = environment.getInput("Website Url");

    console.log({ websiteUrl });

    const browser = await puppeteer.launch({
      headless: !env.DEV_MODE,
    });

    console.log("LAUNCHED BROWSER");

    await waitFor(3000);
    await browser.close();

    console.log("CLOSED BROWSER");

    return true;
  } catch (error) {
    console.log("Error from LAUNCH_BROWSER_EXECUTOR: ");
    console.log({ error });
    console.log("Error from LAUNCH_BROWSER_EXECUTOR: ");
    return false;
  }
}
