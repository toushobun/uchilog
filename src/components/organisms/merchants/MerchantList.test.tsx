import { cleanup, render, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createMerchantAliasRow,
  createMerchantRow,
} from "@/test/mocks/merchants";

import { MerchantList } from "./MerchantList";

vi.mock("organisms/merchants/MerchantAliasForm", () => ({
  MerchantAliasForm: (): ReactNode => <div data-testid="merchant-alias-form" />,
}));

vi.mock("organisms/merchants/MerchantEditForm", () => ({
  MerchantEditForm: (): ReactNode => <div data-testid="merchant-edit-form" />,
}));

afterEach(() => {
  cleanup();
});

const baseMerchant = createMerchantRow();

const baseProps = {
  archiveAliasAction: vi.fn(async () => {}),
  archiveMerchantAction: vi.fn(async () => {}),
  createAliasAction: vi.fn(async () => {}),
  errorMerchantId: null,
  errorMessage: null,
  merchants: [],
  updateMerchantAction: vi.fn(async () => {}),
};

describe("MerchantList", () => {
  it("没有商家时显示空状态提示", () => {
    const { container } = render(<MerchantList {...baseProps} />);

    expect(within(container).getByText("还没有商家")).toBeInTheDocument();
  });

  it("有商家时显示商家名称", () => {
    const { container } = render(
      <MerchantList {...baseProps} merchants={[baseMerchant]} />,
    );

    expect(within(container).getByText("LIFE超市")).toBeInTheDocument();
  });

  it("有网址时显示网址链接", () => {
    const { container } = render(
      <MerchantList {...baseProps} merchants={[baseMerchant]} />,
    );

    expect(
      within(container).getByRole("link", { name: "https://www.lifecorp.jp" }),
    ).toBeInTheDocument();
  });

  it("无网址时显示网址未设置提示", () => {
    const { container } = render(
      <MerchantList
        {...baseProps}
        merchants={[createMerchantRow({ website_url: null })]}
      />,
    );

    expect(within(container).getByText("网址未设置")).toBeInTheDocument();
  });

  it("指定 errorMerchantId 的商家显示错误提示", () => {
    const { container } = render(
      <MerchantList
        {...baseProps}
        merchants={[baseMerchant]}
        errorMerchantId={baseMerchant.id}
        errorMessage="商家归档失败。"
      />,
    );

    expect(within(container).getByRole("alert")).toBeInTheDocument();
    expect(within(container).getByText("商家归档失败。")).toBeInTheDocument();
  });

  it("errorMerchantId 不匹配时不显示错误提示", () => {
    const { container } = render(
      <MerchantList
        {...baseProps}
        merchants={[baseMerchant]}
        errorMerchantId="other-id"
        errorMessage="商家归档失败。"
      />,
    );

    expect(within(container).queryByRole("alert")).toBeNull();
  });

  it("有别名时显示别名列表", () => {
    const merchantWithAlias = createMerchantRow({
      aliases: [createMerchantAliasRow()],
    });
    const { container } = render(
      <MerchantList {...baseProps} merchants={[merchantWithAlias]} />,
    );

    expect(within(container).getByText("来福")).toBeInTheDocument();
  });

  it("没有别名时显示暂无别名提示", () => {
    const { container } = render(
      <MerchantList {...baseProps} merchants={[baseMerchant]} />,
    );

    expect(within(container).getByText("还没有别名。")).toBeInTheDocument();
  });
});
