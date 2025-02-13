import {
  Box,
  Grid,
  Label,
  Select,
  theme,
  toast,
} from "@webstudio-is/design-system";
import { toPascalCase } from "~/builder/features/style-panel/shared/keyword-utils";
import { useIds } from "~/shared/form-utils";

import type { ScrollAnimation, ViewAnimation } from "@webstudio-is/sdk";
import { scrollAnimationSchema, viewAnimationSchema } from "@webstudio-is/sdk";

type Props = {
  type: "scroll" | "view";
  value: ScrollAnimation | ViewAnimation;
  onChange: (value: ScrollAnimation | ViewAnimation) => void;
};

/**
 * https://developer.mozilla.org/en-US/docs/Web/CSS/animation-range-start
 *
 * <timeline-range-name>
 **/
const viewTimelineRangeName = {
  entry: "Animates during entry (starts entering → fully visible)",
  exit: "Animates during exit (starts exiting → fully hidden)",
  contain:
    "Animates only while the element is fully in view (fullly visible after entering → starts exiting)",
  cover:
    "Animates entire time the element is visible (starts entering → ends after exiting)",
  "entry-crossing":
    "Animates as the element enters (leading edge → trailing edge enters view)",
  "exit-crossing":
    "Animates as the element exits (leading edge → trailing edge leaves view)",
};

/**
 * Scroll does not support https://drafts.csswg.org/scroll-animations/#named-ranges
 * However, for simplicity and type unification with the view, we will use the names "start" and "end,"
 * which will be transformed as follows:
 * - "start" → `calc(0% + range)`
 * - "end" → `calc(100% - range)`
 */
const scrollTimelineRangeName = {
  start: "Distance from the top of the scroll container where animation begins",
  end: "Distance from the bottom of the scroll container where animation ends",
};

export const AnimationPanelContent = ({ onChange, value, type }: Props) => {
  const fieldIds = useIds([
    "rangeStartName",
    "rangeStartValue",
    "rangeEndName",
    "rangeEndValue",
  ] as const);

  const timelineRangeDescriptions =
    type === "scroll" ? scrollTimelineRangeName : viewTimelineRangeName;

  const timelineRangeNames = Object.keys(timelineRangeDescriptions);

  const animationSchema =
    type === "scroll" ? scrollAnimationSchema : viewAnimationSchema;

  const handleChange = (rawValue: unknown) => {
    if (type === "scroll") {
      const parsedValue = animationSchema.safeParse(rawValue);
      if (parsedValue.success) {
        onChange(parsedValue.data);
        return;
      }
    }

    toast.error("Schemas are incompatible, try fix");
  };

  return (
    <Grid gap="2" css={{ padding: theme.panel.padding }}>
      <Grid gap={1} align={"center"} css={{ gridTemplateColumns: "1fr 1fr" }}>
        <Label htmlFor={fieldIds.rangeStartName}>Range Start</Label>
        <Label htmlFor={fieldIds.rangeStartValue}>Value</Label>
        <Select
          id={fieldIds.rangeStartName}
          options={timelineRangeNames}
          getLabel={(timelineRangeName: string) =>
            toPascalCase(timelineRangeName)
          }
          value={value.timing.rangeStart?.[0] ?? timelineRangeNames[0]!}
          getDescription={(timelineRangeName: string) => (
            <Box
              css={{
                width: theme.spacing[28],
              }}
            >
              {
                timelineRangeDescriptions[
                  timelineRangeName as keyof typeof timelineRangeDescriptions
                ]
              }
            </Box>
          )}
          onChange={(timelineRangeName) => {
            handleChange({
              ...value,
              timing: {
                ...value.timing,
                rangeStart: [
                  timelineRangeName,
                  value.timing.rangeStart?.[1] ?? {
                    type: "unit",
                    value: 0,
                    unit: "%",
                  },
                ],
              },
            });
          }}
        />
        <Box />
        <Label htmlFor={fieldIds.rangeEndName}>Range End</Label>
        <Label htmlFor={fieldIds.rangeEndValue}>Value</Label>
        <Select
          id={fieldIds.rangeEndName}
          options={timelineRangeNames}
          getLabel={(timelineRangeName: string) =>
            toPascalCase(timelineRangeName)
          }
          value={value.timing.rangeEnd?.[0] ?? timelineRangeNames[0]!}
          getDescription={(timelineRangeName: string) => (
            <Box
              css={{
                width: theme.spacing[28],
              }}
            >
              {
                timelineRangeDescriptions[
                  timelineRangeName as keyof typeof timelineRangeDescriptions
                ]
              }
            </Box>
          )}
          onChange={(timelineRangeName) => {
            handleChange({
              ...value,
              timing: {
                ...value.timing,
                rangeEnd: [
                  timelineRangeName,
                  value.timing.rangeEnd?.[1] ?? {
                    type: "unit",
                    value: 0,
                    unit: "%",
                  },
                ],
              },
            });
          }}
        />
        <Box />
      </Grid>
    </Grid>
  );
};
