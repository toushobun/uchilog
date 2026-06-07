import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LoginForm } from "./LoginForm";

afterEach(() => {
  cleanup();
});

describe("LoginForm", () => {
  it("显示邮箱和密码输入框", () => {
    render(<LoginForm action={vi.fn(async () => ({}))} />);

    expect(screen.getByLabelText(/邮箱/)).toBeTruthy();
    expect(screen.getByLabelText(/密码/)).toBeTruthy();
  });

  it("显示登录按钮", () => {
    render(<LoginForm action={vi.fn(async () => ({}))} />);

    expect(screen.getByRole("button", { name: "登录" })).toBeTruthy();
  });

  it("邮箱输入框类型为 email", () => {
    render(<LoginForm action={vi.fn(async () => ({}))} />);

    expect(screen.getByLabelText(/邮箱/).getAttribute("type")).toBe("email");
  });

  it("密码输入框类型为 password", () => {
    render(<LoginForm action={vi.fn(async () => ({}))} />);

    expect(screen.getByLabelText(/密码/).getAttribute("type")).toBe("password");
  });
});
