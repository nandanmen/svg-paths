"use client";

import React from "react";
import type { Line } from "@codemirror/state";
import { EditorView, ViewUpdate } from "@codemirror/view";
import {
  startCompletion,
  completionStatus,
  selectedCompletion,
} from "@codemirror/autocomplete";
import { motion, transform } from "framer-motion";
import Balancer from "react-wrap-balancer";
import { Editor } from "./editor";

const transformSlide = transform([-1, 1], [-0.5, 0.5], { clamp: false });

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
      return `Move the cursor to (${args
        .map((x) => Number(x).toFixed(1))
        .join(", ")})`;
    case "L":
      return `Draw a line to (${args
        .map((x) => Number(x).toFixed(1))
        .join(", ")})`;
    case "Q": {
      const [x1, y1, x, y] = args.map((x) => Number(x).toFixed(1));
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
  onActiveCommandChange: (
    update: { command: number; arg: number } | null
  ) => void;
};

const getYOffset = (node?: HTMLElement) => {
  if (!node) return 0;
  let el: HTMLElement = node;
  if (node.nodeName === "#text" && node.parentElement) {
    el = node.parentElement;
  }
  return el.offsetTop;
};

const splitWithIndex = (text: string) => {
  const parts = [];

  let start = 0;
  while (start < text.length) {
    const end = text.indexOf(" ", start);
    if (end === -1) {
      parts.push({ text: text.slice(start), index: start });
      break;
    }
    parts.push({ text: text.slice(start, end), index: start });
    start = end + 1;
  }

  return parts;
};

const createCommandUpdate = (pos: number, view: EditorView) => {
  const line = view.state.doc.lineAt(pos);
  const [, ...parts] = splitWithIndex(line.text);
  const offset = pos - line.from;
  const arg = parts.findIndex(
    (part) => offset >= part.index && offset <= part.index + part.text.length
  );
  return { command: line.number - 1, arg };
};

export function PathEditor({
  initialValue,
  onValueChange,
  onPlaceholderChange,
  onActiveCommandChange,
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
        <Editor
          initialValue={initialValue}
          onViewChange={onViewChange}
          interactRules={[
            {
              regexp: /-?\b\d+\.?\d*\b/g,
              cursor: "ew-resize",
              onDrag: (text, setText, e) => {
                const newVal = Number(text) + transformSlide(e.movementX);
                if (isNaN(newVal)) return;
                setText(newVal.toFixed(1));
              },
              onMatchChange: (target, view) => {
                if (!target) onActiveCommandChange(null);
                else
                  onActiveCommandChange(createCommandUpdate(target.pos, view));
              },
            },
          ]}
        />
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
            y: yOffset + 1,
          }}
          style={{
            x: "calc(-100% - 16px)",
          }}
          transition={{ type: "spring", duration: 0.3 }}
          className="absolute left-0 top-[3px] text-[0.65rem] text-slate-9 text-right max-w-[170px] pointer-events-none font-mono leading-tight"
        >
          <Balancer>{getMessageFromLine(line?.line, placeholder)}</Balancer>
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
