import { cleanup, render, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createMerchantAliasRow,
  createMerchantRow,
} from "@/test/mocks/merchants";

import { MerchantCard } from "./MerchantCard";

vi.mock("organisms/merchants/MerchantAliasForm", () => ({
  MerchantAliasForm: (): ReactNode => <div data-testid="merchant-alias-form" />,
}));

vi.mock("organisms/merchants/MerchantEditForm", () => ({
  MerchantEditForm: (): ReactNode => <div data-testid="merchant-edit-form" />,
}));

afterEach(() => {
  cleanup();
});

const merchant = createMerchantRow({
  aliases: [createMerchantAliasRow()],
  note: "常去的超市",
});

const actions = {
  archiveAliasAction: vi.fn(async () => {}),
  archiveMerchantAction: vi.fn(async () => {}),
  createAliasAction: vi.fn(async () => {}),
  updateMerchantAction: vi.fn(async () => {}),
};

describe("MerchantCard", () => {
  it("显示商家基本信息、别名和表单区域", () => {
    const { container } = render(
      <MerchantCard {...actions} errorMessage={null} merchant={merchant} />,
    );

    expect(within(container).getByText("LIFE超市")).toBeInTheDocument();
    expect(
      within(container).getByRole("link", { name: "https://www.lifecorp.jp" }),
    ).toBeInTheDocument();
    expect(within(container).getByText("常去的超市")).toBeInTheDocument();
    expect(within(container).getByText("来福")).toBeInTheDocument();
    expect(
      within(container).getByTestId("merchant-alias-form"),
    ).toBeInTheDocument();
    expect(
      within(container).getByTestId("merchant-edit-form"),
    ).toBeInTheDocument();
  });

  it("没有网址和别名时显示空提示", () => {
    const { container } = render(
      <MerchantCard
        {...actions}
        errorMessage={null}
        merchant={createMerchantRow({ aliases: [], website_url: null })}
      />,
    );

    expect(within(container).getByText("网址未设置")).toBeInTheDocument();
    expect(within(container).getByText("还没有别名。")).toBeInTheDocument();
  });

  it("有错误信息时显示 alert", () => {
    const { container } = render(
      <MerchantCard
        {...actions}
        errorMessage="商家归档失败。"
        merchant={merchant}
      />,
    );

    expect(within(container).getByRole("alert")).toBeInTheDocument();
    expect(within(container).getByText("商家归档失败。")).toBeInTheDocument();
  });
});
