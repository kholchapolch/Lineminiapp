"use client";

import { useEffect } from "react";

/**
 * LIFF / portal shell often locks html/body overflow. Register has no nested
 * scrollport, so unlock document scrolling for this page only.
 */
export function PortalRegisterScrollUnlock(): null {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const layout = document.querySelector(".portalLayout");

    const previous = {
      htmlOverflow: html.style.overflow,
      htmlHeight: html.style.height,
      bodyOverflow: body.style.overflow,
      bodyHeight: body.style.height,
      bodyPosition: body.style.position,
      bodyTouchAction: body.style.touchAction,
      layoutOverflow: layout instanceof HTMLElement ? layout.style.overflow : "",
      layoutHeight: layout instanceof HTMLElement ? layout.style.height : "",
      layoutMaxHeight:
        layout instanceof HTMLElement ? layout.style.maxHeight : "",
    };

    html.style.overflow = "auto";
    html.style.height = "auto";
    body.style.overflow = "auto";
    body.style.height = "auto";
    body.style.position = "static";
    body.style.touchAction = "pan-y";

    if (layout instanceof HTMLElement) {
      layout.style.overflow = "visible";
      layout.style.height = "auto";
      layout.style.maxHeight = "none";
    }

    return () => {
      html.style.overflow = previous.htmlOverflow;
      html.style.height = previous.htmlHeight;
      body.style.overflow = previous.bodyOverflow;
      body.style.height = previous.bodyHeight;
      body.style.position = previous.bodyPosition;
      body.style.touchAction = previous.bodyTouchAction;
      if (layout instanceof HTMLElement) {
        layout.style.overflow = previous.layoutOverflow;
        layout.style.height = previous.layoutHeight;
        layout.style.maxHeight = previous.layoutMaxHeight;
      }
    };
  }, []);

  return null;
}
