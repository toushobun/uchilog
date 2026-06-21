import React, { useEffect, useMemo, useRef } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { keyframes } from "@mui/material/styles";

const PROGRAMMATIC_PICKER_SCROLL_LOCK_MS = 500;
const PICKER_SCROLL_END_FALLBACK_MS = 150;
const programmaticPickerScrollLocks = new WeakMap<Element, number>();
const pendingProgrammaticScrollEnds = new WeakSet<Element>();

export function PickerColumn({
  children,
  onChange,
  overlay = true,
}: {
  children: React.ReactNode;
  onChange: (value: number) => void;
  overlay?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollEndTimerRef = useRef<number | null>(null);
  const supportsScrollEnd =
    typeof window !== "undefined" && "onscrollend" in window;
  const childCount = React.Children.count(children);
  const syncAnimation = useMemo(
    () => keyframes`
      from { transform: translateY(0); }
      to { transform: translateY(${-(childCount - 1) * 40}px); }
    `,
    [childCount],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !supportsScrollEnd) return;

    const handleScrollEnd = () => {
      if (pendingProgrammaticScrollEnds.has(container)) {
        pendingProgrammaticScrollEnds.delete(container);
        if (isPickerScrollLocked(container)) return;
      }
      handlePickerScrollEnd(container, onChange);
    };

    container.addEventListener("scrollend", handleScrollEnd);

    return () => {
      container.removeEventListener("scrollend", handleScrollEnd);
    };
  }, [onChange, supportsScrollEnd]);

  useEffect(
    () => () => {
      clearPickerScrollEndTimer(scrollEndTimerRef);
    },
    [],
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
        ref={containerRef}
        onScroll={(event) => {
          handlePickerScroll(
            event.currentTarget,
            onChange,
            scrollEndTimerRef,
            supportsScrollEnd,
          );
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

export function pickerOptionSx(selected: boolean, withOverlay = false) {
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

export function scrollPickerOptionIntoView(option: HTMLButtonElement) {
  const container = option.parentElement;
  if (!container) return;

  const nextScrollTop =
    option.offsetTop + option.offsetHeight / 2 - container.clientHeight / 2;

  programmaticPickerScrollLocks.set(
    container,
    Date.now() + PROGRAMMATIC_PICKER_SCROLL_LOCK_MS,
  );
  pendingProgrammaticScrollEnds.add(container);

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
  container: HTMLElement,
  onChange: (value: number) => void,
  scrollEndTimerRef: React.MutableRefObject<number | null>,
  supportsScrollEnd: boolean,
) {
  if (isPickerScrollLocked(container)) return;
  if (supportsScrollEnd) return;

  clearPickerScrollEndTimer(scrollEndTimerRef);
  scrollEndTimerRef.current = window.setTimeout(() => {
    scrollEndTimerRef.current = null;
    handlePickerScrollEnd(container, onChange);
  }, PICKER_SCROLL_END_FALLBACK_MS);
}

function handlePickerScrollEnd(
  container: HTMLElement,
  onChange: (value: number) => void,
) {
  if (isPickerScrollLocked(container)) return;

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

function isPickerScrollLocked(container: HTMLElement) {
  const lockedUntil = programmaticPickerScrollLocks.get(container) ?? 0;

  if (lockedUntil > Date.now()) return true;
  if (lockedUntil > 0) programmaticPickerScrollLocks.delete(container);
  return false;
}

function clearPickerScrollEndTimer(
  scrollEndTimerRef: React.MutableRefObject<number | null>,
) {
  if (scrollEndTimerRef.current === null) return;

  window.clearTimeout(scrollEndTimerRef.current);
  scrollEndTimerRef.current = null;
}
