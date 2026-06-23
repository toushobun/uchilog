import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { KeyboardEvent, RefObject } from "react";

import { designTokens } from "theme/theme";
import type { TransactionTagOption } from "types/transactions";

type TransactionTagSectionProps = {
  fieldError?: string;
  helperText: string;
  newTagName: string;
  onAddTag: (tagName: string) => void;
  onNewTagNameChange: (tagName: string) => void;
  onRemoveTag: (tagName: string) => void;
  selectedTagNames: string[];
  suggestedTagOptions: TransactionTagOption[];
  tagsFieldRef: RefObject<HTMLDivElement | null>;
};

export function TransactionTagSection({
  fieldError,
  helperText,
  newTagName,
  onAddTag,
  onNewTagNameChange,
  onRemoveTag,
  selectedTagNames,
  suggestedTagOptions,
  tagsFieldRef,
}: TransactionTagSectionProps) {
  function handleNewTagKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;

    event.preventDefault();
    onAddTag(newTagName);
  }

  return (
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
                onDelete={() => onRemoveTag(tagName)}
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
                  onClick={() => onAddTag(tag.name)}
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

        <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
          <TextField
            error={!!fieldError}
            fullWidth
            helperText={helperText}
            label="新增标签"
            onChange={(event) => onNewTagNameChange(event.target.value)}
            onKeyDown={handleNewTagKeyDown}
            size="small"
            value={newTagName}
          />
          <Button
            onClick={() => onAddTag(newTagName)}
            type="button"
            variant="outlined"
            sx={tagAddButtonSx}
          >
            追加
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

const tagAddButtonSx = {
  borderColor: designTokens.color.brand.main,
  color: designTokens.color.brand.main,
  flexShrink: 0,
  height: 40,
};
