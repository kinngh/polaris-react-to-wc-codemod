export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Rename <Select ...> to <s-select> and convert options prop to <s-option> children
  root
    .find(j.JSXOpeningElement, {
      name: { type: "JSXIdentifier", name: "Select" },
    })
    .forEach((path) => {
      path.node.name.name = "s-select";
      path.node.selfClosing = false;

      const attributes = path.node.attributes;
      let optionsIndex = -1;
      let optionsArray = null;

      attributes.forEach((attr, idx) => {
        if (
          attr.type === "JSXAttribute" &&
          attr.name.name === "options" &&
          attr.value?.type === "JSXExpressionContainer" &&
          attr.value.expression.type === "ArrayExpression"
        ) {
          optionsIndex = idx;
          optionsArray = attr.value.expression.elements;
        }
      });

      if (optionsIndex !== -1 && optionsArray) {
        // Remove options attribute
        attributes.splice(optionsIndex, 1);

        // Create <s-option> elements
        const optionElements = optionsArray
          .map((el) => {
            if (el.type === "ObjectExpression") {
              let labelNode = null;
              let valueNode = null;
              el.properties.forEach((prop) => {
                if (
                  prop.type === "ObjectProperty" &&
                  prop.key.type === "Identifier"
                ) {
                  if (prop.key.name === "label") {
                    labelNode = prop.value;
                  }
                  if (prop.key.name === "value") {
                    valueNode = prop.value;
                  }
                }
              });
              if (labelNode && valueNode) {
                const valueAttr = j.jsxAttribute(
                  j.jsxIdentifier("value"),
                  j.literal(valueNode.value)
                );
                const opening = j.jsxOpeningElement(
                  j.jsxIdentifier("s-option"),
                  [valueAttr],
                  false
                );
                const closing = j.jsxClosingElement(
                  j.jsxIdentifier("s-option")
                );
                const text = j.jsxText(labelNode.value);
                return j.jsxElement(opening, closing, [text], false);
              }
            }
            return null;
          })
          .filter(Boolean);

        // Insert children nodes and add closing tag
        const jsxElementPath = path.parentPath;
        jsxElementPath.node.children = optionElements;
        jsxElementPath.node.closingElement = j.jsxClosingElement(
          j.jsxIdentifier("s-select")
        );
      }
    });

  // Rename </Select> to </s-select>
  root
    .find(j.JSXClosingElement, {
      name: { type: "JSXIdentifier", name: "Select" },
    })
    .forEach((path) => {
      path.node.name.name = "s-select";
    });

  return root.toSource();
}
