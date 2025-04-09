export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Rename <Button ...> to <s-button ...> and adjust attributes
  root
    .find(j.JSXOpeningElement, {
      name: { type: "JSXIdentifier", name: "Button" },
    })
    .forEach((path) => {
      path.node.name.name = "s-button";

      // Adjust props
      path.node.attributes.forEach((attr) => {
        if (attr.type === "JSXAttribute") {
          const attributeName = attr.name.name;

          // onClick -> onclick
          if (attributeName === "onClick") {
            attr.name.name = "onclick";
          }

          // icon={PlusIcon} -> icon="plus"
          if (
            attributeName === "icon" &&
            attr.value?.type === "JSXExpressionContainer"
          ) {
            const expr = attr.value.expression;
            if (expr.type === "Identifier" && expr.name === "PlusIcon") {
              attr.value = j.stringLiteral("plus");
            }
          }

          // loading -> loading={true} if no value
          if (attributeName === "loading" && !attr.value) {
            attr.value = j.jsxExpressionContainer(j.booleanLiteral(true));
          }
        }
      });
    });

  // Rename </Button> to </s-button>
  root
    .find(j.JSXClosingElement, {
      name: { type: "JSXIdentifier", name: "Button" },
    })
    .forEach((path) => {
      path.node.name.name = "s-button";
    });

  return root.toSource();
}
