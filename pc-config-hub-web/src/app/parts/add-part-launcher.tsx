"use client";

import { useState } from "react";

import AddPartForm from "@/app/parts/add-part-form";

export default function AddPartLauncher() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-[#30f2ff] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#0c0b14]"
      >
        Add new part
      </button>
      <AddPartForm isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
