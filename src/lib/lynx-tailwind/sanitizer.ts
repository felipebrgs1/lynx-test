import type { AtRule, Declaration, Plugin, Root, Rule } from "postcss";

import {
  resolveLynxCssSanitizerOptions,
  type LynxCssSanitizerOptions,
  type ResolvedLynxCssSanitizerOptions,
} from "./options.js";

const REM_UNIT_PATTERN = /(-?\d*\.?\d+)rem\b/g;
const VIEWPORT_UNIT_PATTERN = /-?\d*\.?\d+(?:vh|vw|vmin|vmax|svh|lvh|dvh)\b/i;
const PSEUDO_SELECTOR_PATTERN = /(?<!\\)::?([a-z-]+)/gi;
const TRANSITION_PROPERTY_VALUE_PATTERN = /opacity|transform|none/i;

function formatDecimal(value: number): string {
  const rounded = Math.round(value * 10000) / 10000;

  if (Number.isInteger(rounded)) {
    return String(rounded);
  }

  return rounded.toString();
}

function convertRemUnits(value: string, options: ResolvedLynxCssSanitizerOptions): string {
  return value.replace(REM_UNIT_PATTERN, (_match, amountAsString: string) => {
    const remAmount = Number(amountAsString);

    if (!Number.isFinite(remAmount)) {
      return _match;
    }

    const pxValue = remAmount * options.remBasePx;
    const outputValue =
      options.targetLengthUnit === "rpx" ? pxValue * options.rpxPerPx : pxValue;

    return `${formatDecimal(outputValue)}${options.targetLengthUnit}`;
  });
}

function splitFirstComma(input: string): { name: string; fallback: string | null } {
  let depth = 0;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];

    if (char === "(") {
      depth += 1;
      continue;
    }

    if (char === ")") {
      depth = Math.max(0, depth - 1);
      continue;
    }

    if (char === "," && depth === 0) {
      return {
        name: input.slice(0, index).trim(),
        fallback: input.slice(index + 1).trim(),
      };
    }
  }

  return { name: input.trim(), fallback: null };
}

function findVarFunctionEnd(input: string, start: number): number {
  let depth = 1;

  for (let index = start; index < input.length; index += 1) {
    const char = input[index];

    if (char === "(") {
      depth += 1;
      continue;
    }

    if (char === ")") {
      depth -= 1;

      if (depth === 0) {
        return index;
      }
    }
  }

  return -1;
}

function inlineVariableFunctions(
  value: string,
  variables: Map<string, string>,
): { value: string; hasUnresolvedVariables: boolean } {
  let currentValue = value;
  let hasUnresolvedVariables = false;

  for (let iteration = 0; iteration < 10; iteration += 1) {
    const startIndex = currentValue.indexOf("var(");

    if (startIndex === -1) {
      break;
    }

    let result = "";
    let cursor = 0;
    let changed = false;

    while (cursor < currentValue.length) {
      const nextVarIndex = currentValue.indexOf("var(", cursor);

      if (nextVarIndex === -1) {
        result += currentValue.slice(cursor);
        break;
      }

      result += currentValue.slice(cursor, nextVarIndex);

      const closingIndex = findVarFunctionEnd(currentValue, nextVarIndex + 4);

      if (closingIndex === -1) {
        result += currentValue.slice(nextVarIndex);
        break;
      }

      const inside = currentValue.slice(nextVarIndex + 4, closingIndex);
      const { name, fallback } = splitFirstComma(inside);
      const replacement = variables.get(name);

      if (replacement !== undefined) {
        result += replacement;
      } else if (fallback && fallback.length > 0) {
        result += fallback;
      } else {
        hasUnresolvedVariables = true;
      }

      cursor = closingIndex + 1;
      changed = true;
    }

    currentValue = result;

    if (!changed) {
      break;
    }
  }

  return {
    value: currentValue.trim(),
    hasUnresolvedVariables,
  };
}

function hasUnsupportedPseudoSelector(
  selector: string,
  options: ResolvedLynxCssSanitizerOptions,
): boolean {
  PSEUDO_SELECTOR_PATTERN.lastIndex = 0;

  for (const match of selector.matchAll(PSEUDO_SELECTOR_PATTERN)) {
    const pseudo = match[1]?.toLowerCase();

    if (!pseudo) {
      continue;
    }

    if (!options.allowedPseudoSelectors.has(pseudo)) {
      return true;
    }
  }

  return false;
}

function collectCssVariables(root: Root, options: ResolvedLynxCssSanitizerOptions): void {
  root.walkDecls((declaration) => {
    if (!declaration.prop.startsWith("--")) {
      return;
    }

    options.inlineVariables.set(declaration.prop, declaration.value.trim());
  });
}

function isAllowedDisplayValue(
  declaration: Declaration,
  options: ResolvedLynxCssSanitizerOptions,
): boolean {
  if (declaration.prop.toLowerCase() !== "display") {
    return true;
  }

  return options.allowedDisplayValues.has(declaration.value.toLowerCase());
}

function isAllowedPositionValue(
  declaration: Declaration,
  options: ResolvedLynxCssSanitizerOptions,
): boolean {
  if (declaration.prop.toLowerCase() !== "position") {
    return true;
  }

  return options.allowedPositionValues.has(declaration.value.toLowerCase());
}

function isAllowedTransitionProperty(declaration: Declaration): boolean {
  if (declaration.prop.toLowerCase() !== "transition-property") {
    return true;
  }

  return declaration.value
    .split(",")
    .map((value) => value.trim())
    .every((value) => TRANSITION_PROPERTY_VALUE_PATTERN.test(value));
}

function sanitizeDeclaration(
  declaration: Declaration,
  options: ResolvedLynxCssSanitizerOptions,
): void {
  const property = declaration.prop.toLowerCase();

  if (property.startsWith("--")) {
    declaration.remove();
    return;
  }

  if (!options.allowedProperties.has(property)) {
    declaration.remove();
    return;
  }

  if (!isAllowedDisplayValue(declaration, options)) {
    // `display: block/inline` is removed because Lynx focuses on flex/grid layout.
    declaration.remove();
    return;
  }

  if (!isAllowedPositionValue(declaration, options)) {
    // Lynx has constrained support for position; fixed/sticky are intentionally dropped.
    declaration.remove();
    return;
  }

  if (!isAllowedTransitionProperty(declaration)) {
    // Keep transitions limited to transform/opacity for Lynx animation compatibility.
    declaration.remove();
    return;
  }

  const valueWithConvertedRem = convertRemUnits(declaration.value, options);
  const inlinedVariables = inlineVariableFunctions(valueWithConvertedRem, options.inlineVariables);

  if (inlinedVariables.hasUnresolvedVariables || inlinedVariables.value.length === 0) {
    declaration.remove();
    return;
  }

  const valueAfterInlineAndUnitConversion = convertRemUnits(inlinedVariables.value, options);

  if (VIEWPORT_UNIT_PATTERN.test(valueAfterInlineAndUnitConversion)) {
    declaration.remove();
    return;
  }

  declaration.value = valueAfterInlineAndUnitConversion;
}

function sanitizeAtRule(atRule: AtRule, options: ResolvedLynxCssSanitizerOptions): void {
  const atRuleName = atRule.name.toLowerCase();

  if (atRuleName === "layer") {
    if (!atRule.nodes || atRule.nodes.length === 0) {
      atRule.remove();
      return;
    }

    // Cascade layers are flattened because Lynx CSS does not rely on layer ordering.
    atRule.replaceWith(...atRule.nodes);
    return;
  }

  if (!options.allowedAtRules.has(atRuleName)) {
    atRule.remove();
  }
}

function sanitizeRule(rule: Rule, options: ResolvedLynxCssSanitizerOptions): void {
  if (hasUnsupportedPseudoSelector(rule.selector, options)) {
    // Remove unsupported pseudo selectors (e.g. :hover) to avoid runtime no-op styles.
    rule.remove();
    return;
  }

  rule.walkDecls((declaration) => {
    sanitizeDeclaration(declaration, options);
  });

  if (!rule.nodes || rule.nodes.length === 0) {
    rule.remove();
  }
}

function removeEmptyAtRules(root: Root): void {
  root.walkAtRules((atRule) => {
    if (!atRule.nodes) {
      return;
    }

    if (atRule.nodes.length === 0) {
      atRule.remove();
    }
  });
}

export function createLynxCssSanitizerPostcssPlugin(
  inputOptions: LynxCssSanitizerOptions = {},
): Plugin {
  return {
    postcssPlugin: "postcss-lynx-css-sanitizer",
    Once(root) {
      const options = resolveLynxCssSanitizerOptions(inputOptions);

      collectCssVariables(root, options);

      root.walkAtRules((atRule) => {
        sanitizeAtRule(atRule, options);
      });

      root.walkRules((rule) => {
        sanitizeRule(rule, options);
      });

      removeEmptyAtRules(root);
    },
  };
}
