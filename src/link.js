/**
 * Transforms React <Link> usage to <s-link>.
 *
 * 1) Renames <Link> to <s-link>.
 * 2) Renames closing </Link> to </s-link>.
 * 3) Replaces onClick -> onclick.
 * 4) Replaces `url` prop with `href`.
 */
export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // 1) & 2) Rename <Link ...> -> <s-link ...> and </Link> -> </s-link>
  root
    .find(j.JSXOpeningElement, {
      name: { type: "JSXIdentifier", name: "Link" },
    })
    .forEach((path) => {
      path.node.name.name = "s-link";
    });

  root
    .find(j.JSXClosingElement, {
      name: { type: "JSXIdentifier", name: "Link" },
    })
    .forEach((path) => {
      path.node.name.name = "s-link";
    });

  // Adjust attributes
  root
    .find(j.JSXOpeningElement, {
      name: { type: "JSXIdentifier", name: "s-link" },
    })
    .forEach((path) => {
      path.node.attributes.forEach((attr) => {
        if (attr.type === "JSXAttribute") {
          const attributeName = attr.name.name;

          // 3) onClick -> onclick
          if (attributeName === "onClick") {
            attr.name.name = "onclick";
          }

          // 4) url -> href (keep the value as-is)
          if (attributeName === "url") {
            attr.name.name = "href";
          }
        }
      });
    });

  return root.toSource();
}
