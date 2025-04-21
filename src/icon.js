export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Rename <Icon source={X} /> to <s-icon type="x" />
  root
    .find(j.JSXOpeningElement, {
      name: { type: "JSXIdentifier", name: "Icon" },
    })
    .forEach((path) => {
      path.node.name.name = "s-icon";

      const attrs = path.node.attributes;
      let typeAttr = null;

      attrs.forEach((attr, idx) => {
        if (
          attr.type === "JSXAttribute" &&
          attr.name.name === "source" &&
          attr.value?.type === "JSXExpressionContainer"
        ) {
          const expr = attr.value.expression;
          let iconName = null;

          if (expr.type === "Identifier") {
            iconName = expr.name;
          } else if (
            expr.type === "MemberExpression" &&
            expr.property.type === "Identifier"
          ) {
            iconName = expr.property.name;
          }

          if (iconName) {
            const baseName = iconName.replace(/Icon$/, "");
            const kebab = baseName
              .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
              .toLowerCase();
            typeAttr = j.jsxAttribute(
              j.jsxIdentifier("type"),
              j.stringLiteral(kebab)
            );
          }

          attrs.splice(idx, 1);
        }
      });

      if (typeAttr) {
        attrs.push(typeAttr);
      }
    });

  // Rename </Icon> to </s-icon>
  root
    .find(j.JSXClosingElement, {
      name: { type: "JSXIdentifier", name: "Icon" },
    })
    .forEach((path) => {
      path.node.name.name = "s-icon";
    });

  return root.toSource();
}
