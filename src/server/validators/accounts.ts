import { accountTypeOptions, type AccountType } from "types/accounts";
import { getFormText } from "utils/formData";

import {
  parseCurrencyCode,
  parseEnumValue,
  parseMoneyAmount,
  parseRequiredUuidField,
  parseTextField,
  parseUuidList,
  type ValidationResult,
  valid,
} from "./common";

const accountTypeValues = accountTypeOptions.map((option) => option.value);

type AccountFormFields = {
  currency: string;
  holderUserIds: string[];
  name: string;
  type: AccountType;
};

export type CreateAccountValues = AccountFormFields & {
  initialBalance: number;
};

export type UpdateAccountValues = AccountFormFields & {
  accountId: string;
};

export type ArchiveAccountValues = {
  accountId: string;
};

export type AccountValidationErrorCode =
  | "account_invalid"
  | "currency_invalid"
  | "holder_invalid"
  | "initial_balance_invalid"
  | "name_required"
  | "type_invalid";

function parseAccountType(
  formData: FormData,
): ValidationResult<AccountType, "type_invalid"> {
  return parseEnumValue(
    getFormText(formData, "type"),
    accountTypeValues,
    "type_invalid",
  );
}

function parseHolderUserIds(
  formData: FormData,
): ValidationResult<string[], "holder_invalid"> {
  return parseUuidList(formData.getAll("holderUserIds"), "holder_invalid");
}

function validateAccountFormFields(
  formData: FormData,
): ValidationResult<
  AccountFormFields,
  "currency_invalid" | "holder_invalid" | "name_required" | "type_invalid"
> {
  const nameResult = parseTextField(formData, "name", {
    requiredError: "name_required",
  });

  if (!nameResult.ok) {
    return nameResult;
  }

  const typeResult = parseAccountType(formData);

  if (!typeResult.ok) {
    return typeResult;
  }

  const currencyResult = parseCurrencyCode(
    getFormText(formData, "currency"),
    "currency_invalid",
  );

  if (!currencyResult.ok) {
    return currencyResult;
  }

  const holderUserIdsResult = parseHolderUserIds(formData);

  if (!holderUserIdsResult.ok) {
    return holderUserIdsResult;
  }

  return valid({
    currency: currencyResult.value,
    holderUserIds: holderUserIdsResult.value,
    name: nameResult.value,
    type: typeResult.value,
  });
}

export function validateCreateAccountForm(
  formData: FormData,
): ValidationResult<CreateAccountValues, AccountValidationErrorCode> {
  const fieldsResult = validateAccountFormFields(formData);

  if (!fieldsResult.ok) {
    return fieldsResult;
  }

  const initialBalanceResult = parseMoneyAmount(
    formData.get("initialBalance"),
    {
      allowNegative: true,
      allowZero: true,
      emptyFallback: 0,
      error: "initial_balance_invalid",
    },
  );

  if (!initialBalanceResult.ok) {
    return initialBalanceResult;
  }

  return valid({
    ...fieldsResult.value,
    initialBalance: initialBalanceResult.value,
  });
}

export function validateUpdateAccountForm(
  formData: FormData,
): ValidationResult<UpdateAccountValues, AccountValidationErrorCode> {
  const accountIdResult = parseRequiredUuidField(
    formData,
    "accountId",
    "account_invalid",
  );

  if (!accountIdResult.ok) {
    return accountIdResult;
  }

  const fieldsResult = validateAccountFormFields(formData);

  if (!fieldsResult.ok) {
    return fieldsResult;
  }

  return valid({
    ...fieldsResult.value,
    accountId: accountIdResult.value,
  });
}

export function validateArchiveAccountForm(
  formData: FormData,
): ValidationResult<ArchiveAccountValues, "account_invalid"> {
  const accountIdResult = parseRequiredUuidField(
    formData,
    "accountId",
    "account_invalid",
  );

  if (!accountIdResult.ok) {
    return accountIdResult;
  }

  return valid({ accountId: accountIdResult.value });
}
