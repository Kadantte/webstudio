import { parseCssValue } from "@webstudio-is/css-data";
import type { AnimationActionScroll } from "@webstudio-is/sdk";

export type ScrollAnimation = AnimationActionScroll["animations"][number];

export const newScrollAnimation: ScrollAnimation = {
  name: "New Animation",
  description: "Create a new animation.",

  timing: {
    rangeStart: ["start", { type: "unit", value: 0, unit: "px" }],
    rangeEnd: ["end", { type: "unit", value: 0, unit: "px" }],
    fill: "backwards",
  },
  keyframes: [
    {
      offset: 0,
      styles: {},
    },
  ],
};

export const newFadeInScrollAnimation: ScrollAnimation = {
  name: "Fade In",
  description: "Fade in the element as it scrolls into view.",

  timing: {
    rangeStart: ["start", { type: "unit", value: 0, unit: "%" }],
    rangeEnd: ["end", { type: "unit", value: 50, unit: "dvh" }],
    fill: "backwards",
  },
  keyframes: [
    {
      offset: 0,
      styles: {
        opacity: parseCssValue("opacity", "0"),
      },
    },
  ],
};

export const newFadeOutScrollAnimation: ScrollAnimation = {
  name: "Fade Out",
  description: "Fade out the element as it scrolls out of view.",

  timing: {
    rangeStart: ["end", { type: "unit", value: 50, unit: "dvh" }],
    rangeEnd: ["end", { type: "unit", value: 0, unit: "%" }],
    fill: "backwards",
  },
  keyframes: [
    {
      offset: 1,
      styles: {
        opacity: parseCssValue("opacity", "0"),
      },
    },
  ],
};
