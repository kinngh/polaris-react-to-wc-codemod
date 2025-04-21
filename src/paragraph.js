export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Transform <Text as="p">…</Text> → <s-paragraph>…</s-paragraph>
  root
    .find(j.JSXOpeningElement, {
      name: { type: "JSXIdentifier", name: "Text" },
    })
    .forEach((path) => {
      const attrs = path.node.attributes;
      const asIndex = attrs.findIndex(
        (attr) =>
          attr.type === "JSXAttribute" &&
          attr.name.name === "as" &&
          attr.value &&
          (attr.value.type === "Literal" ||
            attr.value.type === "StringLiteral") &&
          attr.value.value === "p"
      );
      if (asIndex === -1) return;

      // Rename tag
      path.node.name.name = "s-paragraph";
      // Remove the as="p" attribute
      attrs.splice(asIndex, 1);
    });

  // Rename matching closing tags
  root
    .find(j.JSXClosingElement, {
      name: { type: "JSXIdentifier", name: "Text" },
    })
    .forEach((path) => {
      path.node.name.name = "s-paragraph";
    });

  return root.toSource({ quote: "double" });
}
