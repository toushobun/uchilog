import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { createTheme } from "@mui/material/styles";
import { afterEach, describe, expect, it } from "vitest";

import { bottomNavigationLayout } from "organisms/navigation/bottomNavigationLayout";
import { appZIndex } from "theme/zIndex";

import {
  amountKeypadDrawerPaperSx,
  amountKeypadDrawerSx,
  TransactionAmountKeypadLauncher,
} from "./TransactionAmountKeypadLauncher";

function renderAmountInput(currency?: string) {
  render(
    <div>
      <input
        data-amount-currency={currency}
        data-amount-input="true"
        placeholder="0"
        type="text"
      />
      <TransactionAmountKeypadLauncher />
    </div>,
  );
}

afterEach(() => {
  cleanup();
});

describe("TransactionAmountKeypadLauncher", () => {
  it("金额输入框获得焦点后显示计算器并回填金额", async () => {
    renderAmountInput();

    const input = screen.getByRole("textbox");
    fireEvent.focusIn(input);

    expect(screen.getByLabelText("金额计算器")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "1" }));
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    fireEvent.click(screen.getByRole("button", { name: "确认" }));

    expect(input).toHaveProperty("value", "12");
    await waitFor(() => {
      expect(screen.queryByLabelText("金额计算器")).toBeNull();
    });
  });

  it("会读取金额输入框上的货币信息", () => {
    renderAmountInput("USD");

    fireEvent.focusIn(screen.getByRole("textbox"));

    expect(screen.getByLabelText("计算器显示金额").textContent).toContain(
      "$ 0",
    );
  });

  it("确认时不重复写入已经同步过的金额", () => {
    renderAmountInput();

    const input = screen.getByRole("textbox");
    const inputValues: string[] = [];
    input.addEventListener("input", () => {
      inputValues.push((input as HTMLInputElement).value);
    });

    fireEvent.focusIn(input);
    fireEvent.click(screen.getByRole("button", { name: "1" }));
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    fireEvent.click(screen.getByRole("button", { name: "确认" }));

    expect(inputValues).toEqual(["1", "12"]);
  });

  it("抽屉层级位于底部导航和 snackbar 之间并保持面板贴底", () => {
    expect(amountKeypadDrawerSx.zIndex).toBe(appZIndex.bottomSheet);
    expect(amountKeypadDrawerSx.zIndex).toBeGreaterThan(
      bottomNavigationLayout.navigationZIndex,
    );
    expect(amountKeypadDrawerSx.zIndex).toBeLessThan(appZIndex.snackbar);
    expect("bottom" in amountKeypadDrawerPaperSx).toBe(false);
  });

  it("抽屉内部会用 spacing scale 为 safe-area 预留底部内边距", () => {
    const theme = createTheme();

    expect(amountKeypadDrawerPaperSx.pb(theme)).toBe(
      `calc(${theme.spacing(1.5)} + ${bottomNavigationLayout.safeAreaPaddingBottom})`,
    );
  });

  it("不会仅因 placeholder 为 0 就响应普通输入框", () => {
    render(
      <div>
        <input placeholder="0" type="text" />
        <TransactionAmountKeypadLauncher />
      </div>,
    );

    fireEvent.focusIn(screen.getByRole("textbox"));

    expect(screen.queryByLabelText("金额计算器")).toBeNull();
  });
});
