"use client";

import React from "react";
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import interact from "./interact";
import type { ViewUpdate } from "@codemirror/view";

type EditorProps = {
  initialValue: string;
  onViewChange: (update: ViewUpdate) => void;
};

export function Editor({ initialValue, onViewChange }: EditorProps) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!ref.current) return;

    const view = new EditorView({
      state: EditorState.create({
        doc: initialValue,
        extensions: [
          EditorView.updateListener.of(onViewChange),
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
  }, [initialValue, onViewChange]);

  return <div className="h-full border rounded-md overflow-hidden" ref={ref} />;
}
