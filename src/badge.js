export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Rename <Badge> to <s-badge> and map supported props
  root
    .find(j.JSXOpeningElement, {
      name: { type: "JSXIdentifier", name: "Badge" },
    })
    .forEach((path) => {
      path.node.name.name = "s-badge";

      const newAttrs = [];

      path.node.attributes.forEach((attr) => {
        if (attr.type !== "JSXAttribute") return;

        const { name, value } = attr;
        switch (name.name) {
          case "tone":
            // <Badge tone="info" /> → <s-badge tone="info" />
            newAttrs.push(j.jsxAttribute(j.jsxIdentifier("tone"), value));
            break;

          case "icon":
            // <Badge icon={PlusCircleIcon} /> → <s-badge icon="plus-circle" />
            if (
              value &&
              value.type === "JSXExpressionContainer" &&
              (value.expression.type === "Identifier" ||
                value.expression.type === "MemberExpression")
            ) {
              const expr = value.expression;
              const iconName =
                expr.type === "Identifier" ? expr.name : expr.property.name;
              const baseName = iconName.replace(/Icon$/, "");
              const kebab = baseName
                .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
                .toLowerCase();
              newAttrs.push(
                j.jsxAttribute(j.jsxIdentifier("icon"), j.stringLiteral(kebab))
              );
            }
            break;

          case "size":
            // Preserve size attribute (values may need manual adjustment)
            newAttrs.push(j.jsxAttribute(j.jsxIdentifier("size"), value));
            break;

          // drop `progress`, `toneAndProgressLabelOverride`, `children`, and all other props
        }
      });

      path.node.attributes = newAttrs;
    });

  // Rename closing </Badge> to </s-badge>
  root
    .find(j.JSXClosingElement, {
      name: { type: "JSXIdentifier", name: "Badge" },
    })
    .forEach((path) => {
      path.node.name.name = "s-badge";
    });

  return root.toSource({ quote: "double" });
}
