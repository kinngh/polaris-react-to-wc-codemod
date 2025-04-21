export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Rename <Divider> to <s-divider> and map props
  root
    .find(j.JSXOpeningElement, {
      name: { type: "JSXIdentifier", name: "Divider" },
    })
    .forEach((path) => {
      path.node.name.name = "s-divider";

      const newAttrs = [];

      path.node.attributes.forEach((attr) => {
        if (attr.type !== "JSXAttribute") {
          newAttrs.push(attr);
          return;
        }
        const name = attr.name.name;

        if (name === "borderColor") {
          // Map borderColor -> color, drop 'border-' prefix, skip transparent
          let raw;
          if (attr.value?.type === "StringLiteral") {
            raw = attr.value.value;
          } else if (
            attr.value?.type === "JSXExpressionContainer" &&
            (attr.value.expression.type === "StringLiteral" ||
              attr.value.expression.type === "Literal")
          ) {
            raw = attr.value.expression.value;
          }
          if (raw && raw !== "transparent") {
            const colorValue = raw.replace(/^border-/, "");
            newAttrs.push(
              j.jsxAttribute(
                j.jsxIdentifier("color"),
                j.stringLiteral(colorValue)
              )
            );
          }
          return;
        }

        if (name === "borderWidth") {
          // No equivalent prop on <s-divider>
          return;
        }

        newAttrs.push(attr);
      });

      path.node.attributes = newAttrs;
    });

  // Rename closing </Divider> to </s-divider>
  root
    .find(j.JSXClosingElement, {
      name: { type: "JSXIdentifier", name: "Divider" },
    })
    .forEach((path) => {
      path.node.name.name = "s-divider";
    });

  return root.toSource({ quote: "double" });
}
