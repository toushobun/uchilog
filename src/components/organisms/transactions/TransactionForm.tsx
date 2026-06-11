"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import Link from "next/link";

import { routePaths } from "config/paths";
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
  const [selectedType, setSelectedType] = useState<TransactionType>("expense");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedMerchantId, setSelectedMerchantId] = useState("");
  const [amount, setAmount] = useState("");

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

  const selectedAccount = accountOptions.find(
    (account) => account.id === selectedAccountId,
  );
  const selectedCategory = categoryOptions.find(
    (category) => category.id === selectedCategoryId,
  );
  const selectedMerchant = merchantOptions.find(
    (merchant) => merchant.id === selectedMerchantId,
  );

  const isSubmitDisabled =
    accountOptions.length === 0 || filteredCategoryOptions.length === 0;

  return (
    <form id="new-transaction-form" action={action}>
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
          color="primary"
          exclusive
          fullWidth
          onChange={(_, value: TransactionType | null) => {
            if (value) {
              setSelectedType(value);
              setSelectedCategoryId("");
            }
          }}
          value={selectedType}
        >
          {transactionTypeOptions.map((option) => (
            <ToggleButton key={option.value} value={option.value}>
              {option.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <TextField
          defaultValue=""
          fullWidth
          label="商家"
          name="merchantId"
          onChange={(event) => setSelectedMerchantId(event.target.value)}
          select
        >
          <MenuItem value="">
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <Avatar sx={{ height: 24, width: 24 }}>无</Avatar>
              <span>不选择</span>
            </Stack>
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
          disabled={accountOptions.length === 0}
          fullWidth
          helperText={
            accountOptions.length === 0
              ? "请先新增账户。"
              : "选择这笔记录使用的账户。"
          }
          label="账户"
          name="accountId"
          onChange={(event) => setSelectedAccountId(event.target.value)}
          required
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

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              消费明细
            </Typography>
            <TextField
              disabled={filteredCategoryOptions.length === 0}
              fullWidth
              helperText={
                filteredCategoryOptions.length === 0
                  ? `请先新增${selectedType === "expense" ? "支出" : "收入"}小分类。`
                  : `只显示${selectedType === "expense" ? "支出" : "收入"}小分类。`
              }
              label="分类"
              name="categoryId"
              onChange={(event) => setSelectedCategoryId(event.target.value)}
              required
              select
              value={selectedCategoryId}
            >
              <MenuItem disabled value="">
                请选择分类
              </MenuItem>
              {filteredCategoryOptions.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="金额"
              name="amount"
              onChange={(event) => setAmount(event.target.value)}
              placeholder="例如：1200"
              required
              slotProps={{ htmlInput: { inputMode: "decimal" } }}
              type="text"
              value={amount}
            />
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
            <SummaryRow
              label="当前明细"
              value={`${selectedCategory?.name ?? "未选择分类"} / ${amount || "未填写金额"}`}
            />
            <Divider />
            <SummaryRow
              label="合计金额"
              value={amount || "未填写金额"}
              strong
            />
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
        >
          保存记账
        </Button>
      </Stack>
    </form>
  );
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
