import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import { transactionDateTimePickerMessages as messages } from "@/constants/transactions";
import { designTokens } from "theme/theme";

import type { CalendarDay } from "./dateTimePickerUtils";
import { formatAccessibleDate } from "./dateTimePickerUtils";

export function CalendarGrid({
  calendarDays,
  date,
  onDateChange,
  today,
}: {
  calendarDays: (CalendarDay | null)[];
  date: string;
  onDateChange: (value: string) => void;
  today: string;
}) {
  return (
    <Box
      aria-label={messages.calendarLabel}
      role="grid"
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
        gridTemplateRows: `24px repeat(${calendarDays.length / 7}, minmax(0, 1fr))`,
        height: "100%",
      }}
    >
      {messages.weekdays.map((weekday) => (
        <Typography
          key={weekday}
          color="text.secondary"
          role="columnheader"
          sx={{ alignSelf: "center", fontSize: 11, textAlign: "center" }}
        >
          {weekday}
        </Typography>
      ))}
      {calendarDays.map((day, index) => {
        if (!day) {
          return <Box key={`empty-${index}`} role="gridcell" />;
        }

        const isSelected = day.value === date;
        const isToday = day.value === today;
        const selectedBackground = `var(--user-theme-action-text, ${designTokens.color.brand.main})`;

        return (
          <Box
            key={day.value}
            role="gridcell"
            sx={{
              alignItems: "center",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Button
              aria-label={formatAccessibleDate(day.date)}
              aria-pressed={isSelected}
              onClick={() => onDateChange(day.value)}
              type="button"
              sx={{
                bgcolor: isSelected ? selectedBackground : "transparent",
                borderRadius: "50%",
                color: isSelected ? "common.white" : "text.secondary",
                fontSize: 16,
                fontWeight: isSelected ? 700 : 500,
                height: 38,
                minHeight: 38,
                minWidth: 38,
                p: 0,
                width: 38,
                "&:hover": {
                  bgcolor: isSelected ? selectedBackground : "action.hover",
                },
              }}
            >
              {isToday ? messages.todayShort : day.date.getDate()}
            </Button>
          </Box>
        );
      })}
    </Box>
  );
}
