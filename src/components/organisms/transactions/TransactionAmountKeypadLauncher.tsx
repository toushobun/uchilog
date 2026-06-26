"use client";

import { useEffect, useRef, useState } from "react";

import Drawer from "@mui/material/Drawer";
import type { Theme } from "@mui/material/styles";

import { bottomNavigationLayout } from "organisms/navigation/bottomNavigationLayout";
import { appZIndex } from "theme/zIndex";

import { TransactionAmountKeypad } from "./TransactionAmountKeypad";

export const amountKeypadDrawerSx = {
  zIndex: appZIndex.bottomSheet,
};

export const amountKeypadDrawerPaperSx = {
  borderRadius: "18px 18px 0 0",
  px: 1.5,
  pt: 1.5,
  pb: (theme: Theme) =>
    `calc(${theme.spacing(1.5)} + ${bottomNavigationLayout.safeAreaPaddingBottom})`,
};

function setInputValue(input: HTMLInputElement, value: string) {
  const valueSetter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )?.set;

  valueSetter?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

function isAmountInput(target: EventTarget | null): target is HTMLInputElement {
  return (
    target instanceof HTMLInputElement &&
    target.type === "text" &&
    target.dataset.amountInput === "true"
  );
}

function releaseFocusIgnoreAfterNextPaint(callback: () => void) {
  if (typeof window.requestAnimationFrame !== "function") {
    window.setTimeout(callback, 0);
    return;
  }

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(callback);
  });
}

export function TransactionAmountKeypadLauncher() {
  const ignoreFocusRef = useRef(false);
  const [activeInput, setActiveInput] = useState<HTMLInputElement | null>(null);
  const [currency, setCurrency] = useState<string | undefined>();
  const [value, setValue] = useState("");

  useEffect(() => {
    function handleFocusIn(event: FocusEvent) {
      if (ignoreFocusRef.current) return;
      if (!isAmountInput(event.target)) return;

      setActiveInput(event.target);
      setCurrency(event.target.dataset.amountCurrency || undefined);
      setValue(event.target.value);
    }

    document.addEventListener("focusin", handleFocusIn);

    return () => {
      document.removeEventListener("focusin", handleFocusIn);
    };
  }, []);

  function closeKeypad() {
    ignoreFocusRef.current = true;
    activeInput?.blur();
    setActiveInput(null);
    setCurrency(undefined);
    releaseFocusIgnoreAfterNextPaint(() => {
      ignoreFocusRef.current = false;
    });
  }

  function handleChange(nextValue: string) {
    setValue(nextValue);
    if (activeInput) setInputValue(activeInput, nextValue);
  }

  function handleConfirm(nextValue: string) {
    setValue(nextValue);
    closeKeypad();
  }

  return (
    <Drawer
      anchor="bottom"
      open={!!activeInput}
      onClose={closeKeypad}
      ModalProps={{ disableRestoreFocus: true }}
      sx={amountKeypadDrawerSx}
      slotProps={{
        paper: {
          sx: amountKeypadDrawerPaperSx,
        },
      }}
    >
      <TransactionAmountKeypad
        currency={currency}
        value={value}
        onChange={handleChange}
        onConfirm={handleConfirm}
      />
    </Drawer>
  );
}
