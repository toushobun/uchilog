import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { FormEvent } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ArchiveAccountButton } from "./ArchiveAccountButton";

const originalConfirm = window.confirm;

afterEach(() => {
  cleanup();
  window.confirm = originalConfirm;
});

describe("ArchiveAccountButton", () => {
  it("渲染归档按钮", () => {
    render(
      <form>
        <ArchiveAccountButton />
      </form>,
    );

    expect(screen.getByRole("button", { name: "归档" })).toBeTruthy();
  });

  it("点击按钮时弹出确认对话框", () => {
    window.confirm = vi.fn(() => true);

    render(
      <form>
        <ArchiveAccountButton />
      </form>,
    );

    fireEvent.click(screen.getByRole("button", { name: "归档" }));

    expect(window.confirm).toHaveBeenCalledWith("确定归档该账户吗？");
  });

  it("用户确认后不阻止事件默认行为", () => {
    window.confirm = vi.fn(() => true);
    const handleSubmit = vi.fn((e: FormEvent<HTMLFormElement>) =>
      e.preventDefault(),
    );

    render(
      <form onSubmit={handleSubmit}>
        <ArchiveAccountButton />
      </form>,
    );

    fireEvent.click(screen.getByRole("button", { name: "归档" }));

    expect(window.confirm).toHaveBeenCalled();
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it("用户取消时阻止表单提交", () => {
    window.confirm = vi.fn(() => false);
    const handleSubmit = vi.fn((e: FormEvent<HTMLFormElement>) =>
      e.preventDefault(),
    );

    render(
      <form onSubmit={handleSubmit}>
        <ArchiveAccountButton />
      </form>,
    );

    fireEvent.click(screen.getByRole("button", { name: "归档" }));

    expect(window.confirm).toHaveBeenCalled();
    expect(handleSubmit).not.toHaveBeenCalled();
  });
});
