/**
 * Transforms React <Card> usage to <s-section>.
 *
 * 1) Renames <Card> to <s-section>.
 * 2) Renames closing </Card> to </s-section>.
 * 3) If there's a "padding" prop with the string "0", change it to "none".
 */
export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Rename <Card ...> -> <s-section ...>
  root
    .find(j.JSXOpeningElement, {
      name: { type: "JSXIdentifier", name: "Card" },
    })
    .forEach((path) => {
      path.node.name.name = "s-section";

      // If there's a padding="0", change it to padding="none"
      path.node.attributes.forEach((attr) => {
        if (attr.type === "JSXAttribute" && attr.name.name === "padding") {
          if (attr.value?.type === "Literal" && attr.value.value === "0") {
            attr.value.value = "none";
          }
        }
      });
    });

  // Rename </Card> -> </s-section>
  root
    .find(j.JSXClosingElement, {
      name: { type: "JSXIdentifier", name: "Card" },
    })
    .forEach((path) => {
      path.node.name.name = "s-section";
    });

  return root.toSource();
}
