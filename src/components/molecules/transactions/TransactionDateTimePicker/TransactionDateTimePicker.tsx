"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import Drawer from "@mui/material/Drawer";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { keyframes } from "@mui/material/styles";

import { transactionDateTimePickerMessages as messages } from "@/constants/transactions";

import { CalendarGrid } from "./CalendarGrid";
import { DateSettingRow, TimeSettingRow } from "./DateTimeSettingRows";
import { MonthPicker } from "./MonthPicker";
import { TimePickerColumns } from "./TimePickerColumns";
import {
  buildCalendarDays,
  formatDateTimeLabel,
  formatDateValue,
  formatTimeDisplay,
  getMonthStart,
  pad,
  splitTimeValue,
  type MonthSlideDirection,
} from "./dateTimePickerUtils";

type TransactionDateTimePickerProps = {
  date: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  time: string;
};

const slideMonthFromLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-24px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideMonthFromRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(24px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const COLLAPSE_TIMEOUT = 280;

export function TransactionDateTimePicker({
  date,
  onDateChange,
  onTimeChange,
  time,
}: TransactionDateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [calendarExpanded, setCalendarExpanded] = useState(true);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => getMonthStart(date));
  const [monthSlide, setMonthSlide] = useState<{
    direction: MonthSlideDirection;
    key: number;
  }>({ direction: 0, key: 0 });
  const [pickerYear, setPickerYear] = useState(visibleMonth.getFullYear());
  const [pickerMonth, setPickerMonth] = useState(visibleMonth.getMonth());
  const selectedYearRef = useRef<HTMLButtonElement>(null);
  const selectedMonthRef = useRef<HTMLButtonElement>(null);
  const hourRef = useRef<HTMLButtonElement>(null);
  const minuteRef = useRef<HTMLButtonElement>(null);
  const secondRef = useRef<HTMLButtonElement>(null);
  const monthPickerOverlayRef = useRef<HTMLDivElement>(null);
  const calendarDays = useMemo(
    () => buildCalendarDays(visibleMonth),
    [visibleMonth],
  );
  const yearOptions = useMemo(
    () =>
      Array.from(
        { length: 101 },
        (_, index) => visibleMonth.getFullYear() - 50 + index,
      ),
    [visibleMonth],
  );
  const [today, setToday] = useState("");
  const timeParts = splitTimeValue(time);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 客户端挂载后读取本地日期，避免服务端水合差异。
    setToday(formatDateValue(new Date()));
  }, []);

  useEffect(() => {
    if (!monthPickerOpen) return;

    selectedYearRef.current?.scrollIntoView?.({ block: "center" });
    selectedMonthRef.current?.scrollIntoView?.({ block: "center" });
  }, [monthPickerOpen]);

  // 年月 picker 关闭时，避免键盘焦点进入隐藏的 overlay。
  useEffect(() => {
    const el = monthPickerOverlayRef.current;
    if (!el) return;
    if (monthPickerOpen) {
      el.removeAttribute("inert");
    } else {
      el.setAttribute("inert", "");
    }
  }, [monthPickerOpen]);

  function changeMonth(offset: number) {
    setMonthSlide((current) => ({
      direction: offset < 0 ? -1 : 1,
      key: current.key + 1,
    }));
    setVisibleMonth(
      (currentMonth) =>
        new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth() + offset,
          1,
        ),
    );
  }

  function openMonthPicker() {
    setPickerYear(visibleMonth.getFullYear());
    setPickerMonth(visibleMonth.getMonth());
    setMonthPickerOpen((current) => !current);
  }

  function confirmMonthPicker() {
    setMonthSlide((current) => ({ direction: 0, key: current.key + 1 }));
    setVisibleMonth(new Date(pickerYear, pickerMonth, 1));
    setMonthPickerOpen(false);
  }

  function closeDrawer() {
    setMonthPickerOpen(false);
    setTimePickerOpen(false);
    setOpen(false);
  }

  function handleDateRowClick() {
    setMonthPickerOpen(false);

    const nextExpanded = !calendarExpanded;
    setCalendarExpanded(nextExpanded);

    if (nextExpanded) {
      setTimePickerOpen(false);
    }
  }

  function handleTimeRowClick() {
    setMonthPickerOpen(false);

    const nextOpen = !timePickerOpen;
    setTimePickerOpen(nextOpen);

    if (nextOpen) {
      setCalendarExpanded(false);
    }
  }

  function handleTimePartChange(hour: number, minute: number, second: number) {
    onTimeChange(`${pad(hour)}:${pad(minute)}:${pad(second)}`);
  }

  function handleTimeCollapseEntered() {
    hourRef.current?.scrollIntoView?.({ block: "center" });
    minuteRef.current?.scrollIntoView?.({ block: "center" });
    secondRef.current?.scrollIntoView?.({ block: "center" });
  }

  return (
    <>
      <Box>
        <Typography
          color="text.primary"
          sx={{ fontSize: "0.8125rem", fontWeight: 800, mb: 0.75, px: 0.25 }}
          variant="body2"
        >
          {messages.fieldLabel}
        </Typography>
        <Button
          aria-label={messages.openPicker}
          fullWidth
          onClick={() => {
            setVisibleMonth(getMonthStart(date));
            setMonthPickerOpen(false);
            setCalendarExpanded(true);
            setTimePickerOpen(false);
            setOpen(true);
          }}
          startIcon={<AccessTimeOutlinedIcon />}
          type="button"
          variant="outlined"
          sx={{
            bgcolor: "var(--user-theme-card-bg)",
            borderColor: "var(--user-theme-card-border)",
            borderRadius: 1.25,
            color: "text.primary",
            justifyContent: "flex-start",
            minHeight: 50,
            px: 1.5,
          }}
        >
          {formatDateTimeLabel(date, time, today)}
        </Button>
      </Box>

      <Drawer
        anchor="bottom"
        onClose={closeDrawer}
        open={open}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "16px 16px 0 0",
              maxHeight: "90dvh",
              overflow: "hidden",
            },
          },
        }}
      >
        <Stack>
          <Stack
            direction="row"
            sx={{
              alignItems: "center",
              justifyContent: "flex-end",
              px: 2,
              py: 0.75,
            }}
          >
            <Button
              onClick={closeDrawer}
              type="button"
              variant="text"
              sx={{ color: "var(--user-theme-action-text)" }}
            >
              {messages.close}
            </Button>
          </Stack>

          <Box sx={{ overflow: "hidden", position: "relative" }}>
            <Stack>
              {/* 日期 行 */}
              <DateSettingRow
                date={date}
                expanded={calendarExpanded}
                monthPickerOpen={monthPickerOpen}
                onDateClick={handleDateRowClick}
                onMonthNext={() => changeMonth(1)}
                onMonthPickerClick={openMonthPicker}
                onMonthPrev={() => changeMonth(-1)}
                visibleMonth={visibleMonth}
              />

              <Box
                ref={monthPickerOverlayRef}
                aria-hidden={!monthPickerOpen}
                data-month-picker-overlay
                sx={{
                  bgcolor: "background.paper",
                  bottom: 0,
                  boxShadow: "var(--user-theme-card-shadow)",
                  clipPath: monthPickerOpen
                    ? "inset(0 0 0 0)"
                    : "inset(0 0 100% 0)",
                  display: "flex",
                  flexDirection: "column",
                  left: 0,
                  opacity: monthPickerOpen ? 1 : 0,
                  overflow: "hidden",
                  pointerEvents: monthPickerOpen ? "auto" : "none",
                  position: "absolute",
                  right: 0,
                  top: 56,
                  transform: monthPickerOpen
                    ? "translateY(0)"
                    : "translateY(-12px)",
                  transformOrigin: "top center",
                  transition:
                    "clip-path 280ms cubic-bezier(0.22, 1, 0.36, 1), opacity 180ms ease-out, transform 260ms cubic-bezier(0.22, 1, 0.36, 1)",
                  zIndex: 4,
                  "@media (prefers-reduced-motion: reduce)": {
                    clipPath: "inset(0 0 0 0)",
                    transform: "none",
                    transition: "none",
                  },
                }}
              >
                <MonthPicker
                  month={pickerMonth}
                  monthRef={selectedMonthRef}
                  onMonthChange={setPickerMonth}
                  onSubmit={confirmMonthPicker}
                  onYearChange={setPickerYear}
                  year={pickerYear}
                  yearOptions={yearOptions}
                  yearRef={selectedYearRef}
                />
              </Box>

              {/* 日历展开区 */}
              <Collapse in={calendarExpanded} timeout={COLLAPSE_TIMEOUT}>
                <Box
                  sx={{
                    height: 230,
                    overflow: "hidden",
                    px: 2,
                    py: 1,
                  }}
                >
                  <Box
                    key={monthSlide.key}
                    sx={{
                      animation:
                        monthSlide.direction === 0
                          ? "none"
                          : `${monthSlide.direction < 0 ? slideMonthFromLeft : slideMonthFromRight} 220ms cubic-bezier(0.22, 1, 0.36, 1)`,
                      height: "100%",
                      "@media (prefers-reduced-motion: reduce)": {
                        animation: "none",
                      },
                    }}
                  >
                    <CalendarGrid
                      calendarDays={calendarDays}
                      date={date}
                      onDateChange={onDateChange}
                      today={today}
                    />
                  </Box>
                </Box>
              </Collapse>

              {/* 时刻 行 */}
              <TimeSettingRow
                expanded={timePickerOpen}
                onTimeClick={handleTimeRowClick}
                time={formatTimeDisplay(time)}
              />

              {/* 时间列展开区 */}
              <Collapse
                in={timePickerOpen}
                timeout={COLLAPSE_TIMEOUT}
                onEntered={handleTimeCollapseEntered}
              >
                <TimePickerColumns
                  hourRef={hourRef}
                  minuteRef={minuteRef}
                  onTimePartChange={handleTimePartChange}
                  secondRef={secondRef}
                  timeParts={timeParts}
                />
              </Collapse>
            </Stack>
          </Box>
        </Stack>
      </Drawer>
    </>
  );
}
