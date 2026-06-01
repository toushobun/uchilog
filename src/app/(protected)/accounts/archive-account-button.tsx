"use client";

import Button from "@mui/material/Button";

export function ArchiveAccountButton() {
  return (
    <Button
      color="error"
      type="submit"
      variant="outlined"
      onClick={(event) => {
        const confirmed = window.confirm("确定归档该账户吗？");

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      归档
    </Button>
  );
}
