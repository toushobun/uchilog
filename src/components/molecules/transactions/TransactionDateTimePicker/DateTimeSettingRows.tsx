import type { KeyboardEvent } from "react";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { transactionDateTimePickerMessages as messages } from "@/constants/transactions";

import { formatFullDateLabel } from "./dateTimePickerUtils";

function settingRowSx(hasBorderTop = false) {
  return {
    alignItems: "center",
    borderTop: hasBorderTop ? 1 : 0,
    borderColor: "divider",
    cursor: "pointer",
    flexShrink: 0,
    fontSize: 15,
    minHeight: 56,
    px: 3,
    transition: "background-color 160ms ease",
    WebkitTapHighlightColor: "transparent",
    "&:focus": { outline: "none" },
    "&:focus-visible": { bgcolor: "action.hover" },
    "@media (hover: hover)": {
      "&:hover": { bgcolor: "action.hover" },
    },
  } as const;
}

export function DateSettingRow({
  date,
  expanded,
  monthPickerOpen,
  onDateClick,
  onMonthNext,
  onMonthPickerClick,
  onMonthPrev,
  visibleMonth,
}: {
  date: string;
  expanded: boolean;
  monthPickerOpen: boolean;
  onDateClick: () => void;
  onMonthNext: () => void;
  onMonthPickerClick: () => void;
  onMonthPrev: () => void;
  visibleMonth: Date;
}) {
  function handleRowKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onDateClick();
  }

  if (expanded) {
    return (
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          flexShrink: 0,
          justifyContent: "space-between",
          minHeight: 56,
          px: 1,
        }}
      >
        <IconButton
          aria-label={messages.previousMonth}
          onClick={onMonthPrev}
          size="small"
        >
          <ChevronLeftIcon />
        </IconButton>
        <Button
          aria-expanded={monthPickerOpen}
          aria-label={messages.monthPickerLabel}
          endIcon={
            monthPickerOpen ? (
              <KeyboardArrowUpIcon />
            ) : (
              <KeyboardArrowDownIcon />
            )
          }
          onClick={onMonthPickerClick}
          type="button"
          variant="text"
          sx={{
            color: "text.primary",
            fontSize: 16,
            fontWeight: 700,
            minHeight: 36,
          }}
        >
          {visibleMonth.getFullYear()}年{visibleMonth.getMonth() + 1}月
        </Button>
        <IconButton
          aria-label={messages.nextMonth}
          onClick={onMonthNext}
          size="small"
        >
          <ChevronRightIcon />
        </IconButton>
      </Stack>
    );
  }

  return (
    <Stack
      aria-label={messages.dateLabel}
      direction="row"
      onClick={onDateClick}
      onKeyDown={handleRowKeyDown}
      role="button"
      tabIndex={0}
      sx={settingRowSx(false)}
    >
      <Typography sx={{ flex: 1, fontSize: "inherit", fontWeight: 700 }}>
        {messages.dateLabel}
      </Typography>
      <Stack
        direction="row"
        sx={{ alignItems: "center", color: "text.secondary" }}
      >
        {formatFullDateLabel(date)}
        <ChevronRightIcon fontSize="small" />
      </Stack>
    </Stack>
  );
}

export function TimeSettingRow({
  expanded,
  onTimeClick,
  time,
}: {
  expanded: boolean;
  onTimeClick: () => void;
  time: string;
}) {
  function handleRowKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onTimeClick();
  }

  return (
    <Stack
      aria-expanded={expanded}
      aria-label={messages.selectTime}
      direction="row"
      onClick={onTimeClick}
      onKeyDown={handleRowKeyDown}
      role="button"
      tabIndex={0}
      sx={settingRowSx(true)}
    >
      <Typography sx={{ flex: 1, fontSize: "inherit", fontWeight: 700 }}>
        {messages.timeLabel}
      </Typography>
      <Stack
        direction="row"
        sx={{ alignItems: "center", color: "text.secondary" }}
      >
        {time}
        {expanded ? (
          <KeyboardArrowDownIcon fontSize="small" />
        ) : (
          <ChevronRightIcon fontSize="small" />
        )}
      </Stack>
    </Stack>
  );
}
