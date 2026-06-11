import {
  accountErrorCodes,
  type AccountValidationErrorCode,
} from "server/errors/accounts";
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

export type { AccountValidationErrorCode };

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

function parseAccountType(
  formData: FormData,
): ValidationResult<AccountType, typeof accountErrorCodes.typeInvalid> {
  return parseEnumValue(
    getFormText(formData, "type"),
    accountTypeValues,
    accountErrorCodes.typeInvalid,
  );
}

function parseHolderUserIds(
  formData: FormData,
): ValidationResult<string[], typeof accountErrorCodes.holderInvalid> {
  return parseUuidList(
    formData.getAll("holderUserIds"),
    accountErrorCodes.holderInvalid,
  );
}

function validateAccountFormFields(
  formData: FormData,
): ValidationResult<AccountFormFields, AccountValidationErrorCode> {
  const nameResult = parseTextField(formData, "name", {
    requiredError: accountErrorCodes.nameRequired,
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
    accountErrorCodes.currencyInvalid,
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
      error: accountErrorCodes.initialBalanceInvalid,
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
    accountErrorCodes.accountInvalid,
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
): ValidationResult<
  ArchiveAccountValues,
  typeof accountErrorCodes.accountInvalid
> {
  const accountIdResult = parseRequiredUuidField(
    formData,
    "accountId",
    accountErrorCodes.accountInvalid,
  );

  if (!accountIdResult.ok) {
    return accountIdResult;
  }

  return valid({ accountId: accountIdResult.value });
}
