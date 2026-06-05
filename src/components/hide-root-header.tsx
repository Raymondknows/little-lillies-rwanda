"use client";

import { useEffect } from "react";

export function HideRootHeader() {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>("header.sticky");
    if (!header) return;

    header.style.display = "none";

    return () => {
      header.style.display = "";
    };
  }, []);

  return null;
}
