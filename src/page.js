export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  root
    .find(j.JSXElement, {
      openingElement: { name: { type: "JSXIdentifier", name: "Page" } },
    })
    .forEach((path) => {
      const { node } = path;
      const attrs = node.openingElement.attributes;

      let fullWidthAttr;
      let titleAttr;
      let backActionAttr;
      let primaryActionAttr;
      let secondaryActionsAttr;

      // Extract and remove the props we’ll re‑render as children
      attrs.forEach((attr, i) => {
        if (attr.type !== "JSXAttribute") return;
        switch (attr.name.name) {
          case "fullWidth":
            fullWidthAttr = attr;
            attrs.splice(i, 1);
            break;
          case "title":
            titleAttr = attr;
            attrs.splice(i, 1);
            break;
          case "backAction":
            backActionAttr = attr;
            attrs.splice(i, 1);
            break;
          case "primaryAction":
            primaryActionAttr = attr;
            attrs.splice(i, 1);
            break;
          case "secondaryActions":
            secondaryActionsAttr = attr;
            attrs.splice(i, 1);
            break;
        }
      });

      // Rename tag
      node.openingElement.name.name = "s-page";
      if (node.closingElement) {
        node.closingElement.name.name = "s-page";
      }

      // Build inlineSize attribute
      let inlineSizeAttr;
      if (fullWidthAttr) {
        const expr = fullWidthAttr.value.expression;
        if (expr.type === "Literal" && typeof expr.value === "boolean") {
          inlineSizeAttr = j.jsxAttribute(
            j.jsxIdentifier("inlineSize"),
            j.stringLiteral(expr.value ? "large" : "base")
          );
        } else {
          inlineSizeAttr = j.jsxAttribute(
            j.jsxIdentifier("inlineSize"),
            j.jsxExpressionContainer(
              j.conditionalExpression(
                expr,
                j.stringLiteral("large"),
                j.stringLiteral("base")
              )
            )
          );
        }
      } else {
        inlineSizeAttr = j.jsxAttribute(
          j.jsxIdentifier("inlineSize"),
          j.stringLiteral("base")
        );
      }
      attrs.push(inlineSizeAttr);

      // Helper to pull .onAction and .content out of an ObjectExpression
      function getProp(expr, key) {
        if (expr.type !== "ObjectExpression") return;
        const prop = expr.properties.find(
          (p) => p.type === "ObjectProperty" && p.key.name === key
        );
        return prop && prop.value;
      }

      // Build the header <InlineStack>
      const headerStack = j.jsxElement(
        j.jsxOpeningElement(
          j.jsxIdentifier("InlineStack"),
          [
            j.jsxAttribute(
              j.jsxIdentifier("direction"),
              j.stringLiteral("inline")
            ),
            j.jsxAttribute(
              j.jsxIdentifier("alignItems"),
              j.stringLiteral("center")
            ),
            j.jsxAttribute(
              j.jsxIdentifier("justifyContent"),
              j.stringLiteral("space-between")
            ),
            j.jsxAttribute(
              j.jsxIdentifier("paddingBlockEnd"),
              j.stringLiteral("base")
            ),
          ],
          false
        ),
        j.jsxClosingElement(j.jsxIdentifier("InlineStack")),
        []
      );

      // Left side: back button + title
      const leftStack = j.jsxElement(
        j.jsxOpeningElement(
          j.jsxIdentifier("InlineStack"),
          [
            j.jsxAttribute(
              j.jsxIdentifier("alignItems"),
              j.stringLiteral("center")
            ),
          ],
          false
        ),
        j.jsxClosingElement(j.jsxIdentifier("InlineStack")),
        []
      );

      if (backActionAttr) {
        const backObj = backActionAttr.value.expression;
        const onActionExpr = getProp(backObj, "onAction");
        leftStack.children.push(
          j.jsxElement(
            j.jsxOpeningElement(
              j.jsxIdentifier("Button"),
              [
                j.jsxAttribute(
                  j.jsxIdentifier("icon"),
                  j.stringLiteral("arrow-left")
                ),
                j.jsxAttribute(
                  j.jsxIdentifier("tone"),
                  j.stringLiteral("neutral")
                ),
                j.jsxAttribute(
                  j.jsxIdentifier("variant"),
                  j.stringLiteral("tertiary")
                ),
                j.jsxAttribute(
                  j.jsxIdentifier("accessibilityLabel"),
                  j.stringLiteral("Go back")
                ),
                onActionExpr &&
                  j.jsxAttribute(
                    j.jsxIdentifier("onClick"),
                    j.jsxExpressionContainer(onActionExpr)
                  ),
              ].filter(Boolean),
              true
            ),
            null,
            []
          )
        );
      }

      if (titleAttr) {
        const titleValue =
          titleAttr.value.type === "StringLiteral"
            ? titleAttr.value.value
            : titleAttr.value.expression.value;
        leftStack.children.push(
          j.jsxElement(
            j.jsxOpeningElement(j.jsxIdentifier("Heading"), [], false),
            j.jsxClosingElement(j.jsxIdentifier("Heading")),
            [j.jsxText(titleValue)]
          )
        );
      }

      headerStack.children.push(leftStack);

      // Right side: primaryAction + secondaryActions
      const rightStack = j.jsxElement(
        j.jsxOpeningElement(
          j.jsxIdentifier("InlineStack"),
          [j.jsxAttribute(j.jsxIdentifier("gap"), j.stringLiteral("small"))],
          false
        ),
        j.jsxClosingElement(j.jsxIdentifier("InlineStack")),
        []
      );

      if (primaryActionAttr) {
        const primObj = primaryActionAttr.value.expression;
        const content = getProp(primObj, "content").value;
        const onActionExpr = getProp(primObj, "onAction");
        rightStack.children.push(
          j.jsxElement(
            j.jsxOpeningElement(
              j.jsxIdentifier("Button"),
              [
                j.jsxAttribute(
                  j.jsxIdentifier("variant"),
                  j.stringLiteral("primary")
                ),
                onActionExpr &&
                  j.jsxAttribute(
                    j.jsxIdentifier("onClick"),
                    j.jsxExpressionContainer(onActionExpr)
                  ),
              ].filter(Boolean),
              false
            ),
            j.jsxClosingElement(j.jsxIdentifier("Button")),
            [j.jsxText(content)]
          )
        );
      }

      if (secondaryActionsAttr) {
        const secArr = secondaryActionsAttr.value.expression.elements;
        secArr.forEach((el) => {
          if (el.type === "ObjectExpression") {
            const content = getProp(el, "content").value;
            const onActionExpr = getProp(el, "onAction");
            rightStack.children.push(
              j.jsxElement(
                j.jsxOpeningElement(
                  j.jsxIdentifier("Button"),
                  [
                    j.jsxAttribute(
                      j.jsxIdentifier("variant"),
                      j.stringLiteral("secondary")
                    ),
                    onActionExpr &&
                      j.jsxAttribute(
                        j.jsxIdentifier("onClick"),
                        j.jsxExpressionContainer(onActionExpr)
                      ),
                  ].filter(Boolean),
                  false
                ),
                j.jsxClosingElement(j.jsxIdentifier("Button")),
                [j.jsxText(content)]
              )
            );
          }
        });
      }

      headerStack.children.push(rightStack);

      // Inject headerStack before original children
      node.children = [headerStack, ...node.children];
    });

  return root.toSource({ quote: "double" });
}
