import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { KuraIcon } from "./KuraIcon";
import { KURA_ICON_NAMES, kuraIconRegistry } from "./kuraIconRegistry";

const meta = {
  title: "Atoms/Icons/KuraIcon",
  component: KuraIcon,
  args: {
    name: "quickRecord",
    size: "md",
  },
} satisfies Meta<typeof KuraIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "默认（记一笔）",
};

export const AllIcons: Story = {
  name: "全部图标",
  render: () => (
    <Stack direction="row" sx={{ flexWrap: "wrap", gap: 4, p: 2 }}>
      {KURA_ICON_NAMES.map((name) => (
        <Box
          key={name}
          sx={{
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <KuraIcon name={name} size="lg" />
          <Typography color="text.secondary" variant="caption">
            {kuraIconRegistry[name].label}
          </Typography>
        </Box>
      ))}
    </Stack>
  ),
};

export const Sizes: Story = {
  name: "尺寸变体",
  render: () => (
    <Stack direction="row" sx={{ alignItems: "flex-end", gap: 4, p: 2 }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <Box
          key={size}
          sx={{
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <KuraIcon name="merchant" size={size} />
          <Typography variant="caption">{size}</Typography>
        </Box>
      ))}
      <Box
        sx={{
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <KuraIcon name="merchant" size={96} />
        <Typography variant="caption">96px</Typography>
      </Box>
    </Stack>
  ),
};

export const WithLabel: Story = {
  name: "有 label（覆盖默认）",
  args: {
    name: "account",
    label: "我的账户",
    size: "lg",
  },
};

export const Decorative: Story = {
  name: "装饰图标（decorative）",
  args: {
    name: "tag",
    decorative: true,
    size: "lg",
  },
};
