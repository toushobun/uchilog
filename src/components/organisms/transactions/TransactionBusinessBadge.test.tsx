import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { TransactionBusinessBadge } from "./TransactionBusinessBadge";

afterEach(() => {
  cleanup();
});

describe("TransactionBusinessBadge", () => {
  it("按业务状态显示默认标签", () => {
    render(<TransactionBusinessBadge status="pendingReimbursement" />);

    expect(screen.getByText("待报销")).toBeInTheDocument();
  });

  it("允许覆盖标签文案", () => {
    render(
      <TransactionBusinessBadge
        label="公司报销中"
        status="pendingReimbursement"
      />,
    );

    expect(screen.getByText("公司报销中")).toBeInTheDocument();
  });
});
