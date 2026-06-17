"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";

import CloseIcon from "@mui/icons-material/Close";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import Link from "next/link";

import {
  maxTransactionTagCount,
  maxTransactionTagNameLength,
} from "@/constants/transactions";
import { routePaths } from "config/paths";
import { designTokens } from "theme/theme";
import {
  transactionTypeOptions,
  type TransactionAccountOption,
  type TransactionCategoryOption,
  type TransactionMerchantOption,
  type TransactionTagOption,
  type TransactionType,
} from "types/transactions";
import { getMerchantInitial } from "utils/merchants";
import { transactionFormValidationMessages } from "utils/transactionMessages";
import { transactionTagValidationMessages } from "utils/transactionTagValidationMessages";
import { getNowDateTimeLocalValue } from "utils/transactions";

export type TransactionFormInitialValues = {
  accountId: string;
  items: TransactionFormInitialItem[];
  merchantId: string;
  note: string;
  tagNames: string[];
  transactionAt: string;
  transactionRecordId?: string;
  type: TransactionType;
};

type TransactionFormInitialItem = {
  amount: string;
  categoryId: string;
};

type TransactionFormProps = {
  action: (formData: FormData) => Promise<void>;
  accountOptions: TransactionAccountOption[];
  categoryOptions: TransactionCategoryOption[];
  closeHref?: string;
  errorMessage?: string | null;
  formId?: string;
  initialValues?: TransactionFormInitialValues;
  ledgerName?: string;
  merchantOptions: TransactionMerchantOption[];
  submitLabel?: string;
  tagOptions: TransactionTagOption[];
  title?: string;
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

const emptyItemsByType: Record<TransactionType, TransactionFormItem[]> = {
  expense: [],
  income: [],
};

export function TransactionForm({
  action,
  accountOptions,
  categoryOptions,
  closeHref = routePaths.transactions,
  errorMessage,
  formId = "new-transaction-form",
  initialValues,
  ledgerName,
  merchantOptions,
  submitLabel = "保存记账",
  tagOptions,
  title = "新增记账",
}: TransactionFormProps) {
  const transactionAtInputRef = useRef<HTMLInputElement>(null);
  const timeZoneOffsetInputRef = useRef<HTMLInputElement>(null);
  const nextItemIdRef = useRef((initialValues?.items.length ?? 0) + 1);
  const merchantFieldRef = useRef<HTMLDivElement>(null);
  const accountFieldRef = useRef<HTMLDivElement>(null);
  const itemsFieldRef = useRef<HTMLDivElement>(null);
  const tagsFieldRef = useRef<HTMLDivElement>(null);
  const [selectedType, setSelectedType] = useState<TransactionType>(
    initialValues?.type ?? "expense",
  );
  const [selectedAccountId, setSelectedAccountId] = useState(
    initialValues?.accountId ?? "",
  );
  const [selectedMerchantId, setSelectedMerchantId] = useState(
    initialValues?.merchantId ?? "",
  );
  const [fieldErrors, setFieldErrors] = useState<{
    account?: string;
    items?: string;
    merchant?: string;
    tags?: string;
  }>({});
  const [itemsByType, setItemsByType] = useState<
    Record<TransactionType, TransactionFormItem[]>
  >(() => createInitialItemsByType(initialValues));
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedCategoryGroupId, setSelectedCategoryGroupId] = useState("");
  const [pickerCategoryId, setPickerCategoryId] = useState("");
  const [pickerAmount, setPickerAmount] = useState("");
  const [pickerErrors, setPickerErrors] = useState<{
    category?: string;
    amount?: string;
  }>({});
  const [selectedTagNames, setSelectedTagNames] = useState<string[]>(
    initialValues?.tagNames ?? [],
  );
  const [newTagName, setNewTagName] = useState("");

  const items = itemsByType[selectedType];

  useEffect(() => {
    if (transactionAtInputRef.current) {
      transactionAtInputRef.current.value = initialValues?.transactionAt
        ? formatDateTimeLocalInputValue(initialValues.transactionAt)
        : getNowDateTimeLocalValue();
    }

    if (timeZoneOffsetInputRef.current) {
      timeZoneOffsetInputRef.current.value = String(
        new Date().getTimezoneOffset(),
      );
    }
  }, [initialValues?.transactionAt]);

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
  const suggestedTagOptions = tagOptions.filter(
    (tag) => !hasTagName(selectedTagNames, tag.name),
  );

  const itemSummaries = items.map((item) => ({
    ...item,
    category: categoryById.get(item.categoryId),
  }));
  const totalAmount = items.reduce((sum, item) => {
    if (!isValidMoneyText(item.amount)) return sum;

    return sum + Number(item.amount);
  }, 0);
  const hasValidItems =
    items.length > 0 &&
    items.every((item) => {
      const category = categoryById.get(item.categoryId);
      return (
        category?.type === selectedType &&
        item.categoryId.length > 0 &&
        isValidMoneyText(item.amount)
      );
    });
  const hasValidTags = !getSelectedTagError(selectedTagNames);
  const isSubmitDisabled =
    accountOptions.length === 0 ||
    merchantOptions.length === 0 ||
    filteredCategoryOptions.length === 0 ||
    !hasValidTags;
  const signedTotalAmount =
    items.length > 0
      ? formatSignedAmount(selectedType, totalAmount)
      : "未填写金额";

  function setCurrentItems(
    updater:
      | TransactionFormItem[]
      | ((currentItems: TransactionFormItem[]) => TransactionFormItem[]),
  ) {
    setItemsByType((currentItemsByType) => {
      const currentItems = currentItemsByType[selectedType];
      const nextItems =
        typeof updater === "function" ? updater(currentItems) : updater;

      return {
        ...currentItemsByType,
        [selectedType]: nextItems,
      };
    });
  }

  function addItem(categoryId: string, amount: string) {
    const itemId = nextItemIdRef.current;
    nextItemIdRef.current += 1;
    setCurrentItems((currentItems) => [
      ...currentItems,
      { amount, categoryId, id: itemId },
    ]);
    if (fieldErrors.items) {
      setFieldErrors((prev) => ({ ...prev, items: undefined }));
    }
  }

  function updateItem(
    itemId: number,
    values: Partial<Omit<TransactionFormItem, "id">>,
  ) {
    setCurrentItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId ? { ...item, ...values } : item,
      ),
    );
  }

  function removeItem(itemId: number) {
    setCurrentItems((currentItems) =>
      currentItems.filter((item) => item.id !== itemId),
    );
  }

  function addTag(tagName: string) {
    const normalizedTagName = tagName.trim();

    if (!normalizedTagName) return;

    const tagError = getNextTagError(selectedTagNames, normalizedTagName);

    if (tagError) {
      setFieldErrors((prev) => ({ ...prev, tags: tagError }));
      return;
    }

    setSelectedTagNames((currentTagNames) => [
      ...currentTagNames,
      normalizedTagName,
    ]);
    setNewTagName("");
    if (fieldErrors.tags) {
      setFieldErrors((prev) => ({ ...prev, tags: undefined }));
    }
  }

  function removeTag(tagName: string) {
    setSelectedTagNames((currentTagNames) =>
      currentTagNames.filter(
        (currentTagName) =>
          currentTagName.toLowerCase() !== tagName.toLowerCase(),
      ),
    );
    if (fieldErrors.tags) {
      setFieldErrors((prev) => ({ ...prev, tags: undefined }));
    }
  }

  function openSheet() {
    setPickerCategoryId("");
    setPickerAmount("0");
    setPickerErrors({});
    setSelectedCategoryGroupId(categoryGroups[0]?.id ?? "");
    setIsSheetOpen(true);
  }

  function closeSheet() {
    setIsSheetOpen(false);
  }

  function handleTypeChange(value: TransactionType | null) {
    if (!value || value === selectedType) return;

    setSelectedType(value);
    setIsSheetOpen(false);
    setPickerCategoryId("");
    setPickerAmount("0");
    setPickerErrors({});
    setSelectedCategoryGroupId("");
    setFieldErrors((prev) => ({ ...prev, items: undefined }));
  }

  function handlePickerGroupSelect(groupId: string) {
    setSelectedCategoryGroupId(groupId);
    setPickerCategoryId("");
    setPickerAmount("0");
    setPickerErrors({});
  }

  function handlePickerCategoryToggle(categoryId: string) {
    setPickerCategoryId((prev) => (prev === categoryId ? "" : categoryId));
    if (pickerErrors.category) {
      setPickerErrors((prev) => ({ ...prev, category: undefined }));
    }
  }

  function handlePickerAdd() {
    const errors: typeof pickerErrors = {};
    if (!pickerCategoryId) {
      errors.category = transactionFormValidationMessages.categoryRequired;
    }
    if (!isValidMoneyText(pickerAmount)) {
      errors.amount = transactionFormValidationMessages.amountInvalid;
    }

    if (Object.keys(errors).length > 0) {
      setPickerErrors(errors);
      return;
    }

    setPickerErrors({});
    addItem(pickerCategoryId, pickerAmount);
    setPickerCategoryId("");
    setPickerAmount("0");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const errors: typeof fieldErrors = {};
    const tagError = getSelectedTagError(selectedTagNames);

    if (!selectedMerchantId) {
      errors.merchant = transactionFormValidationMessages.merchantRequired;
    }
    if (!selectedAccountId) {
      errors.account = transactionFormValidationMessages.accountRequired;
    }
    if (!hasValidItems) {
      errors.items = transactionFormValidationMessages.itemsRequired;
    }
    if (tagError) {
      errors.tags = tagError;
    }

    if (Object.keys(errors).length > 0) {
      cancelDefaultEvent(event);
      setFieldErrors(errors);
      setTimeout(() => {
        const firstErrorRef = errors.merchant
          ? merchantFieldRef
          : errors.account
            ? accountFieldRef
            : errors.items
              ? itemsFieldRef
              : tagsFieldRef;
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
    <form id={formId} action={action} onSubmit={handleSubmit}>
      <Stack spacing={2.5}>
        <Stack spacing={1}>
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: "center", justifyContent: "space-between" }}
          >
            <Button
              component={Link}
              href={closeHref}
              variant="text"
              sx={{ color: "var(--user-theme-action-text)" }}
            >
              关闭
            </Button>
            <Typography component="h1" variant="h5" sx={{ fontWeight: 700 }}>
              {title}
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
        {initialValues?.transactionRecordId ? (
          <input
            name="transactionRecordId"
            type="hidden"
            value={initialValues.transactionRecordId}
          />
        ) : null}
        <input name="type" type="hidden" value={selectedType} />
        {selectedTagNames.map((tagName) => (
          <input key={tagName} name="tagName" type="hidden" value={tagName} />
        ))}

        <ToggleButtonGroup
          aria-label="类型"
          exclusive
          fullWidth
          onChange={(_, value: TransactionType | null) =>
            handleTypeChange(value)
          }
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
            (merchantOptions.length === 0
              ? "请先新增商家。"
              : "选择这笔记录的商家。")
          }
          label="商家"
          name="merchantId"
          onChange={(event) => {
            setSelectedMerchantId(event.target.value);
            if (fieldErrors.merchant) {
              setFieldErrors((prev) => ({ ...prev, merchant: undefined }));
            }
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
            if (fieldErrors.account) {
              setFieldErrors((prev) => ({ ...prev, account: undefined }));
            }
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
                            "aria-label": `明细 ${index + 1} 金额`,
                            "data-amount-currency":
                              selectedAccount?.currency ?? "",
                            "data-amount-input": "true",
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
              aria-label="添加明细"
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

            {items.length > 0 ? (
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
            ) : null}
          </Stack>
        </Paper>

        <Paper ref={tagsFieldRef} variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={1.5}>
            <Stack spacing={0.5}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                标签（选填）
              </Typography>
              <Typography color="text.secondary" variant="body2">
                可从既有标签选择，也可以直接输入新标签。
              </Typography>
            </Stack>

            {selectedTagNames.length > 0 ? (
              <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
                {selectedTagNames.map((tagName) => (
                  <Chip
                    key={tagName}
                    label={tagName}
                    onDelete={() => removeTag(tagName)}
                    size="small"
                    sx={{ borderRadius: 999, fontWeight: 700 }}
                  />
                ))}
              </Stack>
            ) : (
              <Typography color="text.secondary" variant="body2">
                还没有选择标签。
              </Typography>
            )}

            {suggestedTagOptions.length > 0 ? (
              <Stack spacing={0.75}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  已有标签
                </Typography>
                <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
                  {suggestedTagOptions.map((tag) => (
                    <Chip
                      key={tag.id}
                      label={tag.name}
                      onClick={() => addTag(tag.name)}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderColor: tag.color ?? undefined,
                        borderRadius: 999,
                        color: tag.color ?? designTokens.color.brand.main,
                        fontWeight: 700,
                      }}
                    />
                  ))}
                </Stack>
              </Stack>
            ) : null}

            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "flex-start" }}
            >
              <TextField
                error={!!fieldErrors.tags}
                fullWidth
                helperText={
                  fieldErrors.tags ?? transactionTagValidationMessages.invalid
                }
                label="新增标签"
                onChange={(event) => {
                  setNewTagName(event.target.value);
                  if (fieldErrors.tags) {
                    setFieldErrors((prev) => ({ ...prev, tags: undefined }));
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key !== "Enter") return;

                  cancelDefaultEvent(event);
                  addTag(newTagName);
                }}
                size="small"
                value={newTagName}
              />
              <Button
                onClick={() => addTag(newTagName)}
                type="button"
                variant="outlined"
                sx={{
                  borderColor: designTokens.color.brand.main,
                  color: designTokens.color.brand.main,
                  flexShrink: 0,
                  height: 40,
                }}
              >
                追加
              </Button>
            </Stack>
          </Stack>
        </Paper>

        <TextField
          defaultValue={initialValues?.note ?? ""}
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
            <SummaryRow
              label="标签"
              value={
                selectedTagNames.length > 0
                  ? selectedTagNames.join("、")
                  : "未选择"
              }
            />
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
          {submitLabel}
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
          {itemSummaries.length > 0 ? (
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
          ) : null}

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
                    onChange={(event) => {
                      setPickerAmount(event.target.value);
                      if (pickerErrors.amount) {
                        setPickerErrors((prev) => ({
                          ...prev,
                          amount: undefined,
                        }));
                      }
                    }}
                    placeholder="0"
                    size="small"
                    slotProps={{
                      htmlInput: {
                        "data-amount-currency": selectedAccount?.currency ?? "",
                        "data-amount-input": "true",
                        inputMode: "decimal",
                      },
                    }}
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

function createInitialItemsByType(
  initialValues?: TransactionFormInitialValues,
) {
  const itemsByType = { ...emptyItemsByType };

  if (!initialValues) return itemsByType;

  itemsByType[initialValues.type] = initialValues.items.map((item, index) => ({
    ...item,
    id: index + 1,
  }));

  return itemsByType;
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

function cancelDefaultEvent(event: { preventDefault(): void }) {
  event.preventDefault();
}

function formatCategoryName(category: TransactionCategoryOption) {
  return category.parentName
    ? `${category.parentName} / ${category.name}`
    : category.name;
}

function formatDateTimeLocalInputValue(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  const year = date.getFullYear();
  const month = padDatePart(date.getMonth() + 1);
  const day = padDatePart(date.getDate());
  const hours = padDatePart(date.getHours());
  const minutes = padDatePart(date.getMinutes());
  const seconds = padDatePart(date.getSeconds());

  // datetime-local 值不含毫秒。
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

function formatSignedAmount(type: TransactionType, amount: number) {
  const normalizedAmount = parseFloat(amount.toFixed(2));

  if (normalizedAmount === 0) return "0";

  return `${type === "expense" ? "-" : "+"}${normalizedAmount}`;
}

function getNextTagError(tagNames: string[], tagName: string) {
  if (tagName.length > maxTransactionTagNameLength) {
    return transactionTagValidationMessages.nameTooLong;
  }

  if (hasTagName(tagNames, tagName)) {
    return transactionTagValidationMessages.duplicate;
  }

  // 新标签尚未追加，因此当前列表已满时拒绝第 11 个标签。
  if (tagNames.length >= maxTransactionTagCount) {
    return transactionTagValidationMessages.tooMany;
  }

  return null;
}

function getSelectedTagError(tagNames: string[]) {
  if (tagNames.length > maxTransactionTagCount) {
    return transactionTagValidationMessages.tooMany;
  }

  if (
    tagNames.some((tagName) => tagName.length > maxTransactionTagNameLength)
  ) {
    return transactionTagValidationMessages.nameTooLong;
  }

  return null;
}

function hasTagName(tagNames: string[], tagName: string) {
  return tagNames.some(
    (currentTagName) => currentTagName.toLowerCase() === tagName.toLowerCase(),
  );
}

function isValidMoneyText(value: string) {
  if (!/^\d+(\.\d{1,2})?$/.test(value.trim())) return false;

  const amount = Number(value);

  return Number.isFinite(amount) && amount >= 0;
}

function padDatePart(value: number) {
  return String(value).padStart(2, "0");
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
