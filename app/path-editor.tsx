"use client";

import React from "react";
import type { Line } from "@codemirror/state";
import { ViewUpdate } from "@codemirror/view";
import { motion } from "framer-motion";
import { Editor } from "./editor";

const getMessageFromLine = (line: Line) => {
  const [command, ...args] = line.text.split(" ");
  switch (command) {
    case "M":
      return `Moves the cursor to (${args.join(", ")})`;
    case "L":
      return `Draws a line to (${args.join(", ")})`;
    default:
      return null;
  }
};

export function PathEditor() {
  const [line, setLine] = React.useState<{
    node: Node;
    line: Line;
  } | null>(null);

  const onViewChange = React.useCallback(({ state, view }: ViewUpdate) => {
    const currentSelection = state.selection.ranges[0].from;
    const line = state.doc.lineAt(currentSelection);
    const dom = view.domAtPos(currentSelection);
    setLine({ node: dom.node, line });
  }, []);

  return (
    <div className="relative h-full">
      <Editor initialValue={`M 10 20\nL 30 40`} onViewChange={onViewChange} />
      {line && (
        <motion.p
          animate={{
            y: (line.node.parentElement?.offsetTop ?? 0) + 2,
          }}
          transition={{ type: "spring", duration: 0.5 }}
          className="absolute right-2 top-0 text-sm text-neutral-400"
        >
          {getMessageFromLine(line.line)}
        </motion.p>
      )}
    </div>
  );
}
