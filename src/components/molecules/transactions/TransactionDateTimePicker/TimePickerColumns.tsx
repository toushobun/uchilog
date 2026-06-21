import type { RefObject } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

import type { TimeParts } from "./dateTimePickerUtils";
import { pad } from "./dateTimePickerUtils";
import {
  PickerColumn,
  pickerOptionSx,
  scrollPickerOptionIntoView,
} from "./PickerColumn";

export function TimePickerColumns({
  hourRef,
  minuteRef,
  onTimePartChange,
  secondRef,
  timeParts,
}: {
  hourRef: RefObject<HTMLButtonElement | null>;
  minuteRef: RefObject<HTMLButtonElement | null>;
  onTimePartChange: (hour: number, minute: number, second: number) => void;
  secondRef: RefObject<HTMLButtonElement | null>;
  timeParts: TimeParts;
}) {
  return (
    <Stack
      direction="row"
      sx={{
        height: 220,
        overflow: "hidden",
        position: "relative",
        px: 8,
      }}
    >
      <Box
        sx={{
          bgcolor: "action.hover",
          borderRadius: 1,
          height: 40,
          left: 2,
          pointerEvents: "none",
          position: "absolute",
          right: 2,
          top: "50%",
          transform: "translateY(-50%)",
        }}
      />
      <PickerColumn
        onChange={(h) =>
          onTimePartChange(h, timeParts.minute, timeParts.second)
        }
      >
        {Array.from({ length: 24 }, (_, option) => (
          <Button
            key={option}
            aria-label={`选择 ${option} 时`}
            data-picker-value={option}
            onClick={(event) => {
              scrollPickerOptionIntoView(event.currentTarget);
              onTimePartChange(option, timeParts.minute, timeParts.second);
            }}
            disableRipple
            ref={option === timeParts.hour ? hourRef : undefined}
            type="button"
            sx={pickerOptionSx(option === timeParts.hour, true)}
          >
            {pad(option)}
          </Button>
        ))}
      </PickerColumn>
      <PickerColumn
        onChange={(m) => onTimePartChange(timeParts.hour, m, timeParts.second)}
      >
        {Array.from({ length: 60 }, (_, option) => (
          <Button
            key={option}
            aria-label={`选择 ${option} 分`}
            data-picker-value={option}
            onClick={(event) => {
              scrollPickerOptionIntoView(event.currentTarget);
              onTimePartChange(timeParts.hour, option, timeParts.second);
            }}
            disableRipple
            ref={option === timeParts.minute ? minuteRef : undefined}
            type="button"
            sx={pickerOptionSx(option === timeParts.minute, true)}
          >
            {pad(option)}
          </Button>
        ))}
      </PickerColumn>
      <PickerColumn
        onChange={(second) =>
          onTimePartChange(timeParts.hour, timeParts.minute, second)
        }
      >
        {Array.from({ length: 60 }, (_, option) => (
          <Button
            key={option}
            aria-label={`选择 ${option} 秒`}
            data-picker-value={option}
            onClick={(event) => {
              scrollPickerOptionIntoView(event.currentTarget);
              onTimePartChange(timeParts.hour, timeParts.minute, option);
            }}
            disableRipple
            ref={option === timeParts.second ? secondRef : undefined}
            type="button"
            sx={pickerOptionSx(option === timeParts.second, true)}
          >
            {pad(option)}
          </Button>
        ))}
      </PickerColumn>
    </Stack>
  );
}
