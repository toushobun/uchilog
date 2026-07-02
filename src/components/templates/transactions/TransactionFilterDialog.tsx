import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { TransactionDateTimePicker } from "molecules/transactions/TransactionDateTimePicker";
import type {
  TransactionFilterOptions,
  TransactionFilters,
  TransactionGroupBy,
} from "types/transactions";

import { TransactionFilterChip } from "./TransactionFilterChip";
import { TransactionFilterGroupSelector } from "./TransactionFilterGroupSelector";
import { TransactionFilterSelect } from "./TransactionFilterSelect";
import {
  otherGroupOptions,
  recordTypeOptions,
  timeGroupOptions,
} from "./transactionFilterConfig";

export function TransactionFilterDialog({
  draftFilters,
  draftGroupBy,
  errorMessage = null,
  filterOptions,
  isPending,
  onApply,
  onChangeFilters,
  onChangeGroupBy,
  onClose,
  onReset,
  open,
}: {
  draftFilters: TransactionFilters;
  draftGroupBy: TransactionGroupBy;
  errorMessage?: string | null;
  filterOptions: TransactionFilterOptions;
  isPending: boolean;
  onApply: () => void;
  onChangeFilters: (filters: TransactionFilters) => void;
  onChangeGroupBy: (groupBy: TransactionGroupBy) => void;
  onClose: () => void;
  onReset: () => void;
  open: boolean;
}) {
  const selectedCategoryId =
    draftFilters.categoryId ?? draftFilters.parentCategoryId;

  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      onClose={onClose}
      open={open}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            mx: 1.5,
            width: "calc(100% - 24px)",
          },
        },
      }}
    >
      <DialogTitle
        sx={{ fontSize: 18, fontWeight: 900, pb: 1.2, textAlign: "center" }}
      >
        筛选
      </DialogTitle>
      <DialogContent sx={{ px: 2.2 }}>
        <Stack spacing={2.2}>
          <Stack spacing={1.2}>
            <Typography sx={sectionTitleSx}>显示方式</Typography>
            <TransactionFilterGroupSelector
              label="时间分组"
              options={timeGroupOptions}
              selected={draftGroupBy}
              onSelect={onChangeGroupBy}
            />
            <TransactionFilterGroupSelector
              label="其他分组"
              options={otherGroupOptions}
              selected={draftGroupBy}
              onSelect={onChangeGroupBy}
            />
          </Stack>

          <Divider />

          <Stack spacing={1.4}>
            <Typography sx={sectionTitleSx}>筛选条件</Typography>
            <Stack
              direction="row"
              spacing={1}
              sx={{ flexWrap: "wrap", rowGap: 1 }}
            >
              {recordTypeOptions.map((option) => (
                <TransactionFilterChip
                  key={option.value}
                  label={option.label}
                  selected={draftFilters.recordType === option.value}
                  onClick={() =>
                    onChangeFilters({
                      ...draftFilters,
                      recordType: option.value,
                    })
                  }
                />
              ))}
            </Stack>

            <Stack direction="row" spacing={1.2}>
              <TransactionDateTimePicker
                date={draftFilters.dateFrom ?? ""}
                fieldLabel="开始日期"
                openPickerLabel="选择开始日期"
                showTime={false}
                onDateChange={(value) =>
                  onChangeFilters({ ...draftFilters, dateFrom: value })
                }
              />
              <TransactionDateTimePicker
                date={draftFilters.dateTo ?? ""}
                fieldLabel="结束日期"
                openPickerLabel="选择结束日期"
                showTime={false}
                onDateChange={(value) =>
                  onChangeFilters({ ...draftFilters, dateTo: value })
                }
              />
            </Stack>

            <TransactionFilterSelect
              label="商家"
              options={filterOptions.merchants.map((merchant) => ({
                label: merchant.name,
                value: merchant.id,
              }))}
              value={draftFilters.merchantId}
              onChange={(value) =>
                onChangeFilters({ ...draftFilters, merchantId: value })
              }
            />
            <TransactionFilterSelect
              label="账户"
              options={filterOptions.accounts.map((account) => ({
                label: account.name,
                value: account.id,
              }))}
              value={draftFilters.accountId}
              onChange={(value) =>
                onChangeFilters({ ...draftFilters, accountId: value })
              }
            />
            <TransactionFilterSelect
              label="标签"
              options={filterOptions.tags.map((tag) => ({
                label: tag.name,
                value: tag.id,
              }))}
              value={draftFilters.tagId}
              onChange={(value) =>
                onChangeFilters({ ...draftFilters, tagId: value })
              }
            />
            <TransactionFilterSelect
              label="分类"
              options={filterOptions.categories.map((category) => ({
                label: category.parentName
                  ? `${category.parentName} / ${category.name}`
                  : category.name,
                value: category.id,
              }))}
              value={selectedCategoryId}
              onChange={(value) => {
                const selectedCategory = filterOptions.categories.find(
                  (category) => category.id === value,
                );

                onChangeFilters({
                  ...draftFilters,
                  categoryId: selectedCategory?.parentId ? value : undefined,
                  parentCategoryId:
                    selectedCategory?.parentId === null ? value : undefined,
                });
              }}
            />
            <TransactionFilterSelect
              label="成员"
              options={filterOptions.members.map((member) => ({
                label: member.name,
                value: member.id,
              }))}
              value={draftFilters.memberId}
              onChange={(value) =>
                onChangeFilters({ ...draftFilters, memberId: value })
              }
            />

            {errorMessage ? (
              <Typography color="error" role="alert" sx={errorMessageSx}>
                {errorMessage}
              </Typography>
            ) : null}
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ gap: 1.2, px: 2.2, pb: 2.2, pt: 1.4 }}>
        <Button
          fullWidth
          onClick={onReset}
          sx={resetButtonSx}
          variant="outlined"
        >
          重置
        </Button>
        <Button
          disabled={isPending}
          fullWidth
          onClick={onApply}
          sx={applyButtonSx}
          variant="contained"
        >
          应用
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const sectionTitleSx = {
  color: "var(--user-theme-section-text)",
  fontSize: 14,
  fontWeight: 900,
};

const errorMessageSx = {
  fontSize: 12,
  fontWeight: 800,
};

const resetButtonSx = {
  borderColor: "var(--user-theme-card-border)",
  borderRadius: 2,
  color: "text.primary",
  fontWeight: 900,
};

const applyButtonSx = {
  bgcolor: "var(--user-theme-action-bg)",
  borderRadius: 2,
  color: "var(--user-theme-action-text)",
  fontWeight: 900,
  "&:hover": {
    bgcolor: "var(--user-theme-field-card-selected-bg)",
  },
};
