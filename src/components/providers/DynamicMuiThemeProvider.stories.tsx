import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Popover from "@mui/material/Popover";
import Stack from "@mui/material/Stack";
import { ThemeProvider } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { createDynamicMuiTheme } from "./DynamicMuiThemeProvider";
import {
  defaultUserThemeKey,
  type UserThemeKey,
  userThemeKeys,
  userThemeTokens,
} from "theme/userThemeTokens";

type OverlayKind = "dialog" | "drawer" | "menu" | "popover";

type DynamicMuiOverlayPreviewProps = {
  themeKey: UserThemeKey;
  overlay: OverlayKind;
};

function DynamicMuiOverlayPreview({
  themeKey,
  overlay,
}: DynamicMuiOverlayPreviewProps) {
  const token = userThemeTokens[themeKey];

  return (
    <ThemeProvider theme={createDynamicMuiTheme(themeKey)}>
      <Box
        sx={{
          bgcolor: "background.default",
          border: 1,
          borderColor: "divider",
          borderRadius: 3,
          color: "text.primary",
          minHeight: overlay === "drawer" ? 240 : 320,
          overflow: "hidden",
          p: 3,
          position: "relative",
          width: 420,
        }}
      >
        <Stack spacing={1.5}>
          <Typography variant="h6">{token.name}</Typography>
          <Typography color="text.secondary" variant="body2">
            这个 story 用于确认 overlay 组件（Dialog / Drawer / Menu /
            Popover）的背景已通过 styleOverrides 固定为基础 paper，并与
            background.paper（用户主题 card）保持区分。
          </Typography>
          <Button variant="contained">主题主色按钮</Button>
        </Stack>

        <OverlaySurface overlay={overlay} />
      </Box>
    </ThemeProvider>
  );
}

function OverlaySurface({ overlay }: { overlay: OverlayKind }) {
  if (overlay === "dialog") {
    return (
      <Dialog
        disablePortal
        hideBackdrop
        maxWidth="xs"
        open
        sx={{
          position: "static",
          "& .MuiDialog-container": {
            alignItems: "flex-start",
            height: "auto",
            position: "static",
          },
          "& .MuiDialog-paper": {
            m: 0,
            mt: 3,
          },
        }}
      >
        <DialogTitle>确认删除记录</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" variant="body2">
            Dialog 背景应保持基础 paper，不使用普通卡片色。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button>取消</Button>
          <Button variant="contained">确认</Button>
        </DialogActions>
      </Dialog>
    );
  }

  if (overlay === "drawer") {
    return (
      <Drawer
        anchor="right"
        open
        sx={{
          mt: 3,
          position: "static",
          "& .MuiDrawer-paper": {
            borderLeft: 1,
            borderColor: "divider",
            p: 2,
            position: "static",
            width: 260,
          },
        }}
        variant="persistent"
      >
        <Typography sx={{ fontWeight: "fontWeightBold" }}>项目选择</Typography>
        <List dense>
          <ListItem disablePadding>
            <ListItemText primary="食材" secondary="Drawer 背景确认" />
          </ListItem>
          <ListItem disablePadding>
            <ListItemText primary="日用品" secondary="保持基础 paper" />
          </ListItem>
        </List>
      </Drawer>
    );
  }

  if (overlay === "menu") {
    return (
      <Menu
        anchorPosition={{ left: 112, top: 212 }}
        anchorReference="anchorPosition"
        disablePortal
        disableScrollLock
        open
      >
        <MenuItem>编辑</MenuItem>
        <MenuItem>复制</MenuItem>
        <MenuItem>删除</MenuItem>
      </Menu>
    );
  }

  return (
    <Popover
      anchorPosition={{ left: 112, top: 212 }}
      anchorReference="anchorPosition"
      disablePortal
      disableScrollLock
      open
    >
      <Box sx={{ maxWidth: 240, p: 2 }}>
        <Typography sx={{ fontWeight: "fontWeightBold" }}>补充说明</Typography>
        <Typography color="text.secondary" variant="body2">
          Popover 背景应保持基础 paper，避免被卡片 token 无意污染。
        </Typography>
      </Box>
    </Popover>
  );
}

const meta = {
  title: "Providers/DynamicMuiThemeProvider",
  component: DynamicMuiOverlayPreview,
  args: {
    themeKey: defaultUserThemeKey,
    overlay: "dialog",
  },
  argTypes: {
    themeKey: {
      control: "select",
      options: userThemeKeys,
    },
    overlay: {
      control: "select",
      options: ["dialog", "drawer", "menu", "popover"],
    },
  },
} satisfies Meta<typeof DynamicMuiOverlayPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DialogOverlay: Story = {
  name: "Dialog 背景确认",
  args: {
    overlay: "dialog",
  },
};

export const DrawerOverlay: Story = {
  name: "Drawer 背景确认",
  args: {
    overlay: "drawer",
  },
};

export const MenuOverlay: Story = {
  name: "Menu 背景确认",
  args: {
    overlay: "menu",
  },
};

export const PopoverOverlay: Story = {
  name: "Popover 背景确认",
  args: {
    overlay: "popover",
  },
};
