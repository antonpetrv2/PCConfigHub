"use client";

import { useState } from "react";

import AddPartForm, { type EditablePart } from "@/app/parts/add-part-form";

type AddPartLauncherProps = {
  part?: EditablePart;
};

export default function AddPartLauncher({ part }: AddPartLauncherProps) {
  const [open, setOpen] = useState(false);
  const isEditing = Boolean(part);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-[#30f2ff] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#0c0b14]"
      >
        {isEditing ? "Edit" : "Add new part"}
      </button>
      {open ? (
        <AddPartForm isOpen={open} onClose={() => setOpen(false)} part={part} />
      ) : null}
    </>
  );
}
