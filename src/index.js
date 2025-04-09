import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Run a codemod transform using jscodeshift.
 *
 * @param {string} transformName Name of the transform file (e.g. "button.js" or "link.js", etc).
 */
function runTransform(transformName) {
  const transformPath = path.join(__dirname, transformName);
  const targetDir = path.join(process.cwd(), "pages", "react");

  console.log(`Running transform "${transformName}" on "${targetDir}"...`);
  const result = spawnSync(
    "npx",
    ["jscodeshift", "-t", transformPath, targetDir],
    {
      stdio: "inherit",
    }
  );

  if (result.error) {
    console.error(
      `Codemod execution failed for "${transformName}":`,
      result.error
    );
    process.exit(1);
  }
}

function main() {
  // Adjust as needed: run transforms in the desired sequence
  runTransform("button.js");
  runTransform("link.js");
  runTransform("banner.js");
  runTransform("section.js");
  runTransform("spinner.js");
}

main();
