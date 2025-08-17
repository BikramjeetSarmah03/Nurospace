import * as cheerio from "cheerio";

import type { ExecutionEnvironment } from "../../types/executor";
import type { ExtractTextFromElement } from "../task/extract-text-from-element";

export async function ExtractTextFromElementExecutor(
  environment: ExecutionEnvironment<typeof ExtractTextFromElement>,
): Promise<boolean> {
  try {
    const selector = environment.getInput("Selector");
    if (!selector) {
      console.error("Selector not defined");
      return false;
    }

    const html = environment.getInput("Html");
    if (!html) {
      console.error("HTML not defined");
      return false;
    }

    const $ = cheerio.load(html);
    const element = $(selector);

    if (!element) {
      console.error("Element not found");
      return false;
    }

    const extractedText = $.text(element);
    if (!extractedText) {
      console.error("Element has no text");
      return false;
    }

    environment.setOutput("Extracted text", extractedText);

    return true;
  } catch (error) {
    console.log("Error from PAGE_TO_HTML_EXECUTOR: ");
    console.error({ error });
    console.log("Error from PAGE_TO_HTML_EXECUTOR: ");
    return false;
  }
}
