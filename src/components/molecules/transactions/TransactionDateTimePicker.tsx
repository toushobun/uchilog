"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { keyframes } from "@mui/material/styles";

import { transactionDateTimePickerMessages as messages } from "@/constants/transactions";
import { designTokens } from "theme/theme";

type TransactionDateTimePickerProps = {
  date: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  time: string;
};

type CalendarDay = {
  date: Date;
  value: string;
};

type MonthSlideDirection = -1 | 0 | 1;

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
const PROGRAMMATIC_PICKER_SCROLL_LOCK_MS = 500;
const programmaticPickerScrollLocks = new WeakMap<Element, number>();

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
          color="text.secondary"
          sx={{ fontWeight: 700, mb: 0.75 }}
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
            bgcolor: "background.paper",
            color: "text.primary",
            justifyContent: "flex-start",
            minHeight: 56,
            px: 2,
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

          <Box
            sx={{
              overflow: "hidden",
              position: "relative",
            }}
          >
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
                  boxShadow: "0 12px 28px rgba(15, 23, 42, 0.16)",
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
                  onBack={() => setMonthPickerOpen(false)}
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
                      handleTimePartChange(
                        h,
                        timeParts.minute,
                        timeParts.second,
                      )
                    }
                  >
                    {Array.from({ length: 24 }, (_, option) => (
                      <Button
                        key={option}
                        aria-label={`选择 ${option} 时`}
                        data-picker-value={option}
                        onClick={(event) => {
                          scrollPickerOptionIntoView(event.currentTarget);
                          handleTimePartChange(
                            option,
                            timeParts.minute,
                            timeParts.second,
                          );
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
                    onChange={(m) =>
                      handleTimePartChange(timeParts.hour, m, timeParts.second)
                    }
                  >
                    {Array.from({ length: 60 }, (_, option) => (
                      <Button
                        key={option}
                        aria-label={`选择 ${option} 分`}
                        data-picker-value={option}
                        onClick={(event) => {
                          scrollPickerOptionIntoView(event.currentTarget);
                          handleTimePartChange(
                            timeParts.hour,
                            option,
                            timeParts.second,
                          );
                        }}
                        disableRipple
                        ref={
                          option === timeParts.minute ? minuteRef : undefined
                        }
                        type="button"
                        sx={pickerOptionSx(option === timeParts.minute, true)}
                      >
                        {pad(option)}
                      </Button>
                    ))}
                  </PickerColumn>
                  <PickerColumn
                    onChange={(second) =>
                      handleTimePartChange(
                        timeParts.hour,
                        timeParts.minute,
                        second,
                      )
                    }
                  >
                    {Array.from({ length: 60 }, (_, option) => (
                      <Button
                        key={option}
                        aria-label={`\u9009\u62e9 ${option} \u79d2`}
                        data-picker-value={option}
                        onClick={(event) => {
                          scrollPickerOptionIntoView(event.currentTarget);
                          handleTimePartChange(
                            timeParts.hour,
                            timeParts.minute,
                            option,
                          );
                        }}
                        disableRipple
                        ref={
                          option === timeParts.second ? secondRef : undefined
                        }
                        type="button"
                        sx={pickerOptionSx(option === timeParts.second, true)}
                      >
                        {pad(option)}
                      </Button>
                    ))}
                  </PickerColumn>
                </Stack>
              </Collapse>
            </Stack>
          </Box>
        </Stack>
      </Drawer>
    </>
  );
}

function CalendarGrid({
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
                bgcolor: isSelected
                  ? `var(--user-theme-action-text, ${designTokens.color.brand.main})`
                  : "transparent",
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
                  bgcolor: isSelected
                    ? `var(--user-theme-action-text, ${designTokens.color.brand.main})`
                    : "action.hover",
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

function DateSettingRow({
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
  function handleRowKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
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

function TimeSettingRow({
  expanded,
  onTimeClick,
  time,
}: {
  expanded: boolean;
  onTimeClick: () => void;
  time: string;
}) {
  function handleRowKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
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

function MonthPicker({
  month,
  monthRef,
  onBack,
  onMonthChange,
  onSubmit,
  onYearChange,
  year,
  yearOptions,
  yearRef,
}: {
  month: number;
  monthRef: React.RefObject<HTMLButtonElement | null>;
  onBack: () => void;
  onMonthChange: (value: number) => void;
  onSubmit: () => void;
  onYearChange: (value: number) => void;
  year: number;
  yearOptions: number[];
  yearRef: React.RefObject<HTMLButtonElement | null>;
}) {
  return (
    <Stack sx={{ flex: 1, minHeight: 0 }}>
      <Button
        aria-label={messages.closeMonthPicker}
        endIcon={<KeyboardArrowUpIcon />}
        onClick={onBack}
        type="button"
        variant="text"
        sx={{
          color: `var(--user-theme-action-text, ${designTokens.color.brand.main})`,
          flexShrink: 0,
          fontSize: 16,
          minHeight: 36,
          py: 0.5,
        }}
      >
        {year}年{month + 1}月
      </Button>
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

function PickerColumn({
  children,
  onChange,
  overlay = true,
}: {
  children: React.ReactNode;
  onChange: (value: number) => void;
  overlay?: boolean;
}) {
  const childCount = React.Children.count(children);
  const syncAnimation = useMemo(
    () => keyframes`
      from { transform: translateY(0); }
      to { transform: translateY(${-(childCount - 1) * 40}px); }
    `,
    [childCount],
  );

  const boldChildren = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return null;
    const element = child as React.ReactElement<{ children?: React.ReactNode }>;
    return (
      <Box
        aria-hidden
        sx={{
          alignItems: "center",
          color: "text.primary",
          display: "flex",
          flexShrink: 0,
          fontSize: 15,
          fontWeight: 600,
          justifyContent: "center",
          minHeight: 40,
          pointerEvents: "none",
        }}
      >
        {element.props.children}
      </Box>
    );
  });

  return (
    <Box sx={{ flex: 1 }}>
      <Stack
        onScroll={(event) => {
          handlePickerScroll(event.currentTarget, onChange);
        }}
        sx={{
          height: "100%",
          overflowY: "auto",
          position: "relative",
          scrollPaddingBlock: "calc(50% - 20px)",
          scrollSnapType: "y mandatory",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
          ...(!overlay && {
            maskImage:
              "linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)",
          }),
        }}
      >
        <Box sx={{ flexShrink: 0, height: "calc(50% - 20px)" }} />

        {/* CSS scroll-driven 放大镜 overlay */}
        {overlay && (
          <Box
            aria-hidden
            sx={{
              display: "none",
              "@supports (animation-timeline: scroll())": { display: "block" },
              height: 0,
              overflow: "visible",
              pointerEvents: "none",
              position: "sticky",
              top: "calc(50% - 20px)",
              zIndex: 2,
            }}
          >
            <Box
              sx={{
                height: 40,
                left: 0,
                overflow: "clip",
                position: "absolute",
                right: 0,
                top: 0,
              }}
            >
              <Box
                sx={{
                  animationDuration: "1s",
                  animationFillMode: "both",
                  animationName: `${syncAnimation}`,
                  animationTimingFunction: "linear",
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore: CSS scroll-driven animation (Chrome 115+, Firefox 110+, Safari 18+)
                  animationTimeline: "scroll(nearest block)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {boldChildren}
              </Box>
            </Box>
          </Box>
        )}

        {children}
        <Box sx={{ flexShrink: 0, height: "calc(50% - 20px)" }} />
      </Stack>
    </Box>
  );
}

function pickerOptionSx(selected: boolean, withOverlay = false) {
  return {
    color: selected ? "text.primary" : "text.disabled",
    flexShrink: 0,
    fontSize: 15,
    fontWeight: 400,
    // 启用 overlay 时所有选项均淡显，由 overlay 层负责加粗高亮当前选中项
    ...(withOverlay
      ? {
          "@supports (animation-timeline: scroll())": {
            color: "text.disabled",
            fontWeight: 400,
            fontSize: 14,
          },
        }
      : {}),
    minHeight: 40,
    scrollSnapAlign: "center",
    zIndex: 1,
    "&:hover, &:active, &.Mui-focusVisible": { bgcolor: "transparent" },
  };
}

function scrollPickerOptionIntoView(option: HTMLButtonElement) {
  const container = option.parentElement;
  if (!container) return;

  const nextScrollTop =
    option.offsetTop + option.offsetHeight / 2 - container.clientHeight / 2;

  programmaticPickerScrollLocks.set(
    container,
    Date.now() + PROGRAMMATIC_PICKER_SCROLL_LOCK_MS,
  );

  if (typeof container.scrollTo === "function") {
    container.scrollTo({
      behavior: "smooth",
      top: Math.max(0, nextScrollTop),
    });
    return;
  }

  container.scrollTop = Math.max(0, nextScrollTop);
}

function handlePickerScroll(
  container: HTMLDivElement,
  onChange: (value: number) => void,
) {
  const lockedUntil = programmaticPickerScrollLocks.get(container) ?? 0;

  if (lockedUntil > Date.now()) return;
  if (lockedUntil > 0) programmaticPickerScrollLocks.delete(container);

  const center = container.scrollTop + container.clientHeight / 2;
  const options = Array.from(
    container.querySelectorAll<HTMLButtonElement>("[data-picker-value]"),
  );
  const nearestOption = options.reduce<HTMLButtonElement | null>(
    (nearest, option) => {
      if (!nearest) return option;

      const optionCenter = option.offsetTop + option.offsetHeight / 2;
      const nearestCenter = nearest.offsetTop + nearest.offsetHeight / 2;

      return Math.abs(optionCenter - center) < Math.abs(nearestCenter - center)
        ? option
        : nearest;
    },
    null,
  );
  const value = Number(nearestOption?.dataset.pickerValue);

  if (Number.isInteger(value)) onChange(value);
}

function buildCalendarDays(visibleMonth: Date): (CalendarDay | null)[] {
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const dayCount = new Date(year, month + 1, 0).getDate();
  const cellCount = Math.ceil((firstWeekday + dayCount) / 7) * 7;

  return Array.from({ length: cellCount }, (_, index) => {
    const day = index - firstWeekday + 1;
    if (day < 1 || day > dayCount) return null;

    const date = new Date(year, month, day);
    return { date, value: formatDateValue(date) };
  });
}

function formatAccessibleDate(date: Date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function formatDateTimeLabel(date: string, time: string, today: string) {
  const parsedDate = parseDateValue(date);

  if (!parsedDate) return "请选择日期";

  const dateLabel =
    date === today
      ? `${messages.today} ${pad(parsedDate.getMonth() + 1)}月${pad(
          parsedDate.getDate(),
        )}日`
      : `${parsedDate.getFullYear()}年${pad(
          parsedDate.getMonth() + 1,
        )}月${pad(parsedDate.getDate())}日`;

  return `${dateLabel} ${formatTimeDisplay(time)}`;
}

function formatDateValue(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}`;
}

function formatFullDateLabel(value: string) {
  const date = parseDateValue(value);
  if (!date) return value;

  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 星期${"日一二三四五六"[date.getDay()]}`;
}

function formatTimeDisplay(value: string) {
  const parts = splitTimeValue(value);

  return `${pad(parts.hour)}:${pad(parts.minute)}:${pad(parts.second)}`;
}

function getMonthStart(value: string) {
  const date = parseDateValue(value) ?? new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function parseDateValue(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function splitTimeValue(value: string) {
  const match = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value);

  return {
    hour: normalizeTimePart(match?.[1], 0, 23),
    minute: normalizeTimePart(match?.[2], 0, 59),
    second: normalizeTimePart(match?.[3], 0, 59),
  };
}

function normalizeTimePart(
  value: string | undefined,
  min: number,
  max: number,
) {
  const numericValue = Number(value);

  if (!Number.isInteger(numericValue)) return 0;

  return Math.min(max, Math.max(min, numericValue));
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}
