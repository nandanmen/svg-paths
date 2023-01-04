"use client";

import React from "react";
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import interact from "./interact";

export function Editor() {
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!ref.current) return;

    const view = new EditorView({
      state: EditorState.create({
        doc: "M 10 20\nL 30 40",
        extensions: [
          basicSetup,
          interact({
            rules: [
              {
                regexp: /-?\b\d+\.?\d*\b/g,
                cursor: "ew-resize",
                onDrag: (text, setText, e) => {
                  const newVal = Number(text) + e.movementX;
                  if (isNaN(newVal)) return;
                  setText(newVal.toString());
                },
              },
            ],
          }),
        ],
      }),
      parent: ref.current,
    });

    return () => view.destroy();
  }, []);

  return (
    <div
      className="w-[400px] border border-gray-700 rounded-md overflow-hidden"
      ref={ref}
    />
  );
}
