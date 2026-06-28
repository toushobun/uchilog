import { useMemo, useState } from "react";

import CloseIcon from "@mui/icons-material/Close";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { alpha, type Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

import { bottomNavigationLayout } from "organisms/navigation/bottomNavigationLayout";
import { appZIndex } from "theme/zIndex";
import type { TransactionCategoryOption } from "types/transactions";

import type {
  CategoryPickerGroup,
  TransactionPickerErrors,
} from "./TransactionForm.types";
import { matchesCategorySearch } from "./TransactionCategorySearch";
import { getCurrencySymbol } from "./TransactionForm.utils";

type TransactionItemPickerDrawerProps = {
  categoryGroups: CategoryPickerGroup[];
  editingItemId?: number | null;
  filteredCategoryOptions: TransactionCategoryOption[];
  onAmountChange: (amount: string) => void;
  onCategoryToggle: (categoryId: string) => void;
  onClose: () => void;
  onGroupSelect: (groupId: string) => void;
  onPickerAdd: () => boolean;
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
  const [searchText, setSearchText] = useState("");
  const amountCurrencySymbol = getCurrencySymbol(selectedAccountCurrency);
  const displayedGroups = useMemo(() => {
    if (!searchText.trim()) return categoryGroups;

    return categoryGroups
      .map((group) => ({
        ...group,
        categories: group.categories.filter(
          (category) =>
            matchesCategorySearch(group.name, searchText) ||
            matchesCategorySearch(category.name, searchText) ||
            matchesCategorySearch(`${group.name}/${category.name}`, searchText),
        ),
      }))
      .filter((group) => group.categories.length > 0);
  }, [categoryGroups, searchText]);
  const activeCategoryGroup =
    displayedGroups.find((group) => group.id === selectedCategoryGroup?.id) ??
    displayedGroups[0];
  const selectedCategory = categoryGroups
    .flatMap((group) => group.categories)
    .find((category) => category.id === pickerCategoryId);
  const selectedPath = selectedCategory
    ? `${selectedCategory.parentName ?? activeCategoryGroup?.name ?? ""} > ${selectedCategory.name}`
    : activeCategoryGroup
      ? `${activeCategoryGroup.name} > 请选择小分类`
      : "请选择分类";
  const quickCategories = categoryGroups
    .flatMap((group) =>
      group.categories.map((category) => ({ category, group })),
    )
    .slice(0, 5);

  function selectCategory(groupId: string, categoryId: string) {
    if (selectedCategoryGroup?.id !== groupId) onGroupSelect(groupId);
    onCategoryToggle(categoryId);
  }

  function handleConfirm() {
    if (onPickerAdd()) closeDrawer();
  }

  function handleDelete() {
    if (editingItemId === null) return;
    onRemoveItem(editingItemId);
    closeDrawer();
  }

  function closeDrawer() {
    setSearchText("");
    onClose();
  }

  return (
    <Drawer
      anchor="bottom"
      onClose={closeDrawer}
      open={open}
      sx={itemPickerDrawerSx}
      slotProps={{ paper: { sx: itemPickerDrawerPaperSx } }}
    >
      <Box sx={drawerHandleSx}>
        <Box sx={drawerHandleBarSx} />
      </Box>

      <Stack direction="row" sx={drawerHeaderSx}>
        <Typography component="h2" variant="h6" sx={drawerTitleSx}>
          {editingItemId === null ? "添加明细" : "编辑明细"}
        </Typography>
        <IconButton aria-label="关闭" onClick={closeDrawer} sx={closeButtonSx}>
          <CloseIcon />
        </IconButton>
      </Stack>

      <Box sx={drawerBodySx}>
        <TextField
          fullWidth
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="搜索小分类"
          size="small"
          slotProps={{
            htmlInput: { "aria-label": "搜索小分类" },
            input: {
              endAdornment: searchText ? (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="清空搜索"
                    edge="end"
                    onClick={() => setSearchText("")}
                    size="small"
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon color="action" fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={searchFieldSx}
          value={searchText}
        />

        {filteredCategoryOptions.length === 0 ? (
          <Typography color="text.secondary">请先新增分类。</Typography>
        ) : (
          <>
            <SectionLabel>常用快捷</SectionLabel>
            <Stack direction="row" sx={quickCategoryListSx}>
              {quickCategories.map(({ category, group }) => (
                <Chip
                  key={category.id}
                  label={`${group.name} · ${category.name}`}
                  onClick={() => selectCategory(group.id, category.id)}
                  size="small"
                  sx={quickCategoryChipSx}
                  variant="outlined"
                />
              ))}
            </Stack>

            <Stack direction="row" sx={categoryLabelRowSx}>
              <SectionLabel>分类选择</SectionLabel>
              <Typography color="text.secondary" variant="caption">
                （同时选择）
              </Typography>
            </Stack>

            {displayedGroups.length === 0 ? (
              <Box sx={emptySearchSx}>
                <Typography color="text.secondary" variant="body2">
                  没有匹配的小分类
                </Typography>
              </Box>
            ) : (
              <Stack direction="row" spacing={1} sx={categoryColumnsSx}>
                <Stack sx={categoryColumnSx}>
                  {displayedGroups.map((group) => {
                    const isSelected = activeCategoryGroup?.id === group.id;

                    return (
                      <Button
                        key={group.id}
                        onClick={() => onGroupSelect(group.id)}
                        type="button"
                        sx={categoryOptionSx(isSelected)}
                      >
                        <DragIndicatorRoundedIcon sx={categoryDragHandleSx} />
                        {group.name}
                      </Button>
                    );
                  })}
                  <CategoryAddButton>添加大分类</CategoryAddButton>
                </Stack>

                <Stack sx={categoryColumnSx}>
                  {activeCategoryGroup?.categories.map((category) => (
                    <Button
                      key={category.id}
                      onClick={() =>
                        activeCategoryGroup
                          ? selectCategory(activeCategoryGroup.id, category.id)
                          : onCategoryToggle(category.id)
                      }
                      type="button"
                      sx={categoryOptionSx(pickerCategoryId === category.id)}
                    >
                      <DragIndicatorRoundedIcon sx={categoryDragHandleSx} />
                      {category.name}
                    </Button>
                  ))}
                  <CategoryAddButton>添加小分类</CategoryAddButton>
                </Stack>
              </Stack>
            )}

            {pickerErrors.category ? (
              <Typography color="error" variant="caption">
                {pickerErrors.category}
              </Typography>
            ) : null}

            <Typography sx={selectedPathSx} variant="body2">
              已选：{selectedPath}
            </Typography>

            <Stack direction="row" spacing={1} sx={amountRowSx}>
              <Typography sx={fieldLabelSx} variant="body2">
                金额
              </Typography>
              <TextField
                error={!!pickerErrors.amount}
                fullWidth
                helperText={pickerErrors.amount}
                onChange={(event) => onAmountChange(event.target.value)}
                placeholder="0.00"
                size="small"
                slotProps={{
                  htmlInput: {
                    "aria-label": "金额",
                    "data-amount-currency": selectedAccountCurrency ?? "",
                    "data-amount-input": "true",
                    inputMode: "decimal" as const,
                  },
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        {amountCurrencySymbol}
                      </InputAdornment>
                    ),
                  },
                }}
                sx={amountFieldSx}
                type="text"
                value={pickerAmount}
              />
            </Stack>
          </>
        )}
      </Box>

      <Box sx={drawerFooterSx}>
        <Stack direction="row" spacing={1.5}>
          <Button
            fullWidth
            onClick={editingItemId === null ? closeDrawer : handleDelete}
            type="button"
            variant="outlined"
            sx={editingItemId === null ? drawerCancelButtonSx : deleteButtonSx}
          >
            {editingItemId === null ? "取消" : "删除明细"}
          </Button>
          <Button
            fullWidth
            onClick={handleConfirm}
            type="button"
            variant="contained"
            sx={drawerDoneButtonSx}
          >
            {editingItemId === null ? "确定" : "保存修改"}
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography sx={sectionLabelSx} variant="subtitle2">
      {children}
    </Typography>
  );
}

function CategoryAddButton({ children }: { children: React.ReactNode }) {
  return (
    <Button
      aria-disabled="true"
      startIcon={<AddRoundedIcon fontSize="small" />}
      sx={categoryAddButtonSx}
      tabIndex={-1}
      type="button"
    >
      {children}
    </Button>
  );
}

export const itemPickerDrawerSx = { zIndex: appZIndex.bottomSheet };

export const itemPickerDrawerPaperSx = {
  bgcolor: "background.paper",
  borderRadius: "24px 24px 0 0",
  display: "flex",
  flexDirection: "column",
  maxHeight: "92vh",
  overflow: "hidden",
};

const drawerHandleSx = {
  display: "flex",
  flexShrink: 0,
  justifyContent: "center",
  pt: 1.25,
};

const drawerHandleBarSx = {
  bgcolor: "divider",
  borderRadius: 99,
  height: 4,
  width: 48,
};

const drawerHeaderSx = {
  alignItems: "center",
  flexShrink: 0,
  justifyContent: "space-between",
  px: 2.5,
  py: 0.75,
};

const drawerTitleSx = { fontWeight: 800 };
const closeButtonSx = { color: "text.secondary", mr: -1 };

const drawerBodySx = {
  flex: 1,
  overflowY: "auto",
  overscrollBehaviorY: "none",
  px: 2.5,
  pb: 1.5,
};

const searchFieldSx = {
  mb: 1,
  "& .MuiOutlinedInput-root": { borderRadius: 2.5 },
};

const sectionLabelSx = { fontWeight: 800, mt: 1, mb: 0.5 };

const quickCategoryListSx = { flexWrap: "wrap", gap: 0.75 };

const quickCategoryChipSx = {
  bgcolor: "background.paper",
  borderColor: "divider",
  fontWeight: 600,
};

const categoryLabelRowSx = { alignItems: "baseline", mt: 0.5 };

const categoryColumnsSx = { minHeight: 184 };

const categoryColumnSx = {
  border: 1,
  borderColor: "divider",
  borderRadius: 0.75,
  flex: 1,
  minWidth: 0,
  overflow: "hidden",
  py: 0.25,
};

const categoryOptionSx = (selected: boolean) => (theme: Theme) => ({
  bgcolor: selected
    ? `var(--user-theme-field-card-selected-bg, ${alpha(theme.palette.primary.main, 0.12)})`
    : "transparent",
  border: selected ? 1 : 0,
  borderColor: selected
    ? `var(--user-theme-field-card-selected-border, ${theme.palette.primary.main})`
    : "transparent",
  borderRadius: 0.75,
  color: selected
    ? `var(--user-theme-action-text, ${theme.palette.primary.main})`
    : theme.palette.text.primary,
  fontWeight: selected ? 800 : 500,
  justifyContent: "flex-start",
  minHeight: 30,
  mx: 0.25,
  px: 1.5,
  py: 0.25,
  textTransform: "none",
});

const categoryDragHandleSx = {
  color: "text.disabled",
  flexShrink: 0,
  fontSize: "1.125rem",
  mr: 0.75,
};

const categoryAddButtonSx = {
  borderRadius: 0,
  borderTop: 1,
  borderColor: "divider",
  color: "primary.main",
  flexShrink: 0,
  justifyContent: "flex-start",
  minHeight: 36,
  mt: "auto",
  px: 1.5,
  textTransform: "none",
};

const emptySearchSx = {
  alignItems: "center",
  border: 1,
  borderColor: "divider",
  borderRadius: 2,
  display: "flex",
  justifyContent: "center",
  minHeight: 184,
};

const selectedPathSx = { fontWeight: 700, mt: 0.75 };

const amountRowSx = { alignItems: "flex-start", mt: 0.75 };

const fieldLabelSx = { fontWeight: 800, minWidth: 44, pt: 1 };

const amountFieldSx = {
  "& .MuiOutlinedInput-root": { borderRadius: 2 },
};

export const drawerFooterSx = {
  bgcolor: "background.paper",
  borderTop: 1,
  borderColor: "divider",
  flexShrink: 0,
  px: 2.5,
  pt: 1.25,
  pb: (theme: Theme) =>
    `calc(${theme.spacing(2)} + ${bottomNavigationLayout.safeAreaPaddingBottom})`,
};

const drawerCancelButtonSx = {
  borderColor: "divider",
  color: "text.primary",
  minHeight: 48,
};

const deleteButtonSx = {
  borderColor: "error.light",
  color: "error.main",
  minHeight: 48,
};

const drawerDoneButtonSx = (theme: Theme) => ({
  background: `var(--user-theme-fab-bg, ${theme.palette.primary.main})`,
  color: theme.palette.common.white,
  minHeight: 48,
  "&:hover": {
    background: `var(--user-theme-fab-bg, ${theme.palette.primary.dark})`,
  },
});
