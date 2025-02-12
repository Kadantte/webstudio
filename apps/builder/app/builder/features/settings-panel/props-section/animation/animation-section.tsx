import {
  Grid,
  theme,
  Select,
  Label,
  Separator,
  Box,
  toast,
  ToggleGroup,
  Tooltip,
  ToggleGroupButton,
  Text,
} from "@webstudio-is/design-system";
import { useIds } from "~/shared/form-utils";
import type { PropAndMeta } from "../use-props-logic";
import type { AnimationAction, AnimationActionScroll } from "@webstudio-is/sdk";
import { toPascalCase } from "~/builder/features/style-panel/shared/keyword-utils";
import { animationActionSchema } from "@webstudio-is/sdk";
import { RepeatColumnIcon, RepeatRowIcon } from "@webstudio-is/icons";
import { useState } from "react";
import {
  $instances,
  $registeredComponentMetas,
  $selectedInstanceSelector,
} from "~/shared/nano-states";
import { getInstanceStyleDecl } from "~/builder/features/style-panel/shared/model";
import { getInstanceLabel } from "~/shared/instance-utils";
import { toValue } from "@webstudio-is/css-engine";
import { nanoid } from "nanoid";
import { setListedCssProperty } from "./set-css-property";
import { AnimationsSelect } from "./animations-select";

const animationTypeDescription: Record<AnimationAction["type"], string> = {
  scroll:
    "Scroll-based animations are triggered and controlled by the user’s scroll position.",
  view: "View-based animations occur when an element enters or exits the viewport. They rely on the element’s visibility rather than the scroll position.",
};

const animationTypes: AnimationAction["type"][] = Object.keys(
  animationTypeDescription
) as AnimationAction["type"][];

const defaultActionValue: AnimationAction = {
  type: "scroll",
  animations: [],
};

const animationAxisDescription: Record<
  NonNullable<AnimationAction["axis"]>,
  { icon: React.ReactNode; label: string; description: React.ReactNode }
> = {
  block: {
    icon: <RepeatColumnIcon />,
    label: "Block axis",
    description:
      "Uses the scroll progress along the block axis (depends on writing mode, usually vertical in English).",
  },
  inline: {
    icon: <RepeatRowIcon />,
    label: "Inline axis",
    description:
      "Uses the scroll progress along the inline axis (depends on writing mode, usually horizontal in English).",
  },
  y: {
    label: "Y axis",
    icon: <RepeatColumnIcon />,
    description:
      "Always maps to the vertical scroll direction, regardless of writing mode.",
  },
  x: {
    label: "X axis",
    icon: <RepeatRowIcon />,
    description:
      "Always maps to the horizontal scroll direction, regardless of writing mode.",
  },
};

const animationSourceDescriptions: Record<
  NonNullable<AnimationActionScroll["source"]>,
  string
> = {
  nearest: "Selects the scrolling container that affects the current element.",
  root: "Selects the scrolling element of the document.",
  closest: "Selects the nearest ancestor element that is scrollable.",
};

const animationSources = Object.keys(
  animationSourceDescriptions
) as NonNullable<AnimationActionScroll["source"]>[];

const initSubjects = () => {
  const selectedInstanceSelector = $selectedInstanceSelector.get();
  const instances = $instances.get();
  const metas = $registeredComponentMetas.get();

  if (selectedInstanceSelector === undefined) {
    return [];
  }

  if (selectedInstanceSelector.length === 0) {
    return [];
  }

  const subjects = [
    {
      value: "self",
      label: "Self",
      isTimelineExists: true,
      instanceId: selectedInstanceSelector.at(0)!,
    },
  ];

  for (
    let selector = selectedInstanceSelector.slice(1); // Self is already added
    selector.length !== 0;
    selector = selector.slice(1)
  ) {
    const styleDecl = getInstanceStyleDecl("viewTimelineName", selector);
    const instanceId = selector.at(0)!;

    const instance = instances.get(selector[0]);
    if (instance === undefined) {
      continue;
    }
    const meta = metas.get(instance.component);

    if (meta === undefined) {
      continue;
    }

    const viewTimelineName = toValue(styleDecl.computedValue);

    const isTimelineExists = viewTimelineName.startsWith("--");

    const value = isTimelineExists
      ? viewTimelineName
      : `--generated-timeline-${nanoid()}`;

    subjects.push({
      value,
      label: getInstanceLabel(instance, meta),
      isTimelineExists,
      instanceId,
    });
  }

  return subjects;
};

export const AnimateSection = ({
  animationAction,
  onChange,
}: {
  animationAction: PropAndMeta;
  onChange: (value: AnimationAction) => void;
}) => {
  const [subjects] = useState(() => initSubjects());

  const fieldIds = useIds([
    "type",
    "subject",
    "source",
    "addAnimation",
  ] as const);

  const { prop } = animationAction;

  const value: AnimationAction =
    prop?.type === "animationAction" ? prop.value : defaultActionValue;

  return (
    <Grid
      css={{
        paddingBottom: theme.panel.paddingBlock,
      }}
    >
      <Box css={{ height: theme.panel.paddingBlock }} />

      <Separator />
      <Text
        css={{
          padding: theme.panel.paddingInline,
        }}
        variant={"titles"}
      >
        Animation
      </Text>
      <Separator />

      <Box css={{ height: theme.panel.paddingBlock }} />
      <Grid gap={2} css={{ paddingInline: theme.panel.paddingInline }}>
        <Grid gap={1} align={"center"} css={{ gridTemplateColumns: "1fr 1fr" }}>
          <Label htmlFor={fieldIds.type}>Action</Label>
          <Select
            id={fieldIds.type}
            options={animationTypes}
            getLabel={(animationType: AnimationAction["type"]) =>
              toPascalCase(animationType)
            }
            value={value.type}
            getDescription={(animationType: AnimationAction["type"]) => (
              <Box
                css={{
                  width: theme.spacing[28],
                }}
              >
                {animationTypeDescription[animationType]}
              </Box>
            )}
            onChange={(typeValue) => {
              const newValue = { ...value, type: typeValue, animations: [] };
              const parsedValue = animationActionSchema.safeParse(newValue);
              if (parsedValue.success) {
                onChange(parsedValue.data);
                return;
              }

              toast.error("Schemas are incompatible, try fix");
            }}
          />
        </Grid>

        <Grid gap={1} align={"center"} css={{ gridTemplateColumns: "1fr 1fr" }}>
          <Label>Axis</Label>
          <ToggleGroup
            type="single"
            value={value.axis ?? ("block" as const)}
            onValueChange={(axis) => {
              const newValue = { ...value, axis };
              const parsedValue = animationActionSchema.safeParse(newValue);
              if (parsedValue.success) {
                onChange(parsedValue.data);
                return;
              }

              toast.error("Schemas are incompatible, try fix");
            }}
          >
            {Object.entries(animationAxisDescription).map(
              ([key, { icon, label, description }]) => (
                <Tooltip
                  key={key}
                  content={
                    <Grid gap={1}>
                      <Text variant={"titles"}>{label}</Text>
                      <Text>{description}</Text>
                    </Grid>
                  }
                >
                  <ToggleGroupButton value={key}>{icon}</ToggleGroupButton>
                </Tooltip>
              )
            )}
          </ToggleGroup>
        </Grid>

        {value.type === "scroll" && (
          <Grid
            gap={1}
            align={"center"}
            css={{ gridTemplateColumns: "1fr 1fr" }}
          >
            <Label htmlFor={fieldIds.source}>Scroll Source</Label>

            <Select
              id={fieldIds.source}
              options={animationSources}
              getLabel={(
                animationSource: NonNullable<AnimationActionScroll["source"]>
              ) => toPascalCase(animationSource)}
              value={value.source ?? "nearest"}
              getDescription={(
                animationSource: NonNullable<AnimationActionScroll["source"]>
              ) => (
                <Box
                  css={{
                    width: theme.spacing[28],
                  }}
                >
                  {animationSourceDescriptions[animationSource]}
                </Box>
              )}
              onChange={(source) => {
                const newValue = { ...value, source };
                const parsedValue = animationActionSchema.safeParse(newValue);
                if (parsedValue.success) {
                  onChange(parsedValue.data);
                  return;
                }

                toast.error("Schemas are incompatible, try fix");
              }}
            />
          </Grid>
        )}

        {value.type === "view" && (
          <Grid
            gap={1}
            align={"center"}
            css={{ gridTemplateColumns: "1fr 1fr" }}
          >
            <Label htmlFor={fieldIds.subject}>Scroll Subject</Label>

            <Select
              id={fieldIds.subject}
              options={subjects.map((subject) => subject.value)}
              value={value.subject ?? "self"}
              getLabel={(subject) =>
                subjects.find((s) => s.value === subject)?.label ?? "-"
              }
              onChange={(subject) => {
                const newValue = {
                  ...value,
                  subject: subject === "self" ? undefined : subject,
                };
                const parsedValue = animationActionSchema.safeParse(newValue);

                if (parsedValue.success) {
                  const subject = subjects.find(
                    (s) => s.value === newValue.subject
                  );

                  if (subject === undefined) {
                    toast.error(`Subject "${newValue.subject}" not found`);
                    return;
                  }

                  if (
                    subject.isTimelineExists === false &&
                    newValue.subject !== undefined
                  ) {
                    setListedCssProperty(
                      subject.instanceId,
                      "viewTimelineName",
                      {
                        type: "unparsed",
                        value: newValue.subject,
                      }
                    );
                  }

                  onChange(parsedValue.data);
                  return;
                }

                toast.error("Schemas are incompatible, try fix");
              }}
            />
          </Grid>
        )}

        <AnimationsSelect
          value={value}
          onChange={onChange}
          fieldId={fieldIds.addAnimation}
        />
      </Grid>
    </Grid>
  );
};
