# [WIP] Polaris React to Web Components Codemod

A minimal migrator for converting Polaris React components into Web Components.
The migration isn't perfect and still misses a lot of baselines, but is a good starting point.

## Usage

Run the codemod by pointing it at the directory containing your JSX files:

```bash
bun index.js ./path/to/your/files
```

The script will sequentially invoke each transform in the `src/` folder on the provided directory.

## Notes

I've been using Polaris Web Components for a while and wanted to automate most of the renaming and
prop mapping. Building this has been a learning exercise, so expect rough edges and experiments.
