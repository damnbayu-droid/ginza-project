"use client";

import { useEffect } from "react";

// Pembesar gambar untuk pindaian arsip. Markup <dialog id="kcbp-lb"> ada di PAGE_HTML.
export default function Lightbox() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".kcbp");
    const lb = document.getElementById("kcbp-lb") as HTMLDialogElement | null;
    const img = document.getElementById("kcbp-lb-img") as HTMLImageElement | null;
    const cap = document.getElementById("kcbp-lb-cap");
    const size = document.getElementById("kcbp-lb-size");
    const close = document.getElementById("kcbp-lb-close");
    if (!root || !lb || !img || !cap || !size || !close) return;

    const setFit = (on: boolean) => {
      img.classList.toggle("fit", on);
      size.textContent = on ? "Ukuran asli" : "Muat di layar";
    };

    const onRootClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const btn = target ? target.closest<HTMLElement>("[data-zoom]") : null;
      if (!btn) return;
      const inner = btn.querySelector("img");
      img.src = btn.getAttribute("data-zoom") ?? "";
      img.alt = inner ? inner.getAttribute("alt") ?? "" : "";
      cap.textContent = btn.getAttribute("data-cap") ?? "";
      setFit(true);
      if (typeof lb.showModal === "function") {
        lb.showModal();
      } else {
        lb.setAttribute("open", "");
      }
    };
    const onClose = () => lb.close();
    const onSize = () => setFit(!img.classList.contains("fit"));
    const onBackdrop = (e: MouseEvent) => {
      if (e.target === lb) lb.close();
    };

    root.addEventListener("click", onRootClick);
    close.addEventListener("click", onClose);
    size.addEventListener("click", onSize);
    lb.addEventListener("click", onBackdrop);
    return () => {
      root.removeEventListener("click", onRootClick);
      close.removeEventListener("click", onClose);
      size.removeEventListener("click", onSize);
      lb.removeEventListener("click", onBackdrop);
    };
  }, []);

  return null;
}
