import { useState, useMemo } from "react";
import {
  theme,
  IconButton,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  rawTheme,
  CssValueListItem,
  SmallToggleButton,
  SmallIconButton,
  Box,
  Text,
  Label,
  Grid,
  useSortable,
  CssValueListArrowFocus,
  toast,
} from "@webstudio-is/design-system";
import {
  EyeClosedIcon,
  EyeOpenIcon,
  MinusIcon,
  PlusIcon,
} from "@webstudio-is/icons";
import type { AnimationAction } from "@webstudio-is/sdk";
import { type ScrollAnimation } from "./new-scroll-animations";
import { type ViewAnimation } from "./new-view-animations";
import { animationActionSchema } from "@webstudio-is/sdk";
import {
  newFadeInScrollAnimation,
  newFadeOutScrollAnimation,
  newScrollAnimation,
} from "./new-scroll-animations";
import {
  newFadeInViewAnimation,
  newFadeOutViewAnimation,
  newViewAnimation,
} from "./new-view-animations";

const newAnimationsPerType: {
  scroll: ScrollAnimation[];
  view: ViewAnimation[];
} = {
  scroll: [
    newScrollAnimation,
    newFadeInScrollAnimation,
    newFadeOutScrollAnimation,
  ],
  view: [newViewAnimation, newFadeInViewAnimation, newFadeOutViewAnimation],
};

type Props = {
  value: AnimationAction;
  onChange: (value: AnimationAction) => void;
  fieldId: string;
};

export const AnimationsSelect = ({ value, onChange, fieldId }: Props) => {
  const [newAnimationHint, setNewAnimationHint] = useState<string | undefined>(
    undefined
  );

  const newAnimations = newAnimationsPerType[value.type];

  const sortableItems = useMemo(
    () => value.animations.map((_, index) => ({ id: `${index}`, index })),
    [value.animations]
  );

  const { dragItemId, placementIndicator, sortableRefCallback } = useSortable({
    items: sortableItems,
    onSort: (newIndex, oldIndex) => {
      const newAnimations = [...value.animations];
      const [movedItem] = newAnimations.splice(oldIndex, 1);
      newAnimations.splice(newIndex, 0, movedItem);
      const newValue = { ...value, animations: newAnimations };
      const parsedValue = animationActionSchema.safeParse(newValue);

      if (parsedValue.success) {
        onChange(parsedValue.data);
        return;
      }
      toast.error("Failed to sort animation");
    },
  });

  return (
    <Grid gap={1} align={"center"} css={{ gridTemplateColumns: "1fr auto" }}>
      <Label htmlFor={fieldId}>
        <Text variant={"titles"}>Animations</Text>
      </Label>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton id={fieldId}>
            <PlusIcon />
          </IconButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          sideOffset={Number.parseFloat(rawTheme.spacing[5])}
          css={{ width: theme.spacing[25] }}
        >
          {newAnimations.map((animation, index) => (
            <DropdownMenuItem
              key={index}
              onSelect={() => {
                const newValue = {
                  ...value,
                  animations: value.animations.concat(animation),
                };

                const parsedValue = animationActionSchema.safeParse(newValue);

                if (parsedValue.success) {
                  onChange(parsedValue.data);
                  return;
                }
                toast.error("Failed to add animation");
              }}
              onFocus={() => setNewAnimationHint(animation.description)}
              onBlur={() => setNewAnimationHint(undefined)}
            >
              {animation.name}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          <DropdownMenuItem css={{ display: "grid" }} hint>
            {newAnimations.map(({ description }, index) => (
              <Box
                css={{
                  gridColumn: "1",
                  gridRow: "1",
                  visibility: "hidden",
                }}
                key={index}
              >
                {description}
              </Box>
            ))}
            <Box
              css={{
                gridColumn: "1",
                gridRow: "1",
              }}
            >
              {newAnimationHint ?? "Add new or select existing animation"}
            </Box>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <CssValueListArrowFocus dragItemId={dragItemId}>
        <Grid gap={1} css={{ gridColumn: "span 2" }} ref={sortableRefCallback}>
          {value.animations.map((animation, index) => (
            <CssValueListItem
              key={index}
              label={
                <Label disabled={false} truncate>
                  {animation.name ?? "Unnamed"}
                </Label>
              }
              hidden={false}
              draggable
              active={dragItemId === String(index)}
              state={undefined}
              index={index}
              id={String(index)}
              buttons={
                <>
                  <SmallToggleButton
                    pressed={false}
                    onPressedChange={() => {}}
                    variant="normal"
                    tabIndex={-1}
                    icon={
                      // eslint-disable-next-line no-constant-condition
                      false ? <EyeClosedIcon /> : <EyeOpenIcon />
                    }
                  />

                  <SmallIconButton
                    variant="destructive"
                    tabIndex={-1}
                    icon={<MinusIcon />}
                    onClick={() => {
                      const newAnimations = [...value.animations];
                      newAnimations.splice(index, 1);

                      const newValue = { ...value, animations: newAnimations };
                      const parsedValue =
                        animationActionSchema.safeParse(newValue);

                      if (parsedValue.success) {
                        onChange(parsedValue.data);
                        return;
                      }
                      toast.error("Failed to remove animation");
                    }}
                  />
                </>
              }
            />
          ))}
          {placementIndicator}
        </Grid>
      </CssValueListArrowFocus>
    </Grid>
  );
};
