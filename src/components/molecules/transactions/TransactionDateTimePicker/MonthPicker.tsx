import type { RefObject } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

import { transactionDateTimePickerMessages as messages } from "@/constants/transactions";
import { designTokens } from "theme/theme";

import {
  PickerColumn,
  pickerOptionSx,
  scrollPickerOptionIntoView,
} from "./PickerColumn";

export function MonthPicker({
  month,
  monthRef,
  onMonthChange,
  onSubmit,
  onYearChange,
  year,
  yearOptions,
  yearRef,
}: {
  month: number;
  monthRef: RefObject<HTMLButtonElement | null>;
  onMonthChange: (value: number) => void;
  onSubmit: () => void;
  onYearChange: (value: number) => void;
  year: number;
  yearOptions: number[];
  yearRef: RefObject<HTMLButtonElement | null>;
}) {
  return (
    <Stack sx={{ flex: 1, minHeight: 0 }}>
      <Stack
        direction="row"
        sx={{
          flex: 1,
          minHeight: 0,
          position: "relative",
          px: 4,
        }}
      >
        <Box
          sx={{
            bgcolor: "action.hover",
            height: 40,
            left: 4,
            pointerEvents: "none",
            position: "absolute",
            right: 4,
            top: "50%",
            transform: "translateY(-50%)",
          }}
        />
        <PickerColumn onChange={onYearChange} overlay={false}>
          {yearOptions.map((option) => (
            <Button
              key={option}
              aria-label={`选择 ${option} 年`}
              data-picker-value={option}
              onClick={(event) => {
                scrollPickerOptionIntoView(event.currentTarget);
                onYearChange(option);
              }}
              disableRipple
              ref={option === year ? yearRef : undefined}
              type="button"
              sx={pickerOptionSx(option === year)}
            >
              {option}年
            </Button>
          ))}
        </PickerColumn>
        <PickerColumn onChange={onMonthChange} overlay={false}>
          {Array.from({ length: 12 }, (_, option) => (
            <Button
              key={option}
              aria-label={`选择 ${option + 1} 月`}
              data-picker-value={option}
              onClick={(event) => {
                scrollPickerOptionIntoView(event.currentTarget);
                onMonthChange(option);
              }}
              disableRipple
              ref={option === month ? monthRef : undefined}
              type="button"
              sx={pickerOptionSx(option === month)}
            >
              {option + 1}月
            </Button>
          ))}
        </PickerColumn>
      </Stack>
      <Box sx={{ flexShrink: 0, px: 3, py: 1 }}>
        <Button
          aria-label={messages.selectMonth}
          fullWidth
          onClick={onSubmit}
          type="button"
          variant="contained"
          sx={{
            background: `var(--user-theme-fab-bg, ${designTokens.color.brand.main})`,
            color: "white",
            minHeight: 40,
          }}
        >
          确定
        </Button>
      </Box>
    </Stack>
  );
}
