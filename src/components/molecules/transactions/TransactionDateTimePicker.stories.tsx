import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

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

export const Default: Story = {};

export const WithTime: Story = {
  args: {
    date: "2025-12-31",
    time: "23:59:59",
  },
};
