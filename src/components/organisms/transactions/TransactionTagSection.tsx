import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import FormHelperText from "@mui/material/FormHelperText";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState, type KeyboardEvent, type RefObject } from "react";

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
  newTagName,
  onAddTag,
  onNewTagNameChange,
  onRemoveTag,
  selectedTagNames,
  suggestedTagOptions,
  tagsFieldRef,
}: TransactionTagSectionProps) {
  const [isInputOpen, setIsInputOpen] = useState(false);

  function handleNewTagKeyDown(event: KeyboardEvent) {
    if (event.key !== "Enter") return;

    event.preventDefault();
    onAddTag(newTagName);
  }

  function handleAddButtonClick() {
    setIsInputOpen(true);
  }

  function handleCancel() {
    setIsInputOpen(false);
    onNewTagNameChange("");
  }

  return (
    <Box ref={tagsFieldRef} sx={tagCardSx}>
      <Stack spacing={1}>
        <Typography variant="subtitle1" sx={titleSx}>
          整体标签
        </Typography>

        <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
          {selectedTagNames.map((tagName, index) => (
            <Chip
              key={tagName}
              label={tagName}
              onDelete={() => onRemoveTag(tagName)}
              size="small"
              sx={getSelectedTagSx(index)}
            />
          ))}

          {suggestedTagOptions.slice(0, 3).map((tag, index) => (
            <Chip
              key={tag.id}
              label={tag.name}
              onClick={() => onAddTag(tag.name)}
              size="small"
              variant="outlined"
              sx={getSuggestedTagSx(index, tag.color)}
            />
          ))}

          {isInputOpen ? (
            <>
              <TextField
                autoFocus
                onChange={(event) => onNewTagNameChange(event.target.value)}
                onKeyDown={handleNewTagKeyDown}
                placeholder="标签名"
                size="small"
                slotProps={{ htmlInput: { "aria-label": "新增标签" } }}
                value={newTagName}
                sx={tagInlineInputSx}
              />
              <IconButton
                aria-label="追加"
                onClick={() => onAddTag(newTagName)}
                size="small"
                sx={tagConfirmButtonSx}
              >
                <CheckRoundedIcon fontSize="small" />
              </IconButton>
              <IconButton
                aria-label="取消添加标签"
                onClick={handleCancel}
                size="small"
                sx={tagCancelButtonSx}
              >
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            </>
          ) : (
            <Button
              aria-label="追加"
              onClick={handleAddButtonClick}
              type="button"
              variant="outlined"
              sx={tagAddButtonSx}
            >
              +
            </Button>
          )}
        </Stack>

        {fieldError ? (
          <FormHelperText error sx={{ mt: 0 }}>
            {fieldError}
          </FormHelperText>
        ) : null}
      </Stack>
    </Box>
  );
}

const selectedTagStyles = [
  {
    bg: "var(--user-theme-badge-bg)",
    border: "var(--user-theme-field-card-selected-border)",
    color: "var(--user-theme-action-text)",
  },
  {
    bg: "var(--user-theme-negative-bg)",
    border: "var(--user-theme-negative-amount)",
    color: "var(--user-theme-negative-amount)",
  },
  {
    bg: "var(--user-theme-transfer-bg)",
    border: "var(--user-theme-tx-accent)",
    color: "var(--user-theme-tx-accent)",
  },
] as const;

function getSelectedTagSx(index: number) {
  const color = selectedTagStyles[index % selectedTagStyles.length];

  return {
    bgcolor: color.bg,
    border: "2px solid",
    borderColor: color.border,
    borderRadius: 999,
    color: color.color,
    fontWeight: 900,
    height: 34,
    px: 0.5,
    "& .MuiChip-deleteIcon": {
      color: color.color,
    },
  };
}

function getSuggestedTagSx(index: number, tagColor: string | null) {
  const fallbackColor = selectedTagStyles[index % selectedTagStyles.length];

  return {
    borderColor: tagColor ?? fallbackColor.border,
    borderRadius: 999,
    color: tagColor ?? fallbackColor.color,
    fontSize: "0.95rem",
    fontWeight: 900,
    height: 36,
    px: 0.75,
  };
}

const tagCardSx = {
  px: 0.25,
};

const titleSx = {
  color: "text.primary",
  fontSize: "0.8125rem",
  fontWeight: 800,
};

const tagInlineInputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 999,
    height: 34,
  },
  "& .MuiOutlinedInput-input": {
    px: 1.5,
    py: 0,
    width: 72,
  },
};

const tagConfirmButtonSx = {
  color: "success.main",
  p: 0.25,
};

const tagCancelButtonSx = {
  color: "text.secondary",
  p: 0.25,
};

const tagAddButtonSx = {
  bgcolor: "var(--user-theme-badge-bg)",
  borderColor: "transparent",
  borderRadius: 1.5,
  color: "var(--user-theme-badge-color)",
  flexShrink: 0,
  fontSize: "0.95rem",
  fontWeight: 900,
  height: 36,
  minWidth: 36,
  px: 1,
};
