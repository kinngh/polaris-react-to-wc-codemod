export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Rename <Grid> to <s-grid> and drop unsupported props
  root
    .find(j.JSXOpeningElement, {
      name: { type: "JSXIdentifier", name: "Grid" },
    })
    .forEach((path) => {
      path.node.name.name = "s-grid";
      path.node.attributes = path.node.attributes.filter((attr) => {
        if (attr.type !== "JSXAttribute") return true;
        const prop = attr.name.name;
        if (prop === "areas" || prop === "columns") return false;
        return true;
      });
    });

  // Rename closing </Grid> to </s-grid>
  root
    .find(j.JSXClosingElement, {
      name: { type: "JSXIdentifier", name: "Grid" },
    })
    .forEach((path) => {
      path.node.name.name = "s-grid";
    });

  // Rename <Grid.Cell> to <s-grid-item>
  root
    .find(j.JSXOpeningElement, {
      name: {
        type: "JSXMemberExpression",
        object: { name: "Grid" },
        property: { name: "Cell" },
      },
    })
    .forEach((path) => {
      path.node.name = j.jsxIdentifier("s-grid-item");
    });

  // Rename closing </Grid.Cell> to </s-grid-item>
  root
    .find(j.JSXClosingElement, {
      name: {
        type: "JSXMemberExpression",
        object: { name: "Grid" },
        property: { name: "Cell" },
      },
    })
    .forEach((path) => {
      path.node.name = j.jsxIdentifier("s-grid-item");
    });

  return root.toSource({ quote: "double" });
}
