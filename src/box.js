export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Rename <Box> to <s-box> and map props
  root
    .find(j.JSXOpeningElement, {
      name: { type: "JSXIdentifier", name: "Box" },
    })
    .forEach((path) => {
      path.node.name.name = "s-box";

      path.node.attributes = path.node.attributes.filter((attr) => {
        if (attr.type !== "JSXAttribute") return true;
        const name = attr.name.name;

        // Drop unsupported or 1:1-missing props
        if (
          [
            "as",
            "overflowX",
            "overflowY",
            "position",
            "insetBlockStart",
            "insetBlockEnd",
            "insetInlineStart",
            "insetInlineEnd",
            "shadow",
            "color",
            "outlineColor",
            "outlineStyle",
            "outlineWidth",
            "printHidden",
            "visuallyHidden",
            "zIndex",
            "opacity",
          ].includes(name)
        ) {
          return false;
        }

        // Rename props
        switch (name) {
          case "role":
            attr.name.name = "accessibilityRole";
            return true;
          case "className":
            attr.name.name = "class";
            return true;
          case "tabIndex":
            attr.name.name = "tabindex";
            return true;
          case "width":
            attr.name.name = "inlineSize";
            return true;
          case "minHeight":
            attr.name.name = "minBlockSize";
            return true;
          case "minWidth":
            attr.name.name = "minInlineSize";
            return true;
          case "maxWidth":
            attr.name.name = "maxInlineSize";
            return true;
          default:
            return true;
        }
      });
    });

  // Rename closing </Box> to </s-box>
  root
    .find(j.JSXClosingElement, {
      name: { type: "JSXIdentifier", name: "Box" },
    })
    .forEach((path) => {
      path.node.name.name = "s-box";
    });

  return root.toSource({ quote: "double" });
}
