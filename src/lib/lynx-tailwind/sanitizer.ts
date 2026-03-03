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
const OKLCH_FUNCTION_PATTERN = /oklch\(([^)]+)\)/gi;

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

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function parseAlpha(alphaToken: string | undefined): number | null {
  if (!alphaToken) {
    return null;
  }

  const trimmedAlpha = alphaToken.trim();

  if (trimmedAlpha.length === 0) {
    return null;
  }

  if (trimmedAlpha.endsWith("%")) {
    const percentage = Number.parseFloat(trimmedAlpha.slice(0, -1));

    if (!Number.isFinite(percentage)) {
      return null;
    }

    return clamp(percentage / 100, 0, 1);
  }

  const alpha = Number.parseFloat(trimmedAlpha);

  if (!Number.isFinite(alpha)) {
    return null;
  }

  return clamp(alpha, 0, 1);
}

function toSrgbChannel(linearChannel: number): number {
  if (!Number.isFinite(linearChannel)) {
    return 0;
  }

  const clampedLinearChannel = clamp(linearChannel, 0, 1);

  if (clampedLinearChannel <= 0.0031308) {
    return 12.92 * clampedLinearChannel;
  }

  return 1.055 * clampedLinearChannel ** (1 / 2.4) - 0.055;
}

function convertSingleOklchColor(value: string): string | null {
  const [mainPart, alphaPart] = value.split("/");
  const channels = mainPart
    .trim()
    .replace(/,/g, " ")
    .split(/\s+/)
    .filter((channel: string) => channel.length > 0);

  if (channels.length < 3) {
    return null;
  }

  const lightnessToken = channels[0];
  const chromaToken = channels[1];
  const hueToken = channels[2];

  const lightness = lightnessToken.endsWith("%")
    ? Number.parseFloat(lightnessToken.slice(0, -1)) / 100
    : Number.parseFloat(lightnessToken);
  const chroma = Number.parseFloat(chromaToken);
  const hueDegrees = Number.parseFloat(hueToken);

  if (!Number.isFinite(lightness) || !Number.isFinite(chroma) || !Number.isFinite(hueDegrees)) {
    return null;
  }

  const alpha = parseAlpha(alphaPart);
  const hueRadians = (hueDegrees * Math.PI) / 180;
  const a = chroma * Math.cos(hueRadians);
  const b = chroma * Math.sin(hueRadians);

  const lPrime = lightness + 0.3963377774 * a + 0.2158037573 * b;
  const mPrime = lightness - 0.1055613458 * a - 0.0638541728 * b;
  const sPrime = lightness - 0.0894841775 * a - 1.291485548 * b;

  const l = lPrime ** 3;
  const m = mPrime ** 3;
  const s = sPrime ** 3;

  const linearRed = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const linearGreen = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const linearBlue = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  const red = Math.round(toSrgbChannel(linearRed) * 255);
  const green = Math.round(toSrgbChannel(linearGreen) * 255);
  const blue = Math.round(toSrgbChannel(linearBlue) * 255);

  if (alpha === null || alpha >= 1) {
    return `rgb(${red}, ${green}, ${blue})`;
  }

  return `rgba(${red}, ${green}, ${blue}, ${formatDecimal(alpha)})`;
}

function convertOklchColors(value: string): string {
  return value.replace(OKLCH_FUNCTION_PATTERN, (fullMatch, innerValue: string) => {
    const converted = convertSingleOklchColor(innerValue);
    return converted ?? fullMatch;
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

  let match: RegExpExecArray | null = PSEUDO_SELECTOR_PATTERN.exec(selector);

  while (match !== null) {
    const pseudo = match[1]?.toLowerCase();

    if (!pseudo) {
      match = PSEUDO_SELECTOR_PATTERN.exec(selector);
      continue;
    }

    if (!options.allowedPseudoSelectors.has(pseudo)) {
      return true;
    }

    match = PSEUDO_SELECTOR_PATTERN.exec(selector);
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

  const valueWithCompatibleColors = convertOklchColors(valueAfterInlineAndUnitConversion);

  if (valueWithCompatibleColors.toLowerCase().includes("oklch(")) {
    declaration.remove();
    return;
  }

  declaration.value = valueWithCompatibleColors;
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
