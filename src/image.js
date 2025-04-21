export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Rename <Image source=... /> to <s-image src=... inlineSize="auto" />
  root
    .find(j.JSXOpeningElement, {
      name: { type: "JSXIdentifier", name: "Image" },
    })
    .forEach((path) => {
      path.node.name.name = "s-image";

      let hasInlineSize = false;
      path.node.attributes.forEach((attr) => {
        if (attr.type === "JSXAttribute") {
          const attrName = attr.name.name;

          if (attrName === "source") {
            // change source -> src
            attr.name.name = "src";
            // normalize value to string literal
            if (attr.value?.type === "Literal") {
              attr.value = j.stringLiteral(attr.value.value);
            }
          }

          if (attrName === "inlineSize") {
            hasInlineSize = true;
          }
        }
      });

      if (!hasInlineSize) {
        path.node.attributes.push(
          j.jsxAttribute(j.jsxIdentifier("inlineSize"), j.stringLiteral("auto"))
        );
      }
    });

  // Rename closing </Image> to </s-image>
  root
    .find(j.JSXClosingElement, {
      name: { type: "JSXIdentifier", name: "Image" },
    })
    .forEach((path) => {
      path.node.name.name = "s-image";
    });

  return root.toSource();
}
