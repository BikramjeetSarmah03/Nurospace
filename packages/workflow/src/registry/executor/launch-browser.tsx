import puppeteer from "puppeteer";

import env from "@packages/env/server";

import type { ExecutionEnvironment } from "../../types/executor";
import type { LaunchBrowserTask } from "../task/launch-browser";

export async function LaunchBrowserExecutor(
  environment: ExecutionEnvironment<typeof LaunchBrowserTask>,
): Promise<boolean> {
  try {
    const websiteUrl = environment.getInput("Website Url");

    const browser = await puppeteer.launch({
      headless: !env.DEV_MODE,
    });

    environment.setBrowser(browser);

    const page = await browser.newPage();
    await page.goto(websiteUrl);

    environment.setPage(page);

    return true;
  } catch (error) {
    console.log("Error from LAUNCH_BROWSER_EXECUTOR: ");
    console.log({ error });
    environment.log.error((error as Error).message);
    console.log("Error from LAUNCH_BROWSER_EXECUTOR: ");
    return false;
  }
}
