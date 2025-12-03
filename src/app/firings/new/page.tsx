'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiringFormModal } from "../components/FiringFormModal";

export default function NewFiringPage() {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
    router.push("/kiln");
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_#33415555,_transparent_45%)]" aria-hidden />
      <div className="flex min-h-screen items-center justify-center px-4 py-16 text-white">
        <div className="max-w-2xl text-center space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-300/80">Firing workspace</p>
          <h1 className="text-3xl font-semibold">Start or update a firing without leaving your flow</h1>
          <p className="text-slate-300">
            The new modal experience keeps kiln setup close at hand. Close the window when you\'re done to go back to the
            firing list.
          </p>
        </div>
      </div>

      <FiringFormModal open={open} onClose={handleClose} />
    </div>
  );
}
