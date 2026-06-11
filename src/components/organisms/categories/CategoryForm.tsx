"use client";

import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState } from "react";

import {
  type CategoryAction,
  type CategoryParentOption,
  categoryTypeOptions,
} from "types/categories";
import type { TransactionType } from "types/transactions";
import { GlassCard } from "atoms/ui/GlassCard";

type CategoryFormProps = {
  createCategoryAction: CategoryAction;
  parentOptions: CategoryParentOption[];
};

function isTransactionType(value: string): value is TransactionType {
  return value === "expense" || value === "income";
}

export function CategoryForm({
  createCategoryAction,
  parentOptions,
}: CategoryFormProps) {
  const [selectedType, setSelectedType] = useState<TransactionType>("expense");
  const filteredParentOptions = parentOptions.filter(
    (option) => option.type === selectedType,
  );

  return (
    <GlassCard sx={{ mt: 4, p: 3 }}>
      <Typography component="h2" variant="h6" sx={{ fontWeight: 700 }}>
        新增分类
      </Typography>

      <Stack
        component="form"
        action={createCategoryAction}
        spacing={2.5}
        sx={{ mt: 3 }}
      >
        <TextField
          autoComplete="off"
          fullWidth
          label="分类名称"
          name="name"
          placeholder="例如：餐饮、工资、交通"
          required
          slotProps={{ htmlInput: { maxLength: 100 } }}
        />

        <TextField
          fullWidth
          label="分类类型"
          name="type"
          onChange={(event) => {
            const value = event.target.value;

            if (isTransactionType(value)) {
              setSelectedType(value);
            }
          }}
          required
          select
          value={selectedType}
        >
          {categoryTypeOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          defaultValue=""
          fullWidth
          helperText="留空时创建大分类；选择大分类时创建可用于记账的小分类。"
          key={selectedType}
          label="上级分类"
          name="parentId"
          select
        >
          <MenuItem value="">无上级分类</MenuItem>
          {filteredParentOptions.map((option) => (
            <MenuItem key={option.id} value={option.id}>
              {option.name}
            </MenuItem>
          ))}
        </TextField>

        <Button type="submit" variant="contained">
          新增分类
        </Button>
      </Stack>
    </GlassCard>
  );
}
