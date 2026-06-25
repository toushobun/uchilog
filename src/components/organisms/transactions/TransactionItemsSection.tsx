import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { MouseEvent, RefObject } from "react";

import { SectionCard } from "molecules/ui/SectionCard";
import type { TransactionType } from "types/transactions";

import type {
  TransactionFormItem,
  TransactionItemSummary,
} from "./TransactionForm.types";
import { smallIconButtonSx } from "./TransactionForm.styles";
import { formatCategoryName } from "./TransactionForm.utils";

type TransactionItemsSectionProps = {
  fieldError?: string;
  hasCategoryOptions: boolean;
  itemsFieldRef: RefObject<HTMLDivElement | null>;
  itemSummaries: TransactionItemSummary[];
  onOpenSheet: () => void;
  onRemoveItem: (itemId: number) => void;
  onUpdateItem: (
    itemId: number,
    values: Partial<Omit<TransactionFormItem, "id">>,
  ) => void;
  selectedAccountCurrency?: string;
  selectedType: TransactionType;
  signedTotalAmount: string;
};

export function TransactionItemsSection({
  fieldError,
  hasCategoryOptions,
  itemsFieldRef,
  itemSummaries,
  onOpenSheet,
  onRemoveItem,
  onUpdateItem,
  selectedAccountCurrency,
  selectedType,
  signedTotalAmount,
}: TransactionItemsSectionProps) {
  return (
    <SectionCard ref={itemsFieldRef} sx={sectionCardSx}>
      <Stack spacing={1.5}>
        <Typography variant="subtitle1" sx={titleSx}>
          📋 {selectedType === "income" ? "收入明细" : "消费明细"}
        </Typography>

        {itemSummaries.length === 0 ? (
          <Typography
            color={fieldError ? "error" : "text.secondary"}
            variant="body2"
            sx={{ py: 0.5 }}
          >
            {fieldError ?? "请点击下方按钮添加明细。"}
          </Typography>
        ) : (
          itemSummaries.map((item, index) => {
            const categoryLabel = item.category
              ? formatCategoryName(item.category)
              : "请选择分类";

            return (
              <Paper key={item.id} elevation={0} sx={getItemPaperSx(index)}>
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: "center", minHeight: 70 }}
                >
                  <input
                    name="itemCategoryId"
                    type="hidden"
                    value={item.categoryId}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {item.category ? (
                      <Stack
                        direction="row"
                        sx={{
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: 0.75,
                        }}
                      >
                        <Chip
                          label={item.category.parentName ?? item.category.name}
                          size="small"
                          sx={getCategoryChipSx(index, true)}
                        />
                        {item.category.parentName ? (
                          <>
                            <Typography color="text.secondary" variant="body2">
                              &gt;
                            </Typography>
                            <Chip
                              label={item.category.name}
                              size="small"
                              sx={getCategoryChipSx(index, false)}
                            />
                          </>
                        ) : null}
                      </Stack>
                    ) : (
                      <Typography noWrap sx={{ fontWeight: 700 }}>
                        {categoryLabel}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={amountInputBoxSx}>
                    <input
                      aria-label={`明细 ${index + 1} 金额`}
                      data-amount-currency={selectedAccountCurrency ?? ""}
                      data-amount-input="true"
                      inputMode="decimal"
                      name="itemAmount"
                      onChange={(event) =>
                        onUpdateItem(item.id, { amount: event.target.value })
                      }
                      style={hiddenAmountInputStyle}
                      type="text"
                      value={item.amount}
                    />
                    <Button
                      aria-label={`编辑明细 ${index + 1} 金额`}
                      onClick={focusAmountInput}
                      type="button"
                      variant="text"
                      sx={amountButtonSx}
                    >
                      {formatDisplayAmount(
                        item.category?.type ?? selectedType,
                        item.amount,
                        selectedAccountCurrency,
                      )}
                    </Button>
                  </Box>
                  <IconButton
                    aria-label={`删除明细 ${index + 1}`}
                    onClick={() => onRemoveItem(item.id)}
                    size="small"
                    sx={smallIconButtonSx}
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
          disabled={!hasCategoryOptions}
          onClick={onOpenSheet}
          type="button"
          variant="text"
          sx={addItemButtonSx}
        >
          + 添加明细
        </Button>

        {itemSummaries.length > 0 ? (
          <Box sx={summaryBoxSx}>
            <Typography sx={{ fontWeight: 700 }}>
              共 {itemSummaries.length} 项
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
    </SectionCard>
  );
}

function focusAmountInput(event: MouseEvent<HTMLButtonElement>) {
  const input =
    event.currentTarget.parentElement?.querySelector<HTMLInputElement>(
      'input[data-amount-input="true"]',
    );

  input?.focus();
}

function formatDisplayAmount(
  type: TransactionType,
  amount: string,
  currency?: string,
) {
  const sign = type === "expense" ? "-" : "+";
  const symbol = getCurrencySymbol(currency);
  const displayAmount = amount.trim() || "0";

  return symbol
    ? `${sign} ${symbol} ${displayAmount}`
    : `${sign} ${displayAmount}`;
}

function getCurrencySymbol(currency?: string) {
  const normalizedCurrency = currency?.trim().toUpperCase();

  if (!normalizedCurrency) return "";

  return currencySymbols[normalizedCurrency] ?? normalizedCurrency;
}

const currencySymbols: Record<string, string> = {
  CNY: "¥",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  KRW: "₩",
  USD: "$",
};

const itemAccentStyles = [
  {
    accent: "var(--user-theme-action-text)",
    background: "var(--user-theme-badge-bg)",
  },
  {
    accent: "var(--user-theme-negative-amount)",
    background: "var(--user-theme-negative-bg)",
  },
  {
    accent: "var(--user-theme-tx-accent)",
    background: "var(--user-theme-transfer-bg)",
  },
] as const;

function getItemPaperSx(index: number) {
  const accent = itemAccentStyles[index % itemAccentStyles.length].accent;

  return {
    bgcolor: "var(--user-theme-card-bg)",
    border: "1px solid var(--user-theme-card-border)",
    borderLeft: "4px solid",
    borderLeftColor: accent,
    borderRadius: 2,
    boxShadow: "none",
    px: 1.5,
    py: 1.25,
  };
}

function getCategoryChipSx(index: number, isParent: boolean) {
  const style = itemAccentStyles[index % itemAccentStyles.length];

  return {
    bgcolor: isParent ? style.background : "var(--user-theme-badge-bg)",
    borderRadius: 1,
    color: isParent ? style.accent : "text.secondary",
    fontWeight: 800,
    height: 28,
  };
}

const sectionCardSx = {
  borderRadius: 2,
  p: 2,
};

const titleSx = {
  color: "text.secondary",
  fontWeight: 800,
};

const amountInputBoxSx = {
  position: "relative",
};

const hiddenAmountInputStyle = {
  height: 1,
  opacity: 0,
  pointerEvents: "none" as const,
  position: "absolute" as const,
  right: 0,
  top: "50%",
  width: 1,
};

const amountButtonSx = {
  color: "text.primary",
  fontSize: "1.4rem",
  fontWeight: 900,
  minWidth: 92,
  px: 0,
  textAlign: "right",
};

const addItemButtonSx = {
  border: "2px dashed",
  borderColor: "var(--user-theme-field-card-selected-border)",
  borderRadius: 2,
  color: "var(--user-theme-action-text)",
  fontSize: "0.9rem",
  fontWeight: 900,
  minHeight: 40,
};

const summaryBoxSx = {
  bgcolor: "var(--user-theme-tx-summary-bg)",
  borderRadius: 2,
  display: "flex",
  justifyContent: "space-between",
  px: 2,
  py: 1.25,
};
