"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";

import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import {
  maxTransactionTagCount,
  maxTransactionTagNameLength,
} from "@/constants/transactions";
import { routePaths } from "config/paths";
import { TransactionFormHeader } from "organisms/transactions/TransactionFormHeader";
import { TransactionDateTimePicker } from "molecules/transactions/TransactionDateTimePicker";
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
  initialType?: TransactionType;
  initialValues?: TransactionFormInitialValues;
  ledgerName?: string;
  merchantOptions: TransactionMerchantOption[];
  submitLabel?: string;
  tagOptions: TransactionTagOption[];
  title?: string;
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
  initialType,
  initialValues,
  ledgerName,
  merchantOptions,
  submitLabel = "保存记账",
  tagOptions,
  title = "新增记账",
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
  >(() => createInitialItemsByType(initialValues));
  const [isSheetOpen, setIsSheetOpen] = useState(false);
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

  const items = itemsByType[selectedType];

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
    }
  }, [initialType, initialValues]);

  const filteredCategoryOptions = useMemo(
    () => categoryOptions.filter((category) => category.type === selectedType),
    [categoryOptions, selectedType],
  );
  const categoryGroups = useMemo(
    () => buildCategoryPickerGroups(filteredCategoryOptions),
    [filteredCategoryOptions],
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
  const itemSummaries: TransactionItemSummary[] = items.map((item) => ({
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
  const transactionAtValue = composeTransactionDateTimeLocalValue(
    transactionDate,
    transactionTime,
  );
  const isSubmitDisabled =
    accountOptions.length === 0 ||
    merchantOptions.length === 0 ||
    filteredCategoryOptions.length === 0 ||
    !transactionAtValue ||
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
    setPickerAmount("");
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
    setPickerAmount("");
    setPickerErrors({});
    setSelectedCategoryGroupId("");
    setFieldErrors((prev) => ({ ...prev, items: undefined }));
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
    addItem(pickerCategoryId, pickerAmount);
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
      <Stack spacing={2.5}>
        <TransactionFormHeader
          closeHref={closeHref}
          isSubmitDisabled={isSubmitDisabled}
          ledgerName={ledgerName}
          title={title}
        />

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

        <ToggleButtonGroup
          aria-label="类型"
          exclusive
          fullWidth
          onChange={(_, value: TransactionType | null) =>
            handleTypeChange(value)
          }
          value={selectedType}
          sx={selectedToggleButtonGroupSx}
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

        <TransactionItemsSection
          fieldError={fieldErrors.items}
          hasCategoryOptions={filteredCategoryOptions.length > 0}
          itemsFieldRef={itemsFieldRef}
          itemSummaries={itemSummaries}
          onOpenSheet={openSheet}
          onRemoveItem={removeItem}
          onUpdateItem={updateItem}
          selectedAccountCurrency={selectedAccount?.currency}
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

        <TextField
          defaultValue={initialValues?.note ?? ""}
          fullWidth
          label="备注"
          minRows={3}
          multiline
          name="note"
          placeholder="可选"
        />

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

      <TransactionItemPickerDrawer
        categoryGroups={categoryGroups}
        filteredCategoryOptions={filteredCategoryOptions}
        itemSummaries={itemSummaries}
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
        selectedType={selectedType}
      />
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

function cancelDefaultEvent(event: { preventDefault(): void }) {
  event.preventDefault();
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

const selectedToggleButtonGroupSx = {
  "& .MuiToggleButton-root.Mui-selected": {
    backgroundColor: "var(--user-theme-bottom-nav-active-bg)",
    color: "var(--user-theme-action-text)",
  },
  "& .MuiToggleButton-root.Mui-selected:hover": {
    backgroundColor: "var(--user-theme-bottom-nav-active-bg)",
  },
};
