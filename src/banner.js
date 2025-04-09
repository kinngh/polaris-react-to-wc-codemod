/**
 * Transforms React <Banner> usage to <s-banner>.
 *
 * 1) Renames <Banner> to <s-banner>.
 * 2) Renames closing </Banner> to </s-banner>.
 * 3) Leaves props as-is, including "tone", etc.
 */
export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Rename <Banner ...> -> <s-banner ...>
  root
    .find(j.JSXOpeningElement, {
      name: { type: "JSXIdentifier", name: "Banner" },
    })
    .forEach((path) => {
      path.node.name.name = "s-banner";
    });

  // Rename </Banner> -> </s-banner>
  root
    .find(j.JSXClosingElement, {
      name: { type: "JSXIdentifier", name: "Banner" },
    })
    .forEach((path) => {
      path.node.name.name = "s-banner";
    });

  return root.toSource();
}
