import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { MouseEvent, RefObject } from "react";

import type { TransactionType } from "types/transactions";

import type {
  TransactionFormItem,
  TransactionItemSummary,
} from "./TransactionForm.types";
import {
  formatCategoryName,
  formatSignedCurrencyAmount,
} from "./TransactionForm.utils";

type TransactionItemsSectionProps = {
  fieldError?: string;
  hasCategoryOptions: boolean;
  itemsFieldRef: RefObject<HTMLDivElement | null>;
  itemSummaries: TransactionItemSummary[];
  onOpenItem: (itemId: number) => void;
  onOpenSheet: () => void;
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
  onOpenItem,
  onOpenSheet,
  onUpdateItem,
  selectedAccountCurrency,
  selectedType,
  signedTotalAmount,
}: TransactionItemsSectionProps) {
  return (
    <Box ref={itemsFieldRef} sx={sectionCardSx}>
      <Stack spacing={1}>
        <Typography variant="subtitle1" sx={titleSx}>
          {selectedType === "income" ? "收入明细" : "消费明细"}
          {itemSummaries.length > 0 ? `（${itemSummaries.length}）` : ""}
        </Typography>

        <Box sx={itemsCardSx}>
          {itemSummaries.length === 0 ? (
            <Typography
              color={fieldError ? "error" : "text.secondary"}
              variant="body2"
              sx={{ px: 1.25, py: 1.5 }}
            >
              {fieldError ?? "请点击下方按钮添加明细。"}
            </Typography>
          ) : (
            itemSummaries.map((item, index) => {
              const categoryLabel = item.category
                ? formatCategoryName(item.category)
                : "请选择分类";

              return (
                <Box
                  key={item.id}
                  sx={getItemPaperSx(index, itemSummaries.length)}
                >
                  <Box sx={itemRowSx}>
                    <input
                      name="itemCategoryId"
                      type="hidden"
                      value={item.categoryId}
                    />
                    <ButtonBase
                      aria-label={`编辑明细 ${index + 1} 分类`}
                      onClick={() => onOpenItem(item.id)}
                      sx={itemCategoryButtonSx}
                    >
                      <Box sx={itemNumberSx}>{index + 1}</Box>
                      <Box sx={{ minWidth: 0 }}>
                        {item.category ? (
                          <>
                            <Typography sx={categoryPrimarySx}>
                              大分类　&gt;　
                              {item.category.parentName ?? item.category.name}
                            </Typography>
                            {item.category.parentName ? (
                              <Typography sx={categorySecondarySx}>
                                小分类　&gt;　{item.category.name}
                              </Typography>
                            ) : null}
                          </>
                        ) : (
                          <Typography noWrap sx={{ fontWeight: 700 }}>
                            {categoryLabel}
                          </Typography>
                        )}
                      </Box>
                    </ButtonBase>
                    <Box sx={amountColumnSx}>
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
                      {/* TODO: 未来实现报销/退款功能。 */}
                      <Box aria-hidden sx={futureStatusPlaceholderSx} />
                    </Box>
                  </Box>
                </Box>
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
        </Box>

        {itemSummaries.length > 0 ? (
          <Box sx={summaryBoxSx}>
            <Typography sx={{ fontWeight: 700 }}>本次合计</Typography>
            <Typography
              sx={{
                color: "var(--user-theme-action-text)",
                fontWeight: 800,
              }}
            >
              合计{" "}
              {formatSignedCurrencyAmount(
                signedTotalAmount,
                selectedAccountCurrency,
              )}
            </Typography>
          </Box>
        ) : null}
      </Stack>
    </Box>
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
  return formatSignedCurrencyAmount(`${sign}${amount.trim() || "0"}`, currency);
}

function getItemPaperSx(index: number, itemCount: number) {
  return {
    borderBottom:
      index === itemCount - 1 ? 0 : "1px dashed var(--user-theme-card-border)",
    mx: 1.25,
    py: 0.875,
  };
}

const sectionCardSx = {
  px: 0.25,
};

const itemsCardSx = {
  bgcolor: "var(--user-theme-card-bg)",
  border: "1px solid var(--user-theme-card-border)",
  borderRadius: 1.25,
  overflow: "hidden",
};

const titleSx = {
  color: "text.primary",
  fontSize: "0.8125rem",
  fontWeight: 800,
};

const itemNumberSx = {
  alignItems: "center",
  bgcolor: "var(--user-theme-badge-color)",
  borderRadius: "50%",
  color: "var(--user-theme-card-bg)",
  display: "flex",
  flexShrink: 0,
  fontSize: "0.6875rem",
  fontWeight: 900,
  height: 18,
  justifyContent: "center",
  width: 18,
};

const itemRowSx = {
  alignItems: "start",
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
};

const itemCategoryButtonSx = {
  alignItems: "start",
  display: "grid",
  gap: 1,
  gridTemplateColumns: "18px minmax(0, 1fr)",
  justifyContent: "stretch",
  minWidth: 0,
  textAlign: "left",
};

const categoryPrimarySx = {
  color: "text.primary",
  fontSize: "0.75rem",
  fontWeight: 700,
  lineHeight: 1.35,
};

const categorySecondarySx = {
  color: "text.secondary",
  fontSize: "0.75rem",
  fontWeight: 500,
  lineHeight: 1.35,
  mt: 0.375,
};

const amountColumnSx = {
  alignItems: "flex-end",
  display: "flex",
  flexDirection: "column",
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
  fontSize: "0.75rem",
  fontWeight: 800,
  lineHeight: 1.35,
  minHeight: 18,
  minWidth: 64,
  px: 0,
  py: 0,
  textAlign: "right",
};

const futureStatusPlaceholderSx = {
  bottom: 0,
  height: 20,
  pointerEvents: "none",
  position: "absolute",
  right: 0,
  width: 52,
};

const addItemButtonSx = {
  border: "1px solid var(--user-theme-card-border)",
  borderRadius: 1.5,
  color: "var(--user-theme-action-text)",
  fontSize: "0.9rem",
  fontWeight: 800,
  mb: 0.75,
  minHeight: 38,
  mx: 1.25,
  mt: 0.25,
  width: "calc(100% - 20px)",
};

const summaryBoxSx = {
  display: "flex",
  justifyContent: "space-between",
  px: 0.25,
  py: 0.375,
};
