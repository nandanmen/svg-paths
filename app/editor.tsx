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
import interact, { type InteractRule } from "./interact";

function myCompletions(context: CompletionContext): CompletionResult | null {
  if (!context.explicit) return null;
  return {
    from: context.pos,
    filter: false,
    options: [
      { label: "M 10 20" },
      { label: "L 30 40" },
      {
        label: "Q 50 90 80 50",
      },
    ],
  };
}

type EditorProps = {
  initialValue: string;
  onViewChange: (update: ViewUpdate) => void;
  interactRules?: InteractRule[];
};

const theme = EditorView.theme({
  ".cm-content": {
    caretColor: "white",
  },
});

export function Editor({
  initialValue,
  onViewChange,
  interactRules = [],
}: EditorProps) {
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
            rules: interactRules,
          }),
        ],
      }),
      parent: ref.current,
    });

    return () => view.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onViewChange]);

  return <div className="h-full text-slate-12 bg-slate-1" ref={ref} />;
}
