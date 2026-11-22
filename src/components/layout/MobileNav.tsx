"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { categories } from "@/lib/tools/categories";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-xs border border-line text-ink/70 hover:border-indigo-400 hover:text-indigo-600"
      >
        {open ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-16 z-30 border-b border-line bg-paper px-4 pb-4 shadow-lift">
          <nav aria-label="Categories" className="flex flex-col divide-y divide-line">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/${category.slug}`}
                onClick={() => setOpen(false)}
                className="py-3 text-sm font-medium text-ink/80 hover:text-indigo-600"
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
