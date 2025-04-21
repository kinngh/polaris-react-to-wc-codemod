export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Rename <DataTable> and <IndexTable> to <s-table>, dropping all their props
  ["DataTable", "IndexTable"].forEach((oldName) => {
    // Opening tags
    root
      .find(j.JSXOpeningElement, {
        name: { type: "JSXIdentifier", name: oldName },
      })
      .forEach((path) => {
        path.node.name.name = "s-table";
        // Remove all attributes (no direct 1:1 mapping)
        path.node.attributes = [];
      });

    // Self‑closing tags
    root
      .find(j.JSXSelfClosingElement, {
        name: { type: "JSXIdentifier", name: oldName },
      })
      .forEach((path) => {
        path.node.name.name = "s-table";
        path.node.attributes = [];
      });

    // Closing tags
    root
      .find(j.JSXClosingElement, {
        name: { type: "JSXIdentifier", name: oldName },
      })
      .forEach((path) => {
        path.node.name.name = "s-table";
      });
  });

  return root.toSource({ quote: "double" });
}
