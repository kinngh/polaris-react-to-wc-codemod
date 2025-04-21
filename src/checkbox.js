/**
 * Transforms React <Checkbox> usage to <s-checkbox>.
 *
 * 1) Renames <Checkbox> to <s-checkbox>.
 * 2) Renames closing </Checkbox> to </s-checkbox>.
 * 3) Renames `helpText` => `details`.
 * 4) Removes `onChange` prop entirely (based on final snippet).
 * 5) Leaves other props (e.g. `checked`) unchanged.
 */
export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Rename <Checkbox ...> -> <s-checkbox ...>
  root
    .find(j.JSXOpeningElement, {
      name: { type: "JSXIdentifier", name: "Checkbox" },
    })
    .forEach((path) => {
      path.node.name.name = "s-checkbox";

      // Look through attributes
      // 3) rename helpText => details
      // 4) remove onChange
      path.node.attributes = path.node.attributes.filter((attr) => {
        if (attr.type === "JSXAttribute") {
          const attrName = attr.name.name;

          if (attrName === "helpText") {
            attr.name.name = "details";
          }

          if (attrName === "onChange") {
            return false; // remove this prop
          }
        }
        return true;
      });
    });

  // Rename </Checkbox> -> </s-checkbox>
  root
    .find(j.JSXClosingElement, {
      name: { type: "JSXIdentifier", name: "Checkbox" },
    })
    .forEach((path) => {
      path.node.name.name = "s-checkbox";
    });

  return root.toSource();
}
