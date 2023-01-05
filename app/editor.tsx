"use client";

import React from "react";
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import type { ViewUpdate } from "@codemirror/view";
import {
  autocompletion,
  type CompletionContext,
  type CompletionResult,
} from "@codemirror/autocomplete";
import interact from "./interact";

function myCompletions(context: CompletionContext): CompletionResult | null {
  if (!context.explicit) return null;
  return {
    from: context.pos,
    filter: false,
    options: [
      { label: "M 10 20" },
      { label: "L 10 20" },
      {
        label: "Q 10 20 30 40",
      },
    ],
  };
}

type EditorProps = {
  initialValue: string;
  onViewChange: (update: ViewUpdate) => void;
};

const theme = EditorView.theme(
  {
    ".cm-content": {
      caretColor: "white",
    },
  },
  { dark: true }
);

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
          theme,
          autocompletion({
            override: [myCompletions],
          }),
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

  return <div className="h-full text-gray-12 bg-backgroundText" ref={ref} />;
}
