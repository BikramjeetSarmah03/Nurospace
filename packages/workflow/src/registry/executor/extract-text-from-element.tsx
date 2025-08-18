import * as cheerio from "cheerio";

import type { ExecutionEnvironment } from "../../types/executor";
import type { ExtractTextFromElement } from "../task/extract-text-from-element";

export async function ExtractTextFromElementExecutor(
  environment: ExecutionEnvironment<typeof ExtractTextFromElement>,
): Promise<boolean> {
  try {
    const selector = environment.getInput("Selector");
    if (!selector) {
      environment.log.error("Selector is not provided");
      return false;
    }

    const html = environment.getInput("Html");
    if (!html) {
      environment.log.error("HTML not defined");
      return false;
    }

    const $ = cheerio.load(html);
    const element = $(selector);

    if (!element) {
      environment.log.error("Element not found");
      return false;
    }

    const extractedText = $.text(element);
    if (!extractedText) {
      environment.log.error("Element has no text");
      return false;
    }

    environment.setOutput("Extracted text", extractedText);

    return true;
  } catch (error) {
    console.log("Error from PAGE_TO_HTML_EXECUTOR: ");
    console.error({ error });
    environment.log.error((error as Error).message);
    console.log("Error from PAGE_TO_HTML_EXECUTOR: ");
    return false;
  }
}
