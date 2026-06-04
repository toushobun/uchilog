"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import {
  transactionTypeOptions,
  type TransactionAccountOption,
  type TransactionCategoryOption,
  type TransactionMerchantOption,
  type TransactionType,
} from "transactions-route/types";

type TransactionFormProps = {
  accountOptions: TransactionAccountOption[];
  categoryOptions: TransactionCategoryOption[];
  merchantOptions: TransactionMerchantOption[];
};

function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

function getNowDateTimeLocalValue() {
  const current = new Date();

  return [
    current.getFullYear(),
    "-",
    padDatePart(current.getMonth() + 1),
    "-",
    padDatePart(current.getDate()),
    "T",
    padDatePart(current.getHours()),
    ":",
    padDatePart(current.getMinutes()),
    ":",
    padDatePart(current.getSeconds()),
  ].join("");
}

function getMerchantInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "商";
}

export function TransactionForm({
  accountOptions,
  categoryOptions,
  merchantOptions,
}: TransactionFormProps) {
  const transactionAtInputRef = useRef<HTMLInputElement>(null);
  const timeZoneOffsetInputRef = useRef<HTMLInputElement>(null);
  const [selectedType, setSelectedType] = useState<TransactionType>("expense");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

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

  return (
    <>
      <Typography component="h2" variant="h6" sx={{ mt: 4, fontWeight: 700 }}>
        新增记账
      </Typography>

      <Stack component="form" spacing={2.5} sx={{ mt: 3 }}>
        <input
          ref={timeZoneOffsetInputRef}
          name="timeZoneOffsetMinutes"
          type="hidden"
        />

        <TextField
          fullWidth
          label="类型"
          name="type"
          onChange={(event) => {
            setSelectedType(event.target.value as TransactionType);
            setSelectedCategoryId("");
          }}
          required
          select
          value={selectedType}
        >
          {transactionTypeOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

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

        <TextField
          fullWidth
          label="金额"
          name="amount"
          placeholder="例如：1200"
          required
          slotProps={{ htmlInput: { inputMode: "decimal" } }}
          type="text"
        />

        <TextField
          defaultValue=""
          disabled={accountOptions.length === 0}
          fullWidth
          helperText={
            accountOptions.length === 0
              ? "请先新增账户。"
              : "选择这笔记录使用的账户。"
          }
          label="账户"
          name="accountId"
          required
          select
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
          defaultValue=""
          fullWidth
          label="商家"
          name="merchantId"
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
          fullWidth
          label="备注"
          minRows={3}
          multiline
          name="note"
          placeholder="可选"
        />

        <Button disabled type="button" variant="contained">
          保存功能下一步接入
        </Button>
      </Stack>
    </>
  );
}
