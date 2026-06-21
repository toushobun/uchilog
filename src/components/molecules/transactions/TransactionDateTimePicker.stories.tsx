import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { screen, userEvent, within } from "storybook/test";

import { TransactionDateTimePicker } from "./TransactionDateTimePicker";

const meta = {
  title: "Molecules/Transactions/TransactionDateTimePicker",
  component: TransactionDateTimePicker,
  render: function TransactionDateTimePickerStory(args) {
    const [date, setDate] = useState(args.date);
    const [time, setTime] = useState(args.time);

    return (
      <TransactionDateTimePicker
        {...args}
        date={date}
        onDateChange={setDate}
        onTimeChange={setTime}
        time={time}
      />
    );
  },
  args: {
    date: "2026-06-20",
    onDateChange: () => undefined,
    onTimeChange: () => undefined,
    time: "13:10:33",
  },
} satisfies Meta<typeof TransactionDateTimePicker>;

export default meta;

type Story = StoryObj<typeof meta>;

async function openPicker(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);

  await userEvent.click(
    await canvas.findByRole("button", { name: "选择记账时间" }),
  );
}

export const Default: Story = {
  name: "默认当前时间",
};

export const CustomDateTime: Story = {
  name: "自定义日期时间",
  args: {
    date: "2025-12-31",
    time: "18:45:00",
  },
};

export const DatePickerOpen: Story = {
  name: "打开日期选择器",
  play: async ({ canvasElement }) => {
    await openPicker(canvasElement);
  },
};

export const TimePickerOpen: Story = {
  name: "打开时刻选择器",
  play: async ({ canvasElement }) => {
    await openPicker(canvasElement);
    await userEvent.click(
      await screen.findByRole("button", { name: "选择时刻" }),
    );
  },
};

export const MonthPickerOpen: Story = {
  name: "打开年月选择器",
  play: async ({ canvasElement }) => {
    await openPicker(canvasElement);
    await userEvent.click(
      await screen.findByRole("button", { name: "手动选择年月" }),
    );
  },
};

export const Midnight: Story = {
  name: "边界时间 00:00:00",
  args: {
    date: "2026-01-01",
    time: "00:00:00",
  },
};

export const EndOfDay: Story = {
  name: "边界时间 23:59:59",
  args: {
    date: "2026-12-31",
    time: "23:59:59",
  },
};

export const FallbackValue: Story = {
  name: "异常值 fallback",
  args: {
    date: "invalid-date",
    time: "invalid-time",
  },
};
