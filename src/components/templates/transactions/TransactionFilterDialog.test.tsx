import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TransactionFilterDialog } from "./TransactionFilterDialog";

const filterOptions = {
  accounts: [],
  categories: [
    {
      id: "food",
      name: "餐饮",
      parentId: null,
      parentName: null,
      type: "expense" as const,
    },
    {
      id: "lunch",
      name: "午餐",
      parentId: "food",
      parentName: "餐饮",
      type: "expense" as const,
    },
  ],
  members: [],
  merchants: [],
  tags: [],
};

describe("TransactionFilterDialog", () => {
  it("使用同一个分类选择框切换大分类和小分类", () => {
    const onChangeFilters = vi.fn();

    render(
      <TransactionFilterDialog
        draftFilters={{ parentCategoryId: "food", recordType: "all" }}
        draftGroupBy="month"
        filterOptions={filterOptions}
        isPending={false}
        onApply={vi.fn()}
        onChangeFilters={onChangeFilters}
        onChangeGroupBy={vi.fn()}
        onClose={vi.fn()}
        onReset={vi.fn()}
        open
      />,
    );

    expect(screen.getByRole("combobox", { name: "分类" })).toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: "大分类" })).toBeNull();
    expect(screen.queryByRole("combobox", { name: "小分类" })).toBeNull();

    fireEvent.mouseDown(screen.getByRole("combobox", { name: "分类" }));
    fireEvent.click(screen.getByRole("option", { name: "餐饮 / 午餐" }));

    expect(onChangeFilters).toHaveBeenCalledWith({
      categoryId: "lunch",
      parentCategoryId: undefined,
      recordType: "all",
    });
  });

  describe("日期筛选", () => {
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ["Date"] });
      vi.setSystemTime(new Date("2026-06-18T03:00:00.000Z"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    function renderDialog(onChangeFilters = vi.fn()) {
      render(
        <TransactionFilterDialog
          draftFilters={{ recordType: "all" }}
          draftGroupBy="month"
          filterOptions={filterOptions}
          isPending={false}
          onApply={vi.fn()}
          onChangeFilters={onChangeFilters}
          onChangeGroupBy={vi.fn()}
          onClose={vi.fn()}
          onReset={vi.fn()}
          open
        />,
      );

      return onChangeFilters;
    }

    it("不再使用自由文本输入日期", () => {
      renderDialog();

      expect(screen.queryByRole("textbox", { name: "开始日期" })).toBeNull();
      expect(screen.queryByRole("textbox", { name: "结束日期" })).toBeNull();
      expect(
        screen.getByRole("button", { name: "选择开始日期" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "选择结束日期" }),
      ).toBeInTheDocument();
    });

    it("通过日历选择开始日期", () => {
      const onChangeFilters = renderDialog();

      fireEvent.click(screen.getByRole("button", { name: "选择开始日期" }));
      fireEvent.click(screen.getByRole("button", { name: "2026年6月10日" }));

      expect(onChangeFilters).toHaveBeenCalledWith({
        dateFrom: "2026-06-10",
        recordType: "all",
      });
    });

    it("通过日历选择结束日期", () => {
      const onChangeFilters = renderDialog();

      fireEvent.click(screen.getByRole("button", { name: "选择结束日期" }));
      fireEvent.click(screen.getByRole("button", { name: "2026年6月20日" }));

      expect(onChangeFilters).toHaveBeenCalledWith({
        dateTo: "2026-06-20",
        recordType: "all",
      });
    });
  });
});
