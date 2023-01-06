"use client";

import React from "react";
import { PathEditor } from "./path-editor";

type Command = {
  type: "M" | "L" | "Q";
  args: number[];
};

export function App() {
  const [value, setValue] = React.useState("M 10 20");
  const [placeholder, setPlaceholder] = React.useState<string | null>(null);
  const commands = parse(value);
  const previewCommands = parse(`${value}\n${placeholder}`);

  return (
    <div className="flex h-full gap-6">
      <aside className="w-[35ch] flex-shrink-0">
        <PathEditor
          initialValue={value}
          onValueChange={setValue}
          onPlaceholderChange={setPlaceholder}
        />
      </aside>
      <div className="w-fit overflow-x-auto">
        <main className="aspect-square h-full">
          <GridSquare size={100} gap={10} padding={4}>
            <Lines commands={previewCommands} />
            <path
              d={`${value}\n${placeholder}`}
              stroke="currentColor"
              strokeWidth="1"
              className="text-slate-9"
              fill="none"
            />
            <path
              d={value}
              stroke="currentColor"
              strokeWidth="1"
              className="text-slate-12"
              fill="none"
            />
            <CurvePoints commands={previewCommands} />
            <CursorPoints commands={previewCommands} />
          </GridSquare>
        </main>
      </div>
    </div>
  );
}

const Lines = ({ commands }: { commands: Command[] }) => {
  return (
    <>
      {commands.map((command, i) => {
        const cursor = getCursorAtIndex(commands, i);
        switch (command.type) {
          case "M":
            return (
              <line
                key={`${command.type}-${i}`}
                x1={cursor.x}
                y1={cursor.y}
                x2={command.args[0]}
                y2={command.args[1]}
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-slate-6"
                strokeDasharray="1"
              />
            );
          case "Q": {
            const [x1, y1, x, y] = command.args;
            return (
              <React.Fragment key={`${command.type}-${i}`}>
                <line
                  x1={cursor.x}
                  y1={cursor.y}
                  x2={x1}
                  y2={y1}
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-slate-6"
                  strokeDasharray="1"
                />
                <line
                  x1={x1}
                  y1={y1}
                  x2={x}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-slate-6"
                  strokeDasharray="1"
                />
              </React.Fragment>
            );
          }
          default:
            return null;
        }
      })}
    </>
  );
};

const CurvePoints = ({ commands }: { commands: Command[] }) => {
  return (
    <>
      {commands.map((command, i) => {
        const cursor = getCursorAtIndex(commands, i);
        switch (command.type) {
          case "Q": {
            const [x, y] = command.args;
            return (
              <rect
                key={`${command.type}-${i}`}
                x={x - 1}
                y={y - 1}
                width="2"
                height="2"
                className="fill-slate-1 stroke-slate-12"
                strokeWidth="0.2"
              />
            );
          }
          default:
            return null;
        }
      })}
    </>
  );
};

const CursorPoints = ({ commands }: { commands: Command[] }) => {
  return (
    <>
      {commands.map((_, i) => {
        const { x, y } = getCursorAtIndex(commands, i);
        return (
          <circle
            key={`${x}-${y}`}
            r="1"
            cx={x}
            cy={y}
            className="fill-slate-1 stroke-slate-12"
            stroke-width="0.2"
          />
        );
      })}
    </>
  );
};

type Cursor = {
  x: number;
  y: number;
};

const getCursorAtIndex = (commands: Command[], index: number): Cursor => {
  const cursor: Cursor = { x: 0, y: 0 };

  commands.slice(0, index).forEach((command) => {
    switch (command.type) {
      case "M":
      case "L":
        cursor.x = command.args[0];
        cursor.y = command.args[1];
        break;
      case "Q":
        cursor.x = command.args[2];
        cursor.y = command.args[3];
        break;
    }
  });

  return cursor;
};

const parse = (commands: string): Command[] => {
  const parts = commands.trim().split("\n");
  return parts.map((part) => {
    const [command, ...args] = part.split(" ");
    return {
      type: command,
      args: args.map((arg) => parseFloat(arg)),
    } as Command;
  });
};

const range = (start: number, end: number, step = 1) => {
  const result = [];
  for (let i = start; i <= end; i += step) {
    result.push(i);
  }
  return result;
};

type GridSquareProps = {
  size: number;
  gap: number;
  padding: number;
  children?: React.ReactNode;
};

const GridSquare = ({ size, gap, padding, children }: GridSquareProps) => {
  const cols = range(0, size, gap);
  const rows = range(0, size, gap);
  const viewBox = `-${padding} -${padding} ${size + padding * 2} ${
    size + padding * 2
  }`;
  return (
    <svg viewBox={viewBox} width="100%" height="100%">
      {cols.map((x) => {
        return (
          <line
            className="text-slate-2"
            key={x}
            x1={x}
            x2={x}
            y1={-padding}
            y2={size + padding * 2}
            stroke="currentColor"
            strokeWidth="0.2"
          />
        );
      })}
      {rows.map((y) => {
        return (
          <line
            className="text-slate-2"
            key={y}
            x1={-padding}
            x2={size + padding * 2}
            y1={y}
            y2={y}
            stroke="currentColor"
            strokeWidth="0.2"
          />
        );
      })}
      {children}
    </svg>
  );
};
