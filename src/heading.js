export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  const validLevels = ["h1", "h2", "h3", "h4", "h5"];

  // Transform <Text as="h1">... to <s-heading>
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
          ((attr.value?.type === "Literal" &&
            validLevels.includes(attr.value.value)) ||
            (attr.value?.type === "StringLiteral" &&
              validLevels.includes(attr.value.value)))
      );
      if (asIndex === -1) return;

      // Rename tag
      path.node.name.name = "s-heading";

      // Remove the `as` attribute
      attrs.splice(asIndex, 1);
    });

  // Transform closing </Text> to </s-heading> when matched opening had as="h1"-"h5"
  root
    .find(j.JSXClosingElement, {
      name: { type: "JSXIdentifier", name: "Text" },
    })
    .forEach((path) => {
      // We can't check the `as` on closing, so assume any closing </Text> after an opening transform
      path.node.name.name = "s-heading";
    });

  return root.toSource({ quote: "double" });
}
