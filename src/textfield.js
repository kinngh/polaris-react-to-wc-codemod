/**
 * Transform React <TextField> usage into the appropriate specialized web component.
 *
 * 1) Check the `type` prop (if any) to decide which WC to use:
 *    - none => <s-text-field>
 *    - email => <s-email-field>
 *    - password => <s-password-field>
 *    - number => <s-number-field>
 *    - currency => <s-money-field>
 *
 * 2) Remove the `type` prop afterwards.
 *
 * 3) Rename `helpText` => `details`.
 *
 * 4) Rename `onChange` => `oninput`.
 *
 * 5) If we're converting to `<s-text-field>`, rename the `value` prop => `defaultValue`.
 *    All other fields keep it as `value`.
 *
 * 6) If converting to `<s-money-field>` and `prefix` is present, rename `prefix` => `currencyCode`.
 *    Otherwise keep `prefix` as-is for number or text fields.
 *
 * 7) If the `value` (or `defaultValue`) prop is a numeric literal, convert it to a string literal
 *    (e.g., value={112233} => value="112233").
 *
 * 8) Rename closing tags accordingly if they exist: </TextField> => </s-text-field>, etc.
 */
export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  function mapTypeToComponent(typeValue) {
    switch (typeValue) {
      case "email":
        return "s-email-field";
      case "password":
        return "s-password-field";
      case "number":
        return "s-number-field";
      case "currency":
        return "s-money-field";
      default:
        return "s-text-field";
    }
  }

  root
    .find(j.JSXOpeningElement, {
      name: { type: "JSXIdentifier", name: "TextField" },
    })
    .forEach((path) => {
      const { node } = path;
      let finalName = "s-text-field"; // default
      let typeAttrIndex = -1;

      // 1) determine final component based on `type`
      node.attributes.forEach((attr, index) => {
        if (attr.type === "JSXAttribute" && attr.name.name === "type") {
          // We only handle a literal or string-based type here
          if (
            attr.value &&
            (attr.value.type === "Literal" ||
              attr.value.type === "StringLiteral")
          ) {
            finalName = mapTypeToComponent(attr.value.value);
          }
          typeAttrIndex = index;
        }
      });

      // 2) remove the `type` attribute
      if (typeAttrIndex >= 0) {
        node.attributes.splice(typeAttrIndex, 1);
      }

      // rename opening tag from <TextField> to <s-???-field>
      node.name.name = finalName;

      // 3) rename helpText => details
      // 4) rename onChange => oninput
      // 5) handle value => defaultValue (for s-text-field)
      // 6) handle prefix => currencyCode if finalName === 's-money-field'
      node.attributes.forEach((attr) => {
        if (attr.type === "JSXAttribute") {
          const { name } = attr.name;

          if (name === "helpText") {
            attr.name.name = "details";
          }

          if (name === "onChange") {
            attr.name.name = "oninput";
          }

          if (finalName === "s-text-field" && name === "value") {
            // rename `value` => `defaultValue`
            attr.name.name = "defaultValue";
          }

          if (finalName === "s-money-field" && name === "prefix") {
            // rename `prefix` => `currencyCode`
            attr.name.name = "currencyCode";
          }
        }
      });

      // 7) If the prop (value or defaultValue) is a numeric literal, convert it to a string literal.
      node.attributes.forEach((attr) => {
        if (attr.type === "JSXAttribute") {
          const attrName = attr.name.name;
          if (
            (attrName === "value" || attrName === "defaultValue") &&
            attr.value &&
            attr.value.type === "JSXExpressionContainer" &&
            attr.value.expression.type === "Literal" &&
            typeof attr.value.expression.value === "number"
          ) {
            const numericVal = attr.value.expression.value;
            attr.value = j.stringLiteral(String(numericVal));
          }
        }
      });
    });

  // 8) Rename closing tag if present
  root
    .find(j.JSXClosingElement, {
      name: { type: "JSXIdentifier", name: "TextField" },
    })
    .forEach((path) => {
      // We can figure out which final name was used by matching the opening,
      // but a simpler approach is to rely on the type attribute from the opening if needed.
      // For now, assume default "s-text-field" if we can't find the corresponding opening easily.
      // We'll do a safer approach: find the matching opening if possible.

      const opening = path.parent.node.openingElement;
      if (
        opening &&
        opening.name &&
        opening.name.type === "JSXIdentifier" &&
        opening.name.name.startsWith("s-") // e.g. "s-text-field", "s-money-field", etc
      ) {
        path.node.name.name = opening.name.name;
      } else {
        // fallback
        path.node.name.name = "s-text-field";
      }
    });

  return root.toSource();
}
