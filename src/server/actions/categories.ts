"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { categoriesErrorHref, routePaths } from "config/paths";
import { requireCurrentUserAndLedger } from "server/context/currentLedger";
import {
  archiveCategoryService,
  createCategoryService,
  updateCategoryService,
} from "server/services/categories";
import {
  validateArchiveCategoryForm,
  validateCreateCategoryForm,
  validateUpdateCategoryForm,
} from "server/validators/categories";

export async function createCategory(formData: FormData) {
  const { currentLedger, userId } = await requireCurrentUserAndLedger();
  const validation = validateCreateCategoryForm(formData);

  if (!validation.ok) {
    redirect(categoriesErrorHref(validation.error));
  }

  const values = validation.value;

  const result = await createCategoryService({
    ledgerId: currentLedger.id,
    name: values.name,
    parentId: values.parentId,
    type: values.type,
    userId,
  });

  if (!result.ok) redirect(categoriesErrorHref(result.error));

  revalidatePath(routePaths.categories);
  redirect(routePaths.categories);
}

export async function updateCategory(formData: FormData) {
  const { currentLedger, userId } = await requireCurrentUserAndLedger();
  const validation = validateUpdateCategoryForm(formData);

  if (!validation.ok) {
    redirect(categoriesErrorHref(validation.error, validation.categoryId));
  }

  const values = validation.value;

  const result = await updateCategoryService({
    categoryId: values.categoryId,
    ledgerId: currentLedger.id,
    name: values.name,
    userId,
  });

  if (!result.ok)
    redirect(categoriesErrorHref(result.error, values.categoryId));

  revalidatePath(routePaths.categories);
  redirect(routePaths.categories);
}

export async function archiveCategory(formData: FormData) {
  const { currentLedger, userId } = await requireCurrentUserAndLedger();
  const validation = validateArchiveCategoryForm(formData);

  if (!validation.ok) {
    redirect(categoriesErrorHref(validation.error));
  }

  const values = validation.value;

  const result = await archiveCategoryService({
    categoryId: values.categoryId,
    ledgerId: currentLedger.id,
    userId,
  });

  if (!result.ok)
    redirect(categoriesErrorHref(result.error, values.categoryId));

  revalidatePath(routePaths.categories);
  redirect(routePaths.categories);
}
