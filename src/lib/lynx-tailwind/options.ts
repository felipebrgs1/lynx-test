export type LynxLengthUnit = "px" | "rpx";

export interface LynxCssSanitizerOptions {
  remBasePx?: number;
  targetLengthUnit?: LynxLengthUnit;
  rpxPerPx?: number;
  inlineVariables?: Record<string, string>;
  allowedProperties?: readonly string[];
  allowedAtRules?: readonly string[];
  allowedPseudoSelectors?: readonly string[];
  allowedDisplayValues?: readonly string[];
  allowedPositionValues?: readonly string[];
}

export interface ResolvedLynxCssSanitizerOptions {
  remBasePx: number;
  targetLengthUnit: LynxLengthUnit;
  rpxPerPx: number;
  inlineVariables: Map<string, string>;
  allowedProperties: Set<string>;
  allowedAtRules: Set<string>;
  allowedPseudoSelectors: Set<string>;
  allowedDisplayValues: Set<string>;
  allowedPositionValues: Set<string>;
}

const DEFAULT_ALLOWED_PROPERTIES = [
  "display",
  "position",
  "top",
  "right",
  "bottom",
  "left",
  "z-index",
  "width",
  "min-width",
  "max-width",
  "height",
  "min-height",
  "max-height",
  "flex",
  "flex-direction",
  "flex-wrap",
  "flex-grow",
  "flex-shrink",
  "flex-basis",
  "justify-content",
  "align-items",
  "align-self",
  "align-content",
  "gap",
  "row-gap",
  "column-gap",
  "margin",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "padding",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "border",
  "border-width",
  "border-style",
  "border-color",
  "border-top",
  "border-right",
  "border-bottom",
  "border-left",
  "border-radius",
  "border-top-left-radius",
  "border-top-right-radius",
  "border-bottom-left-radius",
  "border-bottom-right-radius",
  "background-color",
  "opacity",
  "color",
  "font-size",
  "font-weight",
  "font-style",
  "line-height",
  "letter-spacing",
  "text-align",
  "text-decoration",
  "white-space",
  "overflow",
  "overflow-x",
  "overflow-y",
  "box-shadow",
  "transform",
  "transform-origin",
  "transition",
  "transition-property",
  "transition-duration",
  "transition-delay",
  "transition-timing-function",
  "animation",
  "animation-name",
  "animation-duration",
  "animation-delay",
  "animation-iteration-count",
  "animation-direction",
  "animation-timing-function",
  "animation-fill-mode",
  "animation-play-state",
] as const;

const DEFAULT_ALLOWED_AT_RULES = ["media", "supports", "keyframes"] as const;
const DEFAULT_ALLOWED_PSEUDO_SELECTORS = ["root", "host"] as const;
const DEFAULT_ALLOWED_DISPLAY_VALUES = ["flex", "none", "grid"] as const;
const DEFAULT_ALLOWED_POSITION_VALUES = ["relative", "absolute", "static"] as const;

function toLowercaseSet(values: readonly string[]): Set<string> {
  return new Set(values.map((value) => value.toLowerCase()));
}

export function resolveLynxCssSanitizerOptions(
  options: LynxCssSanitizerOptions = {},
): ResolvedLynxCssSanitizerOptions {
  const inlineVariables = new Map<string, string>();

  for (const [key, value] of Object.entries(options.inlineVariables ?? {})) {
    inlineVariables.set(key.trim(), value.trim());
  }

  return {
    remBasePx: options.remBasePx ?? 16,
    targetLengthUnit: options.targetLengthUnit ?? "rpx",
    rpxPerPx: options.rpxPerPx ?? 2,
    inlineVariables,
    allowedProperties: toLowercaseSet(options.allowedProperties ?? DEFAULT_ALLOWED_PROPERTIES),
    allowedAtRules: toLowercaseSet(options.allowedAtRules ?? DEFAULT_ALLOWED_AT_RULES),
    allowedPseudoSelectors: toLowercaseSet(
      options.allowedPseudoSelectors ?? DEFAULT_ALLOWED_PSEUDO_SELECTORS,
    ),
    allowedDisplayValues: toLowercaseSet(
      options.allowedDisplayValues ?? DEFAULT_ALLOWED_DISPLAY_VALUES,
    ),
    allowedPositionValues: toLowercaseSet(
      options.allowedPositionValues ?? DEFAULT_ALLOWED_POSITION_VALUES,
    ),
  };
}

export const defaultLynxCssAllowLists = {
  properties: [...DEFAULT_ALLOWED_PROPERTIES],
  atRules: [...DEFAULT_ALLOWED_AT_RULES],
  pseudoSelectors: [...DEFAULT_ALLOWED_PSEUDO_SELECTORS],
  displayValues: [...DEFAULT_ALLOWED_DISPLAY_VALUES],
  positionValues: [...DEFAULT_ALLOWED_POSITION_VALUES],
};
