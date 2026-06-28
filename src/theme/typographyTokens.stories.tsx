import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { designTokens } from "./theme";
import { typographyStyles } from "./typographyTokens";

function TypographyTokensPreview() {
  return (
    <Stack spacing={2}>
      {typographyItems.map((item) => (
        <Stack
          key={item.label}
          spacing={0.75}
          sx={{
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: `${designTokens.radius.md}px`,
            p: 2,
          }}
        >
          <Typography color="text.secondary" variant="caption">
            {item.label}
          </Typography>
          <Typography sx={item.style}>{item.sample}</Typography>
        </Stack>
      ))}
    </Stack>
  );
}

const meta = {
  title: "Theme/TypographyTokens",
  component: TypographyTokensPreview,
} satisfies Meta<typeof TypographyTokensPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

const typographyItems = [
  {
    label: "品牌标题",
    sample: "KuraNote 暮记",
    style: typographyStyles.brandTitle,
  },
  {
    label: "页面标题",
    sample: "新增记账",
    style: typographyStyles.pageTitle,
  },
  {
    label: "卡片标题",
    sample: "近期记录",
    style: typographyStyles.cardTitle,
  },
  {
    label: "正文说明",
    sample: "每一张小票，都是生活的线索。",
    style: typographyStyles.body,
  },
  {
    label: "表单 Label",
    sample: "请选择分类",
    style: typographyStyles.formLabel,
  },
  {
    label: "按钮文字",
    sample: "保存",
    style: typographyStyles.button,
  },
  {
    label: "金额数字",
    sample: "¥ 123,456",
    style: typographyStyles.amount,
  },
  {
    label: "Chip / Badge",
    sample: "日常",
    style: typographyStyles.chipBadge,
  },
  {
    label: "列表 / 设置说明",
    sample: "管理当前账本的现金、银行卡、信用卡等账户。",
    style: typographyStyles.listText,
  },
] as const;

export const Default: Story = {
  name: "字体与文字排版",
};
