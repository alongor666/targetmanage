"use client";

import { useEffect } from "react";
import { LS_KEYS, lsGetJson } from "@/services/storage";

export function ColorSystemHydrator() {
  useEffect(() => {
    // page.tsx saves Record<string, string> where keys are stripped of "--color-" prefix
    const saved = lsGetJson<Record<string, string>>(LS_KEYS.uiColorSystem);
    if (!saved) return;

    const root = document.documentElement;
    Object.entries(saved).forEach(([key, value]) => {
      // Re-add the prefix
      root.style.setProperty(`--color-${key}`, value);
    });
  }, []);

  return null;
}
