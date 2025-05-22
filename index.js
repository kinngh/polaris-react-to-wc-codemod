import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function runTransform(transformName, targetDir) {
  const transformPath = path.join(__dirname, "src", transformName);
  console.log(`Running transform "${transformName}" on "${targetDir}"...`);
  const result = spawnSync(
    "bunx",
    ["jscodeshift", "-t", transformPath, targetDir],
    {
      stdio: "inherit",
      shell: process.platform === "win32",
    }
  );

  if (result.status !== 0) {
    console.error(`Codemod execution failed for "${transformName}".`);
    process.exit(result.status ?? 1);
  }
}

function main() {
  if (process.argv.length < 3) {
    console.error("Usage: bun index.js <target-directory>");
    process.exit(1);
  }

  const targetDir = path.resolve(process.cwd(), process.argv[2]);

  const transforms = [
    "badge.js",
    "banner.js",
    "box.js",
    "button.js",
    "checkbox.js",
    "choicelist.js",
    "divider.js",
    "grid.js",
    "heading.js",
    "icon.js",
    "image.js",
    "link.js",
    "page.js",
    "paragraph.js",
    "section.js",
    "select.js",
    "spinner.js",
    "stack.js",
    "table.js",
    "text.js",
    "textfield.js",
  ];

  for (const transform of transforms) {
    runTransform(transform, targetDir);
  }
}

main();
