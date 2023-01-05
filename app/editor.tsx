"use client";

import React from "react";
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import type { ViewUpdate } from "@codemirror/view";
import {
  autocompletion,
  type CompletionContext,
} from "@codemirror/autocomplete";
import interact from "./interact";

function myCompletions(context: CompletionContext) {
  let word = context.matchBefore(/\w*/);
  if (!word || word.from == word.to) return null;
  return {
    from: word.from,
    options: [
      { label: "match", type: "keyword" },
      { label: "hello", type: "variable", info: "(World)" },
      { label: "magic", type: "text", apply: "⠁⭒*.✩.*⭒⠁", detail: "macro" },
    ],
  };
}

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

  return (
    <div
      className="h-full text-neutral-200 border border-neutral-700 rounded-md overflow-hidden"
      ref={ref}
    />
  );
}
