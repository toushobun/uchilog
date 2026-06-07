"use client";

import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import FormHelperText from "@mui/material/FormHelperText";
import Typography from "@mui/material/Typography";

import type { AccountHolderOption } from "types/accounts";
import { getAccountHolderLabel } from "utils/accounts";

type AccountHolderCheckboxGroupProps = {
  holderOptions: AccountHolderOption[];
  preservedHolderOptions?: AccountHolderOption[];
  selectedUserIds?: string[];
};

export function AccountHolderCheckboxGroup({
  holderOptions,
  preservedHolderOptions = [],
  selectedUserIds = [],
}: AccountHolderCheckboxGroupProps) {
  const selectedUserIdSet = new Set(selectedUserIds);
  const hasOptions = holderOptions.length > 0;
  const hasPreservedOptions = preservedHolderOptions.length > 0;

  return (
    <FormControl component="fieldset" fullWidth>
      <Typography component="legend" variant="subtitle2">
        持有人
      </Typography>
      <FormGroup sx={{ mt: 1 }}>
        {holderOptions.map((option) => (
          <FormControlLabel
            key={option.user_id}
            control={
              <Checkbox
                defaultChecked={selectedUserIdSet.has(option.user_id)}
                name="holderUserIds"
                value={option.user_id}
              />
            }
            label={getAccountHolderLabel(option)}
          />
        ))}
        {preservedHolderOptions.map((option) => (
          <FormControlLabel
            key={option.user_id}
            control={<Checkbox checked disabled />}
            label={`${getAccountHolderLabel(option)}（非活跃，保存时保留）`}
          />
        ))}
      </FormGroup>
      <FormHelperText sx={{ mx: 0 }}>
        {hasOptions || hasPreservedOptions
          ? hasPreservedOptions
            ? "可选择一个或多个持有人；非活跃持有人不能编辑，但会在保存时保留。"
            : "可选择一个或多个持有人；未选择时账户会显示为未设置持有人。"
          : "当前账本没有可选持有人。"}
      </FormHelperText>
    </FormControl>
  );
}
