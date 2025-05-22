# [WIP] Polaris React to Web Components Codemod

A minimal migrator for converting Polaris React Components into Web Components. The migration isn't perfect and still misses a lot of baselines, but is a good starting point

Open `src/index.js` and update `const targetDir = path.join(process.cwd(), "pages", "react");` to point to your dir of jsx files. CLI coming in later patches.

## Notes

I've been using Polaris Web Components for a decent while and wanted to do most of the heavy lifting of renaming components and bringing over most of the props and functions over to the new format. The idea of building this is to learn how codemods work so there's going to be a whole lot of experiments with this repo.
