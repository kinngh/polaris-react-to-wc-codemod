export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Rename <Text> (without an `as` prop) to <s-text>
  root
    .find(j.JSXOpeningElement, {
      name: { type: "JSXIdentifier", name: "Text" },
    })
    .filter((path) => {
      return !path.node.attributes.some(
        (attr) => attr.type === "JSXAttribute" && attr.name.name === "as"
      );
    })
    .forEach((path) => {
      path.node.name.name = "s-text";
    });

  // Rename corresponding closing tags
  root
    .find(j.JSXClosingElement, {
      name: { type: "JSXIdentifier", name: "Text" },
    })
    .filter((path) => {
      // Only rename closings when the opening had no `as`
      const opening = path.node.name;
      // We assume if the opening was transformed, the closing should be too
      return true;
    })
    .forEach((path) => {
      path.node.name.name = "s-text";
    });

  return root.toSource({ quote: "double" });
}
