"use client";

import React from "react";
import type { Line } from "@codemirror/state";
import { ViewUpdate } from "@codemirror/view";
import {
  startCompletion,
  completionStatus,
  selectedCompletion,
} from "@codemirror/autocomplete";
import { motion } from "framer-motion";
import { Editor } from "./editor";

const getMessageFromLine = (
  line: Line | undefined | null,
  placeholder: string | null
) => {
  if (!line) return null;

  let text = line.text;
  if (text.length === 0) {
    if (!placeholder) return null;
    text = placeholder;
  }

  const [command, ...args] = text.split(" ");
  switch (command) {
    case "M":
      return `Move the cursor to (${args.join(", ")})`;
    case "L":
      return `Draw a line to (${args.join(", ")})`;
    case "Q": {
      const [x1, y1, x, y] = args;
      return `Draw a quadratic curve to (${x}, ${y}) using (${x1}, ${y1}) as the control point`;
    }
    default:
      return null;
  }
};

type PathEditorProps = {
  initialValue: string;
  onValueChange: (value: string) => void;
  onPlaceholderChange: (placeholder: string | null) => void;
};

const getYOffset = (node?: HTMLElement) => {
  if (!node) return 0;
  let el: HTMLElement = node;
  if (node.nodeName === "#text" && node.parentElement) {
    el = node.parentElement;
  }
  return el.offsetTop;
};

export function PathEditor({
  initialValue,
  onValueChange,
  onPlaceholderChange,
}: PathEditorProps) {
  const [placeholder, setPlaceholder] = React.useState<string | null>(null);
  const [line, setLine] = React.useState<{
    node: Node;
    line: Line;
  } | null>(null);

  React.useEffect(() => {
    onPlaceholderChange(placeholder);
  }, [placeholder, onPlaceholderChange]);

  const onViewChange = React.useCallback(
    ({ state, view, docChanged }: ViewUpdate) => {
      const currentSelection = state.selection.ranges[0].from;
      const line = state.doc.lineAt(currentSelection);

      if (line.text === "" && !completionStatus(view.state)) {
        startCompletion(view);
      }

      if (completionStatus(view.state) === "active") {
        setPlaceholder(selectedCompletion(view.state)?.label ?? null);
      } else {
        setPlaceholder(null);
      }

      const dom = view.domAtPos(currentSelection);
      setLine({ node: dom.node, line });

      if (docChanged) {
        onValueChange(state.doc.toString());
      }
    },
    [onValueChange]
  );

  const yOffset = getYOffset(line?.node as HTMLElement);
  return (
    <div className="relative h-full">
      <Container className="h-full">
        <Editor initialValue={initialValue} onViewChange={onViewChange} />
      </Container>
      {placeholder && (
        <p
          style={{ top: yOffset }}
          className="absolute top-0 left-[40px] font-mono italic text-slate-9"
        >
          {placeholder}
        </p>
      )}
      {(line || placeholder) && (
        <motion.p
          animate={{
            y: yOffset,
          }}
          transition={{ type: "spring", duration: 0.3 }}
          className="absolute right-3 top-[3px] text-xs text-slate-9 text-right max-w-[160px]"
        >
          {getMessageFromLine(line?.line, placeholder)}
        </motion.p>
      )}
    </div>
  );
}

type ContainerProps = {
  className?: string;
  children?: React.ReactNode;
};

export const Container = ({ className = "", children }: ContainerProps) => {
  return (
    <div className={`border border-slate-4 relative ${className}`}>
      {children}
      <Corner className="top-0 left-0 -translate-y-1/2 -translate-x-1/2" />
      <Corner className="top-0 right-0 -translate-y-1/2 translate-x-1/2" />
      <Corner className="bottom-0 left-0 translate-y-1/2 -translate-x-1/2" />
      <Corner className="bottom-0 right-0 translate-y-1/2 translate-x-1/2" />
    </div>
  );
};

const Corner = ({ className = "" }) => {
  return <div className={`w-1 h-1 bg-slate-10 absolute ${className}`} />;
};
