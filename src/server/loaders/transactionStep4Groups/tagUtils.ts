import { createClient } from "lib/supabase/server";
import type { TransactionItemDbRow } from "server/db-types";

import type { RawTagAssignment, TransactionGroupLoaderContext } from "./types";

export async function loadTagNameMap(tagIds: string[], ledgerId: string) {
  const uniqueTagIds = [...new Set(tagIds)];
  const tagById = new Map<string, string>();

  if (uniqueTagIds.length === 0) return tagById;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transaction_tag")
    .select("id, name")
    .eq("ledger_id", ledgerId)
    .in("id", uniqueTagIds);

  if (error) throw new Error("Failed to load transaction tag names");

  for (const tag of data ?? []) {
    tagById.set(tag.id as string, tag.name as string);
  }

  return tagById;
}

export function groupItemsByRecordId(items: TransactionItemDbRow[]) {
  const itemsByRecordId = new Map<string, TransactionItemDbRow[]>();

  for (const item of items) {
    const recordItems = itemsByRecordId.get(item.transaction_record_id) ?? [];
    recordItems.push(item);
    itemsByRecordId.set(item.transaction_record_id, recordItems);
  }

  return itemsByRecordId;
}

export function groupRawTagsByRecordId(tagAssignments: RawTagAssignment[]) {
  const tagsByRecordId = new Map<string, RawTagAssignment[]>();

  for (const assignment of tagAssignments) {
    const tags = tagsByRecordId.get(assignment.transaction_record_id) ?? [];
    tags.push(assignment);
    tagsByRecordId.set(assignment.transaction_record_id, tags);
  }

  return tagsByRecordId;
}

export function buildGroupTagAssignments(
  context: TransactionGroupLoaderContext,
) {
  return context.tagAssignments.flatMap((assignment) => {
    const tagName = context.tagById.get(assignment.tag_id);

    if (!tagName) return [];

    return [
      {
        tagId: assignment.tag_id,
        tagName,
        transactionRecordId: assignment.transaction_record_id,
      },
    ];
  });
}
