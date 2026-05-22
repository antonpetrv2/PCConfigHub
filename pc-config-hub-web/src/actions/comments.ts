"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { createConfigComment, createPartComment } from "@/services/api/comments-service";
import { hasConfig, hasPart } from "@/services/api/comments-targets";

const parsePositiveId = (value: FormDataEntryValue | null) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid id");
  }

  return id;
};

const normalizeBody = (value: FormDataEntryValue | null) =>
  String(value ?? "").trim();

export const createConfigurationCommentAction = async (formData: FormData) => {
  const user = await getCurrentUser();
  const configId = parsePositiveId(formData.get("configurationId"));
  const body = normalizeBody(formData.get("body"));

  if (!user) {
    redirect(`/login?redirectTo=/configurations/${configId}`);
  }

  if (body.length < 2 || body.length > 1000) {
    redirect(`/configurations/${configId}?comment=invalid`);
  }

  if (!(await hasConfig(configId))) {
    redirect("/configurations");
  }

  await createConfigComment({
    configId,
    authorUserId: user.id,
    body,
  });

  revalidatePath(`/configurations/${configId}`);
  redirect(`/configurations/${configId}?comment=pending`);
};

export const createPartCommentAction = async (formData: FormData) => {
  const user = await getCurrentUser();
  const partId = parsePositiveId(formData.get("partId"));
  const body = normalizeBody(formData.get("body"));

  if (!user) {
    redirect(`/login?redirectTo=/parts/${partId}`);
  }

  if (body.length < 2 || body.length > 1000) {
    redirect(`/parts/${partId}?comment=invalid`);
  }

  if (!(await hasPart(partId))) {
    redirect("/parts");
  }

  await createPartComment({
    partId,
    authorUserId: user.id,
    body,
  });

  revalidatePath(`/parts/${partId}`);
  redirect(`/parts/${partId}?comment=pending`);
};
