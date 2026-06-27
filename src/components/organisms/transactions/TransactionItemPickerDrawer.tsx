import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import type { Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

import { bottomNavigationLayout } from "organisms/navigation/bottomNavigationLayout";
import { appZIndex } from "theme/zIndex";
import type { TransactionCategoryOption } from "types/transactions";

import type {
  CategoryPickerGroup,
  TransactionItemSummary,
  TransactionPickerErrors,
} from "./TransactionForm.types";
import { smallIconButtonSx } from "./TransactionForm.styles";
import { formatCategoryName } from "./TransactionForm.utils";

type TransactionItemPickerDrawerProps = {
  categoryGroups: CategoryPickerGroup[];
  editingItemId?: number | null;
  filteredCategoryOptions: TransactionCategoryOption[];
  itemSummaries: TransactionItemSummary[];
  onAmountChange: (amount: string) => void;
  onCategoryToggle: (categoryId: string) => void;
  onClose: () => void;
  onGroupSelect: (groupId: string) => void;
  onPickerAdd: () => void;
  onRemoveItem: (itemId: number) => void;
  open: boolean;
  pickerAmount: string;
  pickerCategoryId: string;
  pickerErrors: TransactionPickerErrors;
  selectedAccountCurrency?: string;
  selectedCategoryGroup?: CategoryPickerGroup;
};

export function TransactionItemPickerDrawer({
  categoryGroups,
  editingItemId = null,
  filteredCategoryOptions,
  itemSummaries,
  onAmountChange,
  onCategoryToggle,
  onClose,
  onGroupSelect,
  onPickerAdd,
  onRemoveItem,
  open,
  pickerAmount,
  pickerCategoryId,
  pickerErrors,
  selectedAccountCurrency,
  selectedCategoryGroup,
}: TransactionItemPickerDrawerProps) {
  const activeCategoryGroup =
    categoryGroups.find((group) => group.id === selectedCategoryGroup?.id) ??
    categoryGroups[0];

  return (
    <Drawer
      anchor="bottom"
      onClose={onClose}
      open={open}
      sx={itemPickerDrawerSx}
      slotProps={{ paper: { sx: itemPickerDrawerPaperSx } }}
    >
      <Box
        sx={{
          display: "flex",
          flexShrink: 0,
          justifyContent: "center",
          pt: 1.5,
        }}
      >
        <Box
          sx={{ bgcolor: "divider", borderRadius: 99, height: 4, width: 40 }}
        />
      </Box>

      <Typography
        variant="h6"
        sx={{ flexShrink: 0, fontWeight: 700, px: 2, py: 1.5 }}
      >
        {editingItemId === null ? "添加明细" : "编辑明细"}
      </Typography>

      <Box
        sx={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          overflowY: "auto",
          overscrollBehaviorY: "none",
          px: 2,
        }}
      >
        {itemSummaries.length > 0 ? (
          <>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              已选明细
            </Typography>
            <Stack spacing={0.75} sx={{ mb: 2 }}>
              {itemSummaries.map((item) => (
                <Paper key={item.id} variant="outlined" sx={{ px: 1.5, py: 1 }}>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: "center" }}
                  >
                    <Typography noWrap sx={{ flex: 1, fontSize: 14 }}>
                      {item.category
                        ? formatCategoryName(item.category)
                        : "未选择分类"}
                    </Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                      {item.amount || "—"}
                    </Typography>
                    <IconButton
                      aria-label={`从已选中删除 ${item.category?.name ?? ""}`}
                      onClick={() => onRemoveItem(item.id)}
                      size="small"
                      sx={sheetItemIconButtonSx}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Paper>
              ))}
            </Stack>
            <Divider sx={{ mb: 2 }} />
          </>
        ) : null}

        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
          选择分类
        </Typography>
        {filteredCategoryOptions.length === 0 ? (
          <Typography color="text.secondary">请先新增分类。</Typography>
        ) : (
          <Stack
            direction="row"
            sx={{ flexGrow: 1, flexShrink: 0, minHeight: 180 }}
          >
            <Box sx={categoryGroupListSx}>
              {categoryGroups.map((group) => {
                const isSelected = activeCategoryGroup?.id === group.id;

                return (
                  <Button
                    key={group.id}
                    fullWidth
                    onClick={() => onGroupSelect(group.id)}
                    type="button"
                    sx={{
                      borderLeft: "3px solid",
                      borderColor: isSelected
                        ? "var(--user-theme-action-text)"
                        : "transparent",
                      borderRadius: 0,
                      color: isSelected
                        ? "var(--user-theme-action-text)"
                        : "text.secondary",
                      fontWeight: isSelected ? 700 : 400,
                      justifyContent: "flex-start",
                      pl: 1.5,
                      py: 1.25,
                      textTransform: "none",
                    }}
                  >
                    {group.name}
                  </Button>
                );
              })}
            </Box>

            <Stack spacing={1.5} sx={{ flex: 1, minWidth: 0, pl: 2, pt: 0.5 }}>
              <Stack spacing={0.5}>
                <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
                  {activeCategoryGroup?.categories.map((category) => {
                    const isSelected = pickerCategoryId === category.id;

                    return (
                      <Chip
                        key={category.id}
                        label={category.name}
                        onClick={() => onCategoryToggle(category.id)}
                        variant={isSelected ? "outlined" : "filled"}
                        sx={
                          isSelected
                            ? {
                                borderColor: "var(--user-theme-action-text)",
                                color: "var(--user-theme-action-text)",
                              }
                            : {}
                        }
                      />
                    );
                  })}
                </Stack>
                {pickerErrors.category ? (
                  <Typography color="error" variant="caption">
                    {pickerErrors.category}
                  </Typography>
                ) : null}
              </Stack>

              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: "flex-start" }}
              >
                <TextField
                  error={!!pickerErrors.amount}
                  helperText={pickerErrors.amount}
                  label="金额"
                  onChange={(event) => onAmountChange(event.target.value)}
                  placeholder="0"
                  size="small"
                  slotProps={{
                    htmlInput: {
                      "data-amount-currency": selectedAccountCurrency ?? "",
                      "data-amount-input": "true",
                      inputMode: "decimal" as const,
                    },
                  }}
                  sx={{ flex: 1 }}
                  type="text"
                  value={pickerAmount}
                />
                <Button
                  onClick={onPickerAdd}
                  type="button"
                  variant="contained"
                  sx={drawerAddButtonSx}
                >
                  {editingItemId === null ? "追加" : "更新"}
                </Button>
              </Stack>
            </Stack>
          </Stack>
        )}
      </Box>

      <Box sx={drawerFooterSx}>
        <Stack direction="row" spacing={1.5}>
          <Button
            fullWidth
            onClick={onClose}
            type="button"
            variant="outlined"
            sx={drawerCancelButtonSx}
          >
            取消
          </Button>
          <Button
            fullWidth
            onClick={onClose}
            type="button"
            variant="contained"
            sx={drawerDoneButtonSx}
          >
            完成
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}

const sheetItemIconButtonSx = {
  ...smallIconButtonSx,
  borderRadius: 1,
};

export const itemPickerDrawerSx = {
  zIndex: appZIndex.bottomSheet,
};

export const itemPickerDrawerPaperSx = {
  borderRadius: "16px 16px 0 0",
  display: "flex",
  flexDirection: "column",
  maxHeight: "85vh",
  overflow: "hidden",
};

const categoryGroupListSx = {
  borderRight: 1,
  borderColor: "var(--user-theme-card-border)",
  flexShrink: 0,
  width: 112,
};

const fabButtonBaseSx = {
  background: "var(--user-theme-fab-bg)",
  color: "white",
};

const drawerAddButtonSx = {
  ...fabButtonBaseSx,
  flexShrink: 0,
  height: 40,
};

export const drawerFooterSx = {
  borderTop: 1,
  borderColor: "var(--user-theme-card-border)",
  flexShrink: 0,
  px: 2,
  pt: 1.5,
  pb: (theme: Theme) =>
    `calc(${theme.spacing(2)} + ${bottomNavigationLayout.safeAreaPaddingBottom})`,
};

const drawerCancelButtonSx = {
  borderColor: "var(--user-theme-action-text)",
  color: "var(--user-theme-action-text)",
  "&:hover": { borderColor: "var(--user-theme-action-text)" },
};

const drawerDoneButtonSx = {
  ...fabButtonBaseSx,
  "&:hover": { background: "var(--user-theme-fab-bg)" },
};
