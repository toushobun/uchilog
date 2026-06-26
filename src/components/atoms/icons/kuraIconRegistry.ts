import type { SvgIconProps } from "@mui/material/SvgIcon";
import type { ComponentType } from "react";

import {
  AccountKuraIcon,
  CategoryKuraIcon,
  MerchantKuraIcon,
  PhotoRecordKuraIcon,
  QuickRecordKuraIcon,
  TagKuraIcon,
} from "./kuraIconAssets";

export const kuraIconNames = [
  "quickRecord",
  "photoRecord",
  "account",
  "category",
  "tag",
  "merchant",
] as const;

export type KuraIconName = (typeof kuraIconNames)[number];

export const kuraIconLabels = {
  quickRecord: "快速记账",
  photoRecord: "拍照记账",
  account: "账户",
  category: "分类",
  tag: "标签",
  merchant: "商家",
} as const satisfies Record<KuraIconName, string>;

export const kuraIconRegistry = {
  quickRecord: QuickRecordKuraIcon,
  photoRecord: PhotoRecordKuraIcon,
  account: AccountKuraIcon,
  category: CategoryKuraIcon,
  tag: TagKuraIcon,
  merchant: MerchantKuraIcon,
} as const satisfies Record<KuraIconName, ComponentType<SvgIconProps>>;
