import type { ExecutionEnvironment } from "../../types/executor";
import type { PageToHtmlTask } from "../task/page-to-html";

export async function PageToHtmlExecutor(
  environment: ExecutionEnvironment<typeof PageToHtmlTask>,
): Promise<boolean> {
  try {
    const html = await environment.getPage()!.content();

    console.log("@PAGE HTML: ", html);

    return true;
  } catch (error) {
    console.log("Error from PAGE_TO_HTML_EXECUTOR: ");
    console.log({ error });
    console.log("Error from PAGE_TO_HTML_EXECUTOR: ");
    return false;
  }
}
