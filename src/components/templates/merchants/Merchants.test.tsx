import { cleanup, render, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MerchantsTemplate } from "./Merchants";

vi.mock("server/actions/merchants", () => ({
  archiveMerchant: vi.fn(),
  archiveMerchantAlias: vi.fn(),
  createMerchant: vi.fn(),
  createMerchantAlias: vi.fn(),
  updateMerchant: vi.fn(),
}));

afterEach(() => {
  cleanup();
});

const baseProps = {
  archiveMerchantAction: vi.fn(async () => {}),
  archiveMerchantAliasAction: vi.fn(async () => {}),
  createMerchantAction: vi.fn(async () => {}),
  createMerchantAliasAction: vi.fn(async () => {}),
  merchants: [],
  keyword: "",
  ledgerName: "家庭账本",
  errorMerchantId: null,
  errorMessage: null,
  updateMerchantAction: vi.fn(async () => {}),
};

describe("MerchantsTemplate", () => {
  it("显示商家页面标题", () => {
    const { container } = render(<MerchantsTemplate {...baseProps} />);

    expect(
      within(container).getByRole("heading", { name: "商家" }),
    ).toBeTruthy();
  });

  it("显示当前账本名称", () => {
    const { container } = render(<MerchantsTemplate {...baseProps} />);

    expect(within(container).getByText("当前账本：家庭账本")).toBeTruthy();
  });

  it("显示搜索输入框", () => {
    const { container } = render(<MerchantsTemplate {...baseProps} />);

    expect(within(container).getByLabelText("搜索商家")).toBeTruthy();
  });

  it("有搜索词时输入框显示对应值", () => {
    const { container } = render(
      <MerchantsTemplate {...baseProps} keyword="便利" />,
    );

    const input = within(container).getByLabelText("搜索商家");

    expect((input as HTMLInputElement).value).toBe("便利");
  });

  it("无关联商家时的全局错误信息显示在列表外", () => {
    const { container } = render(
      <MerchantsTemplate
        {...baseProps}
        errorMessage="商家新增失败。"
        errorMerchantId={null}
      />,
    );

    expect(within(container).getByRole("alert")).toBeTruthy();
    expect(within(container).getByText("商家新增失败。")).toBeTruthy();
  });

  it("指定了 errorMerchantId 时不显示全局错误提示", () => {
    const { container } = render(
      <MerchantsTemplate
        {...baseProps}
        errorMessage="商家归档失败。"
        errorMerchantId="some-merchant-id"
      />,
    );

    expect(within(container).queryByRole("alert")).toBeNull();
  });
});
