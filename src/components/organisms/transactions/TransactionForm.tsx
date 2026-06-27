"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {
  maxTransactionTagCount,
  maxTransactionTagNameLength,
} from "@/constants/transactions";
import { routePaths } from "config/paths";
import { TransactionFormHeader } from "organisms/transactions/TransactionFormHeader";
import { TransactionDateTimePicker } from "molecules/transactions/TransactionDateTimePicker";
import { IconBadge } from "atoms/ui/IconBadge";
import { outlinedInputTokenSx } from "molecules/ui/outlinedInputTokenSx";
import type {
  TransactionAccountOption,
  TransactionCategoryOption,
  TransactionMerchantOption,
  TransactionTagOption,
  TransactionType,
} from "types/transactions";
import { getMerchantInitial } from "utils/merchants";
import { transactionFormValidationMessages } from "utils/transactionMessages";
import { transactionTagValidationMessages } from "utils/transactionTagValidationMessages";
import {
  composeTransactionDateTimeLocalValue,
  formatDateTimeLocalInputValue,
  getNowDateTimeLocalValue,
  splitDateTimeLocalValue,
} from "utils/transactions";

import { TransactionItemPickerDrawer } from "./TransactionItemPickerDrawer";
import { TransactionItemsSection } from "./TransactionItemsSection";
import type {
  TransactionFieldErrors,
  TransactionFormInitialValues,
  TransactionFormItem,
  TransactionItemSummary,
  TransactionPickerErrors,
} from "./TransactionForm.types";
import {
  buildCategoryPickerGroups,
  isValidMoneyText,
} from "./TransactionForm.utils";
import {
  transactionFieldGroupSx,
  transactionFormStackSx,
  transactionNoteFieldSx,
  transactionSectionTitleSx,
  transactionSubmitButtonSx,
} from "./TransactionForm.styles";
import { TransactionSummarySection } from "./TransactionSummarySection";
import { TransactionTagSection } from "./TransactionTagSection";

export type { TransactionFormInitialValues } from "./TransactionForm.types";

type TransactionFormProps = {
  action: (formData: FormData) => Promise<void>;
  accountOptions: TransactionAccountOption[];
  categoryOptions: TransactionCategoryOption[];
  closeHref?: string;
  errorMessage?: string | null;
  formId?: string;
  hideHeader?: boolean;
  initialType?: TransactionType;
  initialValues?: TransactionFormInitialValues;
  ledgerName?: string;
  merchantOptions: TransactionMerchantOption[];
  onSubmitDisabledChange?: (disabled: boolean) => void;
  submitLabel?: string;
  tagOptions: TransactionTagOption[];
  title?: string;
  typeNavigation?: ReactNode;
};

export function TransactionForm({
  action,
  accountOptions,
  categoryOptions,
  closeHref = routePaths.transactions,
  errorMessage,
  formId = "new-transaction-form",
  hideHeader = false,
  initialType,
  initialValues,
  ledgerName,
  merchantOptions,
  onSubmitDisabledChange,
  submitLabel = "保存记账",
  tagOptions,
  title = "新增记账",
  typeNavigation,
}: TransactionFormProps) {
  const nextItemIdRef = useRef((initialValues?.items.length ?? 0) + 1);
  const merchantFieldRef = useRef<HTMLDivElement>(null);
  const accountFieldRef = useRef<HTMLDivElement>(null);
  const itemsFieldRef = useRef<HTMLDivElement>(null);
  const tagsFieldRef = useRef<HTMLDivElement>(null);
  const isFirstRenderRef = useRef(true);
  const [selectedType, setSelectedType] = useState<TransactionType>(
    initialValues?.type ?? initialType ?? "expense",
  );
  const [selectedAccountId, setSelectedAccountId] = useState(
    initialValues?.accountId ?? "",
  );
  const [selectedMerchantId, setSelectedMerchantId] = useState(
    initialValues?.merchantId ?? "",
  );
  const [fieldErrors, setFieldErrors] = useState<TransactionFieldErrors>({});
  const [itemsByType, setItemsByType] = useState<
    Record<TransactionType, TransactionFormItem[]>
  >(() =>
    createInitialItemsByType(
      initialValues,
      new Map(categoryOptions.map((c) => [c.id, c])),
    ),
  );
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [selectedCategoryGroupId, setSelectedCategoryGroupId] = useState("");
  const [pickerCategoryId, setPickerCategoryId] = useState("");
  const [pickerAmount, setPickerAmount] = useState("");
  const [pickerErrors, setPickerErrors] = useState<TransactionPickerErrors>({});
  const [selectedTagNames, setSelectedTagNames] = useState<string[]>(
    initialValues?.tagNames ?? [],
  );
  const [newTagName, setNewTagName] = useState("");
  const [transactionDate, setTransactionDate] = useState("");
  const [transactionTime, setTransactionTime] = useState("");
  const [timeZoneOffsetMinutes, setTimeZoneOffsetMinutes] = useState("");

  const allDisplayItems = [...itemsByType.expense, ...itemsByType.income];

  useEffect(() => {
    const localValue = initialValues?.transactionAt
      ? formatDateTimeLocalInputValue(initialValues.transactionAt)
      : getNowDateTimeLocalValue();
    const nextDateTime = splitDateTimeLocalValue(localValue);

    // eslint-disable-next-line react-hooks/set-state-in-effect -- 客户端挂载后同步本地时区时间，避免服务端水合差异。
    setTransactionDate(nextDateTime.date);
    setTransactionTime(nextDateTime.time);
    setTimeZoneOffsetMinutes(String(new Date().getTimezoneOffset()));
  }, [initialValues?.transactionAt]);

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    if (!initialValues && initialType) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 新增页外层 tab 切换时同步内部类型，编辑页有 initialValues 时忽略。
      setSelectedType(initialType);
      setIsSheetOpen(false);
      setEditingItemId(null);
      setPickerCategoryId("");
      setPickerAmount("");
      setPickerErrors({});
      setSelectedCategoryGroupId("");
      setFieldErrors((prev) => ({ ...prev, items: undefined }));
    }
  }, [initialType, initialValues]);

  const allNormalCategoryOptions = useMemo(
    () =>
      categoryOptions.filter(
        (c) => c.type === "expense" || c.type === "income",
      ),
    [categoryOptions],
  );
  const categoryGroups = useMemo(
    () => buildCategoryPickerGroups(allNormalCategoryOptions),
    [allNormalCategoryOptions],
  );
  const categoryById = useMemo(
    () => new Map(categoryOptions.map((category) => [category.id, category])),
    [categoryOptions],
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
  const suggestedTagOptions = tagOptions.filter(
    (tag) => !hasTagName(selectedTagNames, tag.name),
  );
  const itemSummaries: TransactionItemSummary[] = allDisplayItems.map(
    (item) => ({
      ...item,
      category: categoryById.get(item.categoryId),
    }),
  );
  const expenseTotal = itemsByType.expense.reduce((sum, item) => {
    if (!isValidMoneyText(item.amount)) return sum;
    return sum + Number(item.amount);
  }, 0);
  const incomeTotal = itemsByType.income.reduce((sum, item) => {
    if (!isValidMoneyText(item.amount)) return sum;
    return sum + Number(item.amount);
  }, 0);
  const hasValidItems =
    allDisplayItems.length > 0 &&
    allDisplayItems.every(
      (item) => item.categoryId.length > 0 && isValidMoneyText(item.amount),
    );
  const hasValidTags = !getSelectedTagError(selectedTagNames);
  const transactionAtValue = composeTransactionDateTimeLocalValue(
    transactionDate,
    transactionTime,
  );
  const isSubmitDisabled =
    accountOptions.length === 0 ||
    merchantOptions.length === 0 ||
    allNormalCategoryOptions.length === 0 ||
    !transactionAtValue ||
    !hasValidTags;

  useEffect(() => {
    onSubmitDisabledChange?.(isSubmitDisabled);
  }, [isSubmitDisabled, onSubmitDisabledChange]);

  const signedTotalAmount =
    allDisplayItems.length > 0
      ? formatNetAmount(incomeTotal - expenseTotal)
      : "未填写金额";

  function addItem(categoryId: string, amount: string) {
    const categoryType = categoryById.get(categoryId)?.type ?? selectedType;
    const itemId = nextItemIdRef.current;
    nextItemIdRef.current += 1;
    setItemsByType((current) => ({
      ...current,
      [categoryType]: [
        ...current[categoryType],
        { amount, categoryId, id: itemId },
      ],
    }));
    if (fieldErrors.items) {
      setFieldErrors((prev) => ({ ...prev, items: undefined }));
    }
  }

  function updateItem(
    itemId: number,
    values: Partial<Omit<TransactionFormItem, "id">>,
  ) {
    setItemsByType((current) => ({
      expense: current.expense.map((item) =>
        item.id === itemId ? { ...item, ...values } : item,
      ),
      income: current.income.map((item) =>
        item.id === itemId ? { ...item, ...values } : item,
      ),
    }));
  }

  function replaceItem(itemId: number, categoryId: string, amount: string) {
    const categoryType = categoryById.get(categoryId)?.type ?? selectedType;

    setItemsByType((current) => {
      const existingItem = [...current.expense, ...current.income].find(
        (item) => item.id === itemId,
      );
      if (!existingItem) return current;

      const nextItems: Record<TransactionType, TransactionFormItem[]> = {
        expense: current.expense.filter((item) => item.id !== itemId),
        income: current.income.filter((item) => item.id !== itemId),
      };
      nextItems[categoryType] = [
        ...nextItems[categoryType],
        { ...existingItem, amount, categoryId },
      ];

      return nextItems;
    });
  }

  function removeItem(itemId: number) {
    setItemsByType((current) => ({
      expense: current.expense.filter((item) => item.id !== itemId),
      income: current.income.filter((item) => item.id !== itemId),
    }));
    if (fieldErrors.items) {
      setFieldErrors((prev) => ({ ...prev, items: undefined }));
    }
    if (editingItemId === itemId) {
      setEditingItemId(null);
      setPickerCategoryId("");
      setPickerAmount("");
      setPickerErrors({});
    }
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
    setEditingItemId(null);
    setPickerCategoryId("");
    setPickerAmount("");
    setPickerErrors({});
    setSelectedCategoryGroupId(categoryGroups[0]?.id ?? "");
    setIsSheetOpen(true);
  }

  function openItemSheet(itemId: number) {
    const item = allDisplayItems.find(
      (currentItem) => currentItem.id === itemId,
    );
    if (!item) return;

    const categoryGroup = categoryGroups.find((group) =>
      group.categories.some((category) => category.id === item.categoryId),
    );

    setEditingItemId(itemId);
    setPickerCategoryId(item.categoryId);
    setPickerAmount(item.amount);
    setPickerErrors({});
    setSelectedCategoryGroupId(
      categoryGroup?.id ?? categoryGroups[0]?.id ?? "",
    );
    setIsSheetOpen(true);
  }

  function closeSheet() {
    setIsSheetOpen(false);
    setEditingItemId(null);
  }

  function handlePickerGroupSelect(groupId: string) {
    setSelectedCategoryGroupId(groupId);
    setPickerCategoryId("");
    setPickerAmount("");
    setPickerErrors({});
  }

  function handlePickerCategoryToggle(categoryId: string) {
    setPickerCategoryId((prev) => (prev === categoryId ? "" : categoryId));
    if (pickerErrors.category) {
      setPickerErrors((prev) => ({ ...prev, category: undefined }));
    }
  }

  function handlePickerAmountChange(amount: string) {
    setPickerAmount(amount);
    if (pickerErrors.amount) {
      setPickerErrors((prev) => ({ ...prev, amount: undefined }));
    }
  }

  function handlePickerAdd() {
    const errors: TransactionPickerErrors = {};
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
    if (editingItemId === null) {
      addItem(pickerCategoryId, pickerAmount);
    } else {
      replaceItem(editingItemId, pickerCategoryId, pickerAmount);
    }
    setEditingItemId(null);
    setPickerCategoryId("");
    setPickerAmount("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!transactionAtValue) {
      cancelDefaultEvent(event);
      return;
    }

    const errors: TransactionFieldErrors = {};
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
      <Stack spacing={0} sx={transactionFormStackSx}>
        {hideHeader ? null : (
          <TransactionFormHeader
            closeHref={closeHref}
            isSubmitDisabled={isSubmitDisabled}
            ledgerName={ledgerName}
            title={title}
          />
        )}

        {typeNavigation}

        {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

        <input
          name="timeZoneOffsetMinutes"
          readOnly
          type="hidden"
          value={timeZoneOffsetMinutes}
        />
        <input
          name="transactionAt"
          readOnly
          type="hidden"
          value={transactionAtValue}
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

        <Box ref={merchantFieldRef} sx={selectionFieldGroupSx}>
          <SectionTitle>商家</SectionTitle>
          <TextField
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
              if (fieldErrors.merchant) {
                setFieldErrors((prev) => ({ ...prev, merchant: undefined }));
              }
            }}
            select
            slotProps={{
              select: {
                displayEmpty: true,
                IconComponent: KeyboardArrowRightRoundedIcon,
                renderValue: () => (
                  <SelectionValue
                    icon={
                      <SelectionIcon tone="orange">
                        <StorefrontRoundedIcon fontSize="small" />
                      </SelectionIcon>
                    }
                    text={selectedMerchant?.name ?? "选择商家"}
                  />
                ),
              },
            }}
            value={selectedMerchantId}
            sx={selectionSelectSx}
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
        </Box>

        <Box ref={accountFieldRef} sx={selectionFieldGroupSx}>
          <SectionTitle>付款账户</SectionTitle>
          <TextField
            disabled={accountOptions.length === 0}
            error={!!fieldErrors.account}
            fullWidth
            helperText={
              fieldErrors.account ??
              (accountOptions.length === 0 ? "请先新增账户。" : undefined)
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
            slotProps={{
              select: {
                displayEmpty: true,
                IconComponent: KeyboardArrowRightRoundedIcon,
                renderValue: () => (
                  <SelectionValue
                    icon={
                      <SelectionIcon tone="blue">
                        <AccountBalanceWalletRoundedIcon fontSize="small" />
                      </SelectionIcon>
                    }
                    text={
                      selectedAccount
                        ? `${selectedAccount.name}（${selectedAccount.currency}）`
                        : "选择账户"
                    }
                  />
                ),
              },
            }}
            value={selectedAccountId}
            sx={selectionSelectSx}
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
        </Box>

        <TransactionItemsSection
          fieldError={fieldErrors.items}
          hasCategoryOptions={allNormalCategoryOptions.length > 0}
          itemsFieldRef={itemsFieldRef}
          itemSummaries={itemSummaries}
          onOpenItem={openItemSheet}
          onOpenSheet={openSheet}
          onUpdateItem={updateItem}
          selectedAccountCurrency={selectedAccount?.currency}
          selectedType={selectedType}
          signedTotalAmount={signedTotalAmount}
        />

        <TransactionTagSection
          fieldError={fieldErrors.tags}
          helperText={fieldErrors.tags ?? transactionTagValidationMessages.hint}
          newTagName={newTagName}
          onAddTag={addTag}
          onNewTagNameChange={(tagName) => {
            setNewTagName(tagName);
            if (fieldErrors.tags) {
              setFieldErrors((prev) => ({ ...prev, tags: undefined }));
            }
          }}
          onRemoveTag={removeTag}
          selectedTagNames={selectedTagNames}
          suggestedTagOptions={suggestedTagOptions}
          tagsFieldRef={tagsFieldRef}
        />

        <Box sx={transactionFieldGroupSx}>
          <SectionTitle>备注</SectionTitle>
          <TextField
            defaultValue={initialValues?.note ?? ""}
            fullWidth
            hiddenLabel
            multiline
            name="note"
            placeholder="记录这次生活的小片段…"
            rows={1}
            size="small"
            sx={transactionNoteFieldSx}
          />
        </Box>

        <TransactionDateTimePicker
          date={transactionDate}
          onDateChange={setTransactionDate}
          onTimeChange={setTransactionTime}
          time={transactionTime}
        />

        <TransactionSummarySection
          itemSummaries={itemSummaries}
          selectedAccount={selectedAccount}
          selectedMerchant={selectedMerchant}
          selectedTagNames={selectedTagNames}
          signedTotalAmount={signedTotalAmount}
          transactionDate={transactionDate}
          transactionTime={transactionTime}
        />

        <Button
          disabled={isSubmitDisabled}
          size="large"
          type="submit"
          variant="contained"
          sx={transactionSubmitButtonSx}
        >
          {submitLabel}
        </Button>
      </Stack>

      <TransactionItemPickerDrawer
        categoryGroups={categoryGroups}
        filteredCategoryOptions={allNormalCategoryOptions}
        itemSummaries={itemSummaries}
        editingItemId={editingItemId}
        onAmountChange={handlePickerAmountChange}
        onCategoryToggle={handlePickerCategoryToggle}
        onClose={closeSheet}
        onGroupSelect={handlePickerGroupSelect}
        onPickerAdd={handlePickerAdd}
        onRemoveItem={removeItem}
        open={isSheetOpen}
        pickerAmount={pickerAmount}
        pickerCategoryId={pickerCategoryId}
        pickerErrors={pickerErrors}
        selectedAccountCurrency={selectedAccount?.currency}
        selectedCategoryGroup={selectedCategoryGroup}
      />
    </form>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Typography variant="subtitle1" sx={sectionTitleSx}>
      {children}
    </Typography>
  );
}

function SelectionValue({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <Stack direction="row" spacing={1.25} sx={selectionValueSx}>
      {icon}
      <Typography noWrap sx={selectionPrimarySx}>
        {text}
      </Typography>
    </Stack>
  );
}

function SelectionIcon({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "blue" | "orange";
}) {
  return (
    <IconBadge
      size="sm"
      sx={tone === "orange" ? merchantSelectionIconSx : accountSelectionIconSx}
    >
      {children}
    </IconBadge>
  );
}

function createInitialItemsByType(
  initialValues?: TransactionFormInitialValues,
  categoryById?: Map<string, TransactionCategoryOption>,
): Record<TransactionType, TransactionFormItem[]> {
  const result: Record<TransactionType, TransactionFormItem[]> = {
    expense: [],
    income: [],
  };

  if (!initialValues) return result;

  initialValues.items.forEach((item, index) => {
    const categoryType =
      categoryById?.get(item.categoryId)?.type ?? initialValues.type;
    result[categoryType].push({ ...item, id: index + 1 });
  });

  return result;
}

function cancelDefaultEvent(event: { preventDefault(): void }) {
  event.preventDefault();
}

function formatNetAmount(net: number) {
  const n = parseFloat(net.toFixed(2));
  if (n === 0) return "0";
  return n > 0 ? `+${n}` : `${n}`;
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

const selectionFieldGroupSx = transactionFieldGroupSx;

const sectionTitleSx = transactionSectionTitleSx;

const selectionValueSx = {
  alignItems: "center",
  minWidth: 0,
};

const selectionPrimarySx = {
  color: "text.primary",
  fontSize: "1rem",
  fontWeight: 900,
  minWidth: 0,
};

const selectionSelectSx = {
  ...outlinedInputTokenSx,
  "& .MuiInputLabel-root": {
    clip: "rect(0 0 0 0)",
    height: 1,
    m: -1,
    overflow: "hidden",
    p: 0,
    position: "absolute",
    width: 1,
  },
  "& .MuiOutlinedInput-root": {
    ...outlinedInputTokenSx["& .MuiOutlinedInput-root"],
    borderRadius: 1.25,
    minHeight: 50,
    pr: 4.5,
  },
  "& .MuiSelect-icon": {
    color: "text.secondary",
    fontSize: "1.8rem",
    right: 10,
  },
  "& .MuiSelect-select": {
    alignItems: "center",
    display: "flex",
    minHeight: "50px !important",
    py: 0,
  },
  "& legend": {
    display: "none",
  },
};

const merchantSelectionIconSx = {
  bgcolor: "var(--user-theme-badge-bg)",
  color: "var(--user-theme-action-text)",
};

const accountSelectionIconSx = {
  bgcolor: "var(--user-theme-transfer-bg)",
  color: "var(--user-theme-tx-accent)",
};
