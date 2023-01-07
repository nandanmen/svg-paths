"use client";

import React from "react";
import { motion } from "framer-motion";
import { PathEditor } from "./path-editor";

type Command = {
  type: "M" | "L" | "Q";
  args: number[];
};

type IPathCommandsContext = {
  commands: Command[];
  previewCommands: Command[];
  activeCommand: { index: number; argIndex: number } | null;
};

const PathCommandsContext = React.createContext<IPathCommandsContext | null>(
  null
);

const usePathCommands = () => {
  const context = React.useContext(PathCommandsContext);
  if (!context) {
    throw new Error(
      "usePathCommands must be used within a PathCommandsProvider"
    );
  }
  return context;
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
            <PathCommandsContext.Provider
              value={{ commands, previewCommands, activeCommand: null }}
            >
              <Lines preview />
              <Lines />
              <path
                d={`${value}\n${placeholder ?? ""}`}
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
              <CurvePoints preview />
              <CurvePoints />
              <CursorPoints />
            </PathCommandsContext.Provider>
          </GridSquare>
        </main>
      </div>
    </div>
  );
}

const Lines = ({ preview = false }: { preview?: boolean }) => {
  const { commands, previewCommands } = usePathCommands();
  const _commands = preview ? previewCommands : commands;
  return (
    <>
      {_commands.map((command, i) => {
        const cursor = getCursorAtIndex(commands, i - 1);
        switch (command.type) {
          case "M":
            return (
              <Line
                key={`${command.type}-${i}`}
                x1={cursor.x}
                y1={cursor.y}
                x2={command.args[0]}
                y2={command.args[1]}
                className="text-slate-6"
                strokeDasharray="1"
              />
            );
          case "Q": {
            const [x1, y1, x, y] = command.args;
            return (
              <g
                key={`${command.type}-${i}`}
                className={preview ? "text-slate-6" : "text-blue-9"}
              >
                <Line
                  x1={cursor.x}
                  y1={cursor.y}
                  x2={x1}
                  y2={y1}
                  strokeDasharray="1"
                />
                <Line x1={x1} y1={y1} x2={x} y2={y} strokeDasharray="1" />
              </g>
            );
          }
          default:
            return null;
        }
      })}
    </>
  );
};

const Line = (props: React.ComponentPropsWithoutRef<"line">) => {
  return <line stroke="currentColor" strokeWidth="0.5" {...props} />;
};

const CurvePoints = ({ preview = false }: { preview?: boolean }) => {
  const { commands, previewCommands } = usePathCommands();
  const _commands = preview ? previewCommands : commands;
  return (
    <>
      {_commands.map((command, i) => {
        switch (command.type) {
          case "Q": {
            const [x, y] = command.args;
            return (
              <motion.g
                style={{ x, y, rotate: 45 }}
                className={preview ? "text-slate-6" : "text-blue-9"}
              >
                {!preview && (
                  <rect
                    width="3"
                    height="3"
                    x="-1.5"
                    y="-1.5"
                    stroke="currentColor"
                    fill="none"
                    strokeWidth="0.2"
                  />
                )}
                <rect
                  key={`${command.type}-${i}`}
                  x="-1"
                  y="-1"
                  width="2"
                  height="2"
                  fill="currentColor"
                />
              </motion.g>
            );
          }
          default:
            return null;
        }
      })}
    </>
  );
};

const CursorPoints = () => {
  const { commands } = usePathCommands();
  return (
    <>
      <circle
        r="1"
        cx="0"
        cy="0"
        className="fill-slate-2 stroke-slate-12"
        strokeWidth="0.2"
      />
      {commands.map((_, i) => {
        const { x, y } = getCursorAtIndex(commands, i);
        return (
          <circle
            key={`${x}-${y}`}
            r="1"
            cx={x}
            cy={y}
            className="fill-slate-2 stroke-slate-12"
            strokeWidth="0.2"
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

  if (index < 0) return cursor;

  commands.slice(0, index + 1).forEach((command) => {
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
            className="text-slate-3"
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
            className="text-slate-3"
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
