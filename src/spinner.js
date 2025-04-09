/**
 * Transforms React <Spinner> usage to <s-spinner>.
 *
 * 1) Renames <Spinner> to <s-spinner>.
 * 2) Renames closing </Spinner> to </s-spinner>.
 * 3) Maps the "size" prop to the "value" prop with the following rules:
 *    - If no size is provided, default to value="large"
 *    - size="small" => value="base"
 *    - size="large" => value="large"
 *    - size="large-100" => value="large-100"
 *
 * Adjust or expand if you have other sizes.
 */
export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // 1) Rename <Spinner ...> -> <s-spinner ...>
  root
    .find(j.JSXOpeningElement, {
      name: { type: "JSXIdentifier", name: "Spinner" },
    })
    .forEach((path) => {
      path.node.name.name = "s-spinner";

      // Look for size prop
      let hasSize = false;
      path.node.attributes.forEach((attr) => {
        if (attr.type === "JSXAttribute" && attr.name.name === "size") {
          hasSize = true;
          // We assume literal or string-literal. If it's more complex, you'll need to handle it.
          if (attr.value && attr.value.type === "Literal") {
            const sizeValue = attr.value.value;
            // Map sizeValue -> valueValue
            switch (sizeValue) {
              case "small":
                attr.name.name = "value";
                attr.value.value = "base";
                break;
              case "large":
                attr.name.name = "value";
                attr.value.value = "large";
                break;
              case "large-100":
                attr.name.name = "value";
                attr.value.value = "large-100";
                break;
              default:
                // If some unknown size, fallback or leave as is
                attr.name.name = "value";
                break;
            }
          } else {
            // If it's not a simple literal, just rename the prop to "value"
            attr.name.name = "value";
          }
        }
      });

      // If no size attribute was found, add `value="large"`
      if (!hasSize) {
        path.node.attributes.push(
          j.jsxAttribute(j.jsxIdentifier("value"), j.stringLiteral("large"))
        );
      }
    });

  // 2) Rename </Spinner> -> </s-spinner>
  root
    .find(j.JSXClosingElement, {
      name: { type: "JSXIdentifier", name: "Spinner" },
    })
    .forEach((path) => {
      path.node.name.name = "s-spinner";
    });

  return root.toSource();
}
