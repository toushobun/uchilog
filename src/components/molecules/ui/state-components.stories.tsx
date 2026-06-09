import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { EmptyState } from "./EmptyState";
import { ErrorRetryButton, ErrorState } from "./ErrorState";
import { FormActions } from "./FormActions";
import { LoadingState } from "./LoadingState";
import { SectionCard } from "./SectionCard";

const meta = {
  title: "Molecules/UI/StateComponents",
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  name: "EmptyState",
  render: () => (
    <EmptyState
      title="还没有账户"
      description="请先新增一个账户。"
      action={<Button variant="contained">新增账户</Button>}
    />
  ),
};

export const Loading: Story = {
  name: "LoadingState",
  render: () => (
    <LoadingState title="读取账户中" description="正在读取账户列表。" />
  ),
};

export const Error: Story = {
  name: "ErrorState",
  render: () => (
    <ErrorState
      title="账户操作失败"
      description="账户新增失败。请确认账户名称是否重复。"
      action={<ErrorRetryButton />}
    />
  ),
};

export const CardAndActions: Story = {
  name: "SectionCard + FormActions",
  render: () => (
    <SectionCard>
      <Stack spacing={2}>
        <div>表单内容区域</div>
        <FormActions>
          <Button variant="outlined">取消</Button>
          <Button variant="contained">保存</Button>
        </FormActions>
      </Stack>
    </SectionCard>
  ),
};
