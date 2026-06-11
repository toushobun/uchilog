"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";

import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import Link from "next/link";

import { routePaths } from "config/paths";
import { designTokens } from "theme/theme";
import {
  transactionTypeOptions,
  type TransactionAccountOption,
  type TransactionCategoryOption,
  type TransactionMerchantOption,
  type TransactionType,
} from "types/transactions";
import { getMerchantInitial } from "utils/merchants";
import { getNowDateTimeLocalValue } from "utils/transactions";

type TransactionFormProps = {
  action: (formData: FormData) => Promise<void>;
  accountOptions: TransactionAccountOption[];
  categoryOptions: TransactionCategoryOption[];
  errorMessage?: string | null;
  ledgerName?: string;
  merchantOptions: TransactionMerchantOption[];
};

type TransactionFormItem = {
  amount: string;
  categoryId: string;
  id: number;
};

type CategoryPickerGroup = {
  categories: TransactionCategoryOption[];
  id: string;
  name: string;
};

// 后续标签维护功能落地后，这里会替换为可选择且可保存的标签数据。
const tagPreviewOptions = [
  { label: "日常", sx: { bgcolor: "#E3E7F0", color: "#4D5565" } },
  { label: "腐败", sx: { bgcolor: "#FFE2B9", color: "#A45B00" } },
  { label: "公司", sx: { bgcolor: "#BFE9E5", color: "#176A66" } },
  { label: "人情", sx: { bgcolor: "#FFD5E3", color: "#A33D62" } },
  { label: "孩子", sx: { bgcolor: "#D8EFC5", color: "#4E7A2E" } },
  { label: "旅游", sx: { bgcolor: "#DDD2FF", color: "#5B48A0" } },
  { label: "装修", sx: { bgcolor: "#FFE6C7", color: "#A7611A" } },
  { label: "结婚", sx: { bgcolor: "#FFD9C7", color: "#A45230" } },
] as const;

export function TransactionForm({
  action,
  accountOptions,
  categoryOptions,
  errorMessage,
  ledgerName,
  merchantOptions,
}: TransactionFormProps) {
  const transactionAtInputRef = useRef<HTMLInputElement>(null);
  const timeZoneOffsetInputRef = useRef<HTMLInputElement>(null);
  const nextItemIdRef = useRef(1);
  const merchantFieldRef = useRef<HTMLDivElement>(null);
  const accountFieldRef = useRef<HTMLDivElement>(null);
  const itemsFieldRef = useRef<HTMLDivElement>(null);
  const [selectedType, setSelectedType] = useState<TransactionType>("expense");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [selectedMerchantId, setSelectedMerchantId] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    merchant?: string;
    account?: string;
    items?: string;
  }>({});
  const [items, setItems] = useState<TransactionFormItem[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedCategoryGroupId, setSelectedCategoryGroupId] = useState("");
  const [pickerCategoryId, setPickerCategoryId] = useState("");
  const [pickerAmount, setPickerAmount] = useState("");
  const [pickerErrors, setPickerErrors] = useState<{
    category?: string;
    amount?: string;
  }>({});

  useEffect(() => {
    if (transactionAtInputRef.current) {
      transactionAtInputRef.current.value = getNowDateTimeLocalValue();
    }

    if (timeZoneOffsetInputRef.current) {
      timeZoneOffsetInputRef.current.value = String(
        new Date().getTimezoneOffset(),
      );
    }
  }, []);

  const filteredCategoryOptions = useMemo(
    () => categoryOptions.filter((category) => category.type === selectedType),
    [categoryOptions, selectedType],
  );
  const categoryGroups = useMemo(
    () => buildCategoryPickerGroups(filteredCategoryOptions),
    [filteredCategoryOptions],
  );

  const effectiveCategoryGroupId = categoryGroups.some(
    (group) => group.id === selectedCategoryGroupId,
  )
    ? selectedCategoryGroupId
    : (categoryGroups[0]?.id ?? "");

  const selectedCategoryGroup =
    categoryGroups.find((group) => group.id === effectiveCategoryGroupId) ??
    categoryGroups[0];
  const selectedAccount = accountOptions.find(
    (account) => account.id === selectedAccountId,
  );
  const selectedMerchant = merchantOptions.find(
    (merchant) => merchant.id === selectedMerchantId,
  );
  const categoryById = useMemo(
    () => new Map(categoryOptions.map((category) => [category.id, category])),
    [categoryOptions],
  );

  const itemSummaries = items.map((item) => ({
    ...item,
    category: categoryById.get(item.categoryId),
  }));
  const totalAmount = items.reduce((sum, item) => {
    if (!isPositiveMoneyText(item.amount)) return sum;

    return sum + Number(item.amount);
  }, 0);
  const hasValidItems =
    totalAmount > 0 &&
    items.every(
      (item) => item.categoryId.length > 0 && isPositiveMoneyText(item.amount),
    );
  const isSubmitDisabled =
    accountOptions.length === 0 || filteredCategoryOptions.length === 0;
  const signedTotalAmount =
    totalAmount > 0
      ? `${selectedType === "expense" ? "-" : "+"}${totalAmount}`
      : "未填写金额";

  function addItem(categoryId: string, amount: string) {
    const itemId = nextItemIdRef.current;
    nextItemIdRef.current += 1;
    setItems((currentItems) => [
      ...currentItems,
      { amount, categoryId, id: itemId },
    ]);
    if (fieldErrors.items)
      setFieldErrors((prev) => ({ ...prev, items: undefined }));
  }

  function updateItem(
    itemId: number,
    values: Partial<Omit<TransactionFormItem, "id">>,
  ) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId ? { ...item, ...values } : item,
      ),
    );
  }

  function removeItem(itemId: number) {
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== itemId),
    );
  }

  function openSheet() {
    setPickerCategoryId("");
    setPickerAmount("");
    setPickerErrors({});
    setSelectedCategoryGroupId(categoryGroups[0]?.id ?? "");
    setIsSheetOpen(true);
  }

  function closeSheet() {
    setIsSheetOpen(false);
  }

  function handlePickerGroupSelect(groupId: string) {
    setSelectedCategoryGroupId(groupId);
    setPickerCategoryId("");
    setPickerAmount("");
    setPickerErrors({});
  }

  function handlePickerCategoryToggle(categoryId: string) {
    setPickerCategoryId((prev) => (prev === categoryId ? "" : categoryId));
    if (pickerErrors.category)
      setPickerErrors((prev) => ({ ...prev, category: undefined }));
  }

  function handlePickerAdd() {
    const errors: typeof pickerErrors = {};
    if (!pickerCategoryId) errors.category = "请至少选择一个小分类。";
    if (!isPositiveMoneyText(pickerAmount)) errors.amount = "请输入有效金额。";

    if (Object.keys(errors).length > 0) {
      setPickerErrors(errors);
      return;
    }

    setPickerErrors({});
    addItem(pickerCategoryId, pickerAmount);
    setPickerCategoryId("");
    setPickerAmount("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const errors: typeof fieldErrors = {};
    if (!selectedMerchantId) errors.merchant = "请选择商家。";
    if (!selectedAccountId) errors.account = "请选择账户。";
    if (!hasValidItems) errors.items = "请至少添加一条明细。";

    if (Object.keys(errors).length > 0) {
      event.preventDefault();
      setFieldErrors(errors);
      setTimeout(() => {
        const firstErrorRef = errors.merchant
          ? merchantFieldRef
          : errors.account
            ? accountFieldRef
            : itemsFieldRef;
        firstErrorRef.current?.scrollIntoView?.({
          behavior: "smooth",
          block: "center",
        });
      }, 0);
    } else {
      setFieldErrors({});
    }
  }

  return (
    <form id="new-transaction-form" action={action} onSubmit={handleSubmit}>
      <Stack spacing={2.5}>
        <Stack spacing={1}>
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: "center", justifyContent: "space-between" }}
          >
            <Button
              component={Link}
              href={routePaths.transactions}
              variant="text"
              sx={{ color: "var(--user-theme-action-text)" }}
            >
              关闭
            </Button>
            <Typography component="h1" variant="h5" sx={{ fontWeight: 700 }}>
              新增记账
            </Typography>
            <Button
              disabled={isSubmitDisabled}
              type="submit"
              variant="contained"
              sx={{
                "&:not(.Mui-disabled)": {
                  background: "var(--user-theme-fab-bg)",
                  color: "white",
                },
              }}
            >
              保存
            </Button>
          </Stack>
          {ledgerName ? (
            <Typography
              color="text.secondary"
              sx={{ textAlign: "center" }}
              variant="body2"
            >
              当前账本：{ledgerName}
            </Typography>
          ) : null}
        </Stack>

        {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

        <input
          ref={timeZoneOffsetInputRef}
          name="timeZoneOffsetMinutes"
          type="hidden"
        />
        <input name="type" type="hidden" value={selectedType} />

        <ToggleButtonGroup
          aria-label="类型"
          exclusive
          fullWidth
          onChange={(_, value: TransactionType | null) => {
            if (value) {
              setSelectedType(value);
              setIsSheetOpen(false);
              setItems([]);
            }
          }}
          value={selectedType}
          sx={{
            "& .MuiToggleButton-root.Mui-selected": {
              color: "var(--user-theme-action-text)",
              backgroundColor: "var(--user-theme-bottom-nav-active-bg)",
            },
            "& .MuiToggleButton-root.Mui-selected:hover": {
              backgroundColor: "var(--user-theme-bottom-nav-active-bg)",
            },
          }}
        >
          {transactionTypeOptions.map((option) => (
            <ToggleButton key={option.value} value={option.value}>
              {option.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <TextField
          ref={merchantFieldRef}
          disabled={merchantOptions.length === 0}
          error={!!fieldErrors.merchant}
          fullWidth
          helperText={
            fieldErrors.merchant ??
            (merchantOptions.length === 0 ? "请先新增商家。" : undefined)
          }
          label="商家"
          name="merchantId"
          onChange={(event) => {
            setSelectedMerchantId(event.target.value);
            if (fieldErrors.merchant)
              setFieldErrors((prev) => ({ ...prev, merchant: undefined }));
          }}
          select
          value={selectedMerchantId}
        >
          <MenuItem disabled value="">
            请选择商家
          </MenuItem>
          {merchantOptions.map((merchant) => (
            <MenuItem key={merchant.id} value={merchant.id}>
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ alignItems: "center" }}
              >
                <Avatar
                  alt={merchant.name}
                  src={merchant.icon_url ?? undefined}
                  sx={{ height: 24, width: 24 }}
                >
                  {getMerchantInitial(merchant.name)}
                </Avatar>
                <span>{merchant.name}</span>
              </Stack>
            </MenuItem>
          ))}
        </TextField>

        <TextField
          ref={accountFieldRef}
          disabled={accountOptions.length === 0}
          error={!!fieldErrors.account}
          fullWidth
          helperText={
            fieldErrors.account ??
            (accountOptions.length === 0
              ? "请先新增账户。"
              : "选择这笔记录使用的账户。")
          }
          label="账户"
          name="accountId"
          onChange={(event) => {
            setSelectedAccountId(event.target.value);
            if (fieldErrors.account)
              setFieldErrors((prev) => ({ ...prev, account: undefined }));
          }}
          select
          value={selectedAccountId}
        >
          <MenuItem disabled value="">
            请选择账户
          </MenuItem>
          {accountOptions.map((account) => (
            <MenuItem key={account.id} value={account.id}>
              {account.name}（{account.currency}）
            </MenuItem>
          ))}
        </TextField>

        <Paper ref={itemsFieldRef} variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={1.5}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              消费明细
            </Typography>

            {items.length === 0 ? (
              <Typography
                color={fieldErrors.items ? "error" : "text.secondary"}
                variant="body2"
                sx={{ py: 0.5 }}
              >
                {fieldErrors.items ?? "请点击下方按钮添加明细。"}
              </Typography>
            ) : (
              items.map((item, index) => {
                const category = categoryById.get(item.categoryId);
                const categoryLabel = category
                  ? formatCategoryName(category)
                  : "请选择分类";

                return (
                  <Paper
                    key={item.id}
                    elevation={0}
                    sx={{
                      bgcolor: designTokens.color.background.subtle,
                      borderRadius: 2,
                      px: 1.5,
                      py: 1,
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ alignItems: "center", minHeight: 48 }}
                    >
                      <input
                        name="itemCategoryId"
                        type="hidden"
                        value={item.categoryId}
                      />
                      <Typography noWrap sx={{ flex: 1, fontWeight: 700 }}>
                        {categoryLabel}
                      </Typography>
                      <TextField
                        hiddenLabel
                        name="itemAmount"
                        onChange={(event) =>
                          updateItem(item.id, { amount: event.target.value })
                        }
                        placeholder="0"
                        size="small"
                        slotProps={{
                          htmlInput: {
                            inputMode: "decimal",
                            sx: { textAlign: "right" },
                          },
                          input: {
                            disableUnderline: true,
                          },
                        }}
                        type="text"
                        value={item.amount}
                        variant="standard"
                        sx={{
                          width: 96,
                          "& .MuiInputBase-root": {
                            bgcolor: "transparent",
                            fontSize: "1.25rem",
                            fontWeight: 800,
                          },
                        }}
                      />
                      <IconButton
                        aria-label={`删除明细 ${index + 1}`}
                        onClick={() => removeItem(item.id)}
                        size="small"
                        sx={{
                          color: "text.secondary",
                          height: 40,
                          width: 40,
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Paper>
                );
              })
            )}

            <Button
              disabled={filteredCategoryOptions.length === 0}
              onClick={openSheet}
              type="button"
              variant="text"
              sx={{
                border: "2px dashed",
                borderColor: "var(--user-theme-action-text)",
                borderRadius: 2,
                color: "var(--user-theme-action-text)",
                minHeight: 48,
              }}
            >
              + 添加一项明细
            </Button>

            {items.length > 0 && (
              <Box
                sx={{
                  bgcolor: designTokens.color.background.subtle,
                  borderRadius: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  px: 2,
                  py: 1.25,
                }}
              >
                <Typography sx={{ fontWeight: 700 }}>
                  共 {items.length} 项
                </Typography>
                <Typography
                  sx={{
                    color: "var(--user-theme-action-text)",
                    fontWeight: 800,
                  }}
                >
                  合计 {signedTotalAmount}
                </Typography>
              </Box>
            )}
          </Stack>
        </Paper>

        <Stack spacing={1}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            标签（选填）
          </Typography>
          <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
            {tagPreviewOptions.map((tag) => (
              <Chip
                key={tag.label}
                label={tag.label}
                size="small"
                sx={{
                  borderRadius: 999,
                  fontWeight: 700,
                  ...tag.sx,
                }}
              />
            ))}
          </Stack>
        </Stack>

        <TextField
          fullWidth
          label="备注"
          minRows={3}
          multiline
          name="note"
          placeholder="可选"
        />

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={1.5}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              保存前汇总
            </Typography>
            <SummaryRow
              label="商家"
              value={selectedMerchant?.name ?? "未选择"}
            />
            <SummaryRow
              label="账户"
              value={
                selectedAccount
                  ? `${selectedAccount.name}（${selectedAccount.currency}）`
                  : "未选择"
              }
            />
            {itemSummaries.map((item, index) => (
              <SummaryRow
                key={item.id}
                label={`明细 ${index + 1}`}
                value={`${item.category ? formatCategoryName(item.category) : "未选择分类"} / ${item.amount || "未填写金额"}`}
              />
            ))}
            <Divider />
            <SummaryRow label="合计金额" value={signedTotalAmount} strong />
          </Stack>
        </Paper>

        <TextField
          fullWidth
          inputRef={transactionAtInputRef}
          label="发生时间"
          name="transactionAt"
          required
          slotProps={{
            htmlInput: {
              step: 1,
            },
            inputLabel: {
              shrink: true,
            },
          }}
          type="datetime-local"
        />

        <Button
          disabled={isSubmitDisabled}
          size="large"
          type="submit"
          variant="contained"
          sx={{
            "&:not(.Mui-disabled)": {
              background: "var(--user-theme-fab-bg)",
              color: "white",
            },
          }}
        >
          保存记账
        </Button>
      </Stack>

      <Drawer
        anchor="bottom"
        onClose={closeSheet}
        open={isSheetOpen}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "16px 16px 0 0",
              display: "flex",
              flexDirection: "column",
              maxHeight: "85vh",
              overflow: "hidden",
            },
          },
        }}
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
          添加明细
        </Typography>

        <Box sx={{ flex: 1, overflowY: "auto", px: 2 }}>
          {itemSummaries.length > 0 && (
            <>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                已选明细
              </Typography>
              <Stack spacing={0.75} sx={{ mb: 2 }}>
                {itemSummaries.map((item) => (
                  <Paper
                    key={item.id}
                    variant="outlined"
                    sx={{ px: 1.5, py: 1 }}
                  >
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
                        onClick={() => removeItem(item.id)}
                        size="small"
                        sx={{
                          borderRadius: 1,
                          color: "text.secondary",
                          height: 40,
                          width: 40,
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
              <Divider sx={{ mb: 2 }} />
            </>
          )}

          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
            选择分类
          </Typography>
          {filteredCategoryOptions.length === 0 ? (
            <Typography color="text.secondary">
              请先新增{selectedType === "expense" ? "支出" : "收入"}小分类。
            </Typography>
          ) : (
            <Stack direction="row" sx={{ minHeight: 180 }}>
              <Box
                sx={{
                  borderRight: 1,
                  borderColor: "divider",
                  flexShrink: 0,
                  width: 112,
                }}
              >
                {categoryGroups.map((group) => {
                  const isSelected = selectedCategoryGroup?.id === group.id;
                  return (
                    <Button
                      key={group.id}
                      fullWidth
                      onClick={() => handlePickerGroupSelect(group.id)}
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

              <Stack
                spacing={1.5}
                sx={{ flex: 1, minWidth: 0, pl: 2, pt: 0.5 }}
              >
                <Stack spacing={0.5}>
                  <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
                    {selectedCategoryGroup?.categories.map((category) => {
                      const isSelected = pickerCategoryId === category.id;
                      return (
                        <Chip
                          key={category.id}
                          label={category.name}
                          onClick={() =>
                            handlePickerCategoryToggle(category.id)
                          }
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
                  {pickerErrors.category && (
                    <Typography color="error" variant="caption">
                      {pickerErrors.category}
                    </Typography>
                  )}
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
                    onChange={(event) => {
                      setPickerAmount(event.target.value);
                      if (pickerErrors.amount)
                        setPickerErrors((prev) => ({
                          ...prev,
                          amount: undefined,
                        }));
                    }}
                    placeholder="0"
                    size="small"
                    slotProps={{ htmlInput: { inputMode: "decimal" } }}
                    sx={{ flex: 1 }}
                    type="text"
                    value={pickerAmount}
                  />
                  <Button
                    onClick={handlePickerAdd}
                    type="button"
                    variant="contained"
                    sx={{
                      flexShrink: 0,
                      height: 40,
                      background: "var(--user-theme-fab-bg)",
                      color: "white",
                    }}
                  >
                    追加
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          )}
        </Box>

        <Box
          sx={{
            borderTop: 1,
            borderColor: "divider",
            flexShrink: 0,
            p: 2,
            pt: 1.5,
          }}
        >
          <Stack direction="row" spacing={1.5}>
            <Button
              fullWidth
              onClick={closeSheet}
              type="button"
              variant="outlined"
              sx={{
                borderColor: "var(--user-theme-action-text)",
                color: "var(--user-theme-action-text)",
                "&:hover": { borderColor: "var(--user-theme-action-text)" },
              }}
            >
              取消
            </Button>
            <Button
              fullWidth
              onClick={closeSheet}
              type="button"
              variant="contained"
              sx={{
                background: "var(--user-theme-fab-bg)",
                color: "white",
                "&:hover": { background: "var(--user-theme-fab-bg)" },
              }}
            >
              完成
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </form>
  );
}

function buildCategoryPickerGroups(categories: TransactionCategoryOption[]) {
  return categories.reduce<CategoryPickerGroup[]>((groups, category) => {
    const groupId = category.parentId ?? "";
    const groupName = category.parentName ?? category.name;
    const group = groups.find((currentGroup) => currentGroup.id === groupId);

    if (group) {
      group.categories.push(category);
      return groups;
    }

    groups.push({ categories: [category], id: groupId, name: groupName });
    return groups;
  }, []);
}

function formatCategoryName(category: TransactionCategoryOption) {
  return category.parentName
    ? `${category.parentName} / ${category.name}`
    : category.name;
}

function isPositiveMoneyText(value: string) {
  if (!/^\d+(\.\d{1,2})?$/.test(value.trim())) return false;

  const amount = Number(value);

  return Number.isFinite(amount) && amount > 0;
}

function SummaryRow({
  label,
  strong = false,
  value,
}: {
  label: string;
  strong?: boolean;
  value: string;
}) {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{ alignItems: "center", justifyContent: "space-between" }}
    >
      <Typography color="text.secondary" variant="body2">
        {label}
      </Typography>
      <Typography
        sx={{ fontWeight: strong ? 700 : 500, textAlign: "right" }}
        variant={strong ? "subtitle1" : "body2"}
      >
        {value}
      </Typography>
    </Stack>
  );
}
