export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // InlineStack → s‑stack
  root
    .find(j.JSXOpeningElement, {
      name: { type: "JSXIdentifier", name: "InlineStack" },
    })
    .forEach((path) => {
      const node = path.node;
      node.name.name = "s-stack";
      node.attributes = node.attributes.filter((attr) => {
        if (attr.type !== "JSXAttribute") return true;
        const n = attr.name.name;
        if (n === "as" || n === "wrap") return false;
        if (n === "align") {
          attr.name.name = "justifyContent";
          return true;
        }
        if (n === "blockAlign") {
          attr.name.name = "alignItems";
          return true;
        }
        if (n === "gap") {
          attr.name.name = "gap";
          return true;
        }
        if (n === "direction") {
          attr.name.name = "direction";
          if (
            attr.value &&
            (attr.value.type === "Literal" ||
              attr.value.type === "StringLiteral")
          ) {
            attr.value = j.stringLiteral("inline");
          }
          return true;
        }
        return true;
      });
    });

  root
    .find(j.JSXClosingElement, {
      name: { type: "JSXIdentifier", name: "InlineStack" },
    })
    .forEach((path) => {
      path.node.name.name = "s-stack";
    });

  // BlockStack → s‑stack
  root
    .find(j.JSXOpeningElement, {
      name: { type: "JSXIdentifier", name: "BlockStack" },
    })
    .forEach((path) => {
      const node = path.node;
      node.name.name = "s-stack";
      node.attributes = node.attributes.filter((attr) => {
        if (attr.type !== "JSXAttribute") return true;
        const n = attr.name.name;
        if (n === "as" || n === "id" || n === "reverseOrder" || n === "role")
          return false;
        if (n === "align") {
          attr.name.name = "justifyContent";
          return true;
        }
        if (n === "inlineAlign") {
          attr.name.name = "alignItems";
          return true;
        }
        if (n === "gap") {
          attr.name.name = "gap";
          return true;
        }
        return true;
      });
      const hasDir = node.attributes.some(
        (attr) => attr.type === "JSXAttribute" && attr.name.name === "direction"
      );
      if (!hasDir) {
        node.attributes.push(
          j.jsxAttribute(j.jsxIdentifier("direction"), j.stringLiteral("block"))
        );
      }
    });

  root
    .find(j.JSXClosingElement, {
      name: { type: "JSXIdentifier", name: "BlockStack" },
    })
    .forEach((path) => {
      path.node.name.name = "s-stack";
    });

  return root.toSource({ quote: "double" });
}
