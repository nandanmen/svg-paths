"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PathEditor } from "./path-editor";
import { parseSVG, type Command } from "svg-path-parser";

type ActiveCommand = {
  index: number;
  prop: string;
};

type IPathCommandsContext = {
  commands: Command[];
  previewCommands: Command[];
  activeCommand: ActiveCommand | null;
};

const PathCommandsContext = React.createContext<IPathCommandsContext | null>(
  null
);

const mapArgIndexToProp: Partial<Record<Command["code"], string[]>> = {
  M: ["x", "y"],
  L: ["x", "y"],
  Q: ["x1", "y1", "x", "y"],
};

const usePathCommands = () => {
  const context = React.useContext(PathCommandsContext);
  if (!context) {
    throw new Error(
      "usePathCommands must be used within a PathCommandsProvider"
    );
  }
  return context;
};

const parse = (value: string) => {};

export function App() {
  const [value, setValue] = React.useState("M 10 20");
  const [placeholder, setPlaceholder] = React.useState<string | null>(null);
  const [activeCommand, setActiveCommand] = React.useState<{
    command: number;
    arg: number;
  } | null>(null);
  const [commands, setCommands] = React.useState<Command[]>([]);
  const [previewCommands, setPreviewCommands] = React.useState<Command[]>([]);

  React.useEffect(() => {
    try {
      const commands = parseSVG(value);
      const previewCommands = parseSVG(`${value}\n${placeholder ?? ""}`);
      setCommands(commands);
      setPreviewCommands(previewCommands);
    } catch {}
  }, [value, placeholder]);

  const _activeCommand = React.useMemo(() => {
    if (!activeCommand) return null;
    const { command, arg } = activeCommand;
    const _command = commands[command];
    if (!(_command.code in mapArgIndexToProp)) return null;
    return {
      index: command,
      prop: mapArgIndexToProp[_command.code]![arg],
    };
  }, [commands, activeCommand]);

  return (
    <div className="flex h-full gap-6">
      <aside className="w-[35ch] flex-shrink-0">
        <PathEditor
          initialValue={value}
          onValueChange={setValue}
          onPlaceholderChange={setPlaceholder}
          onActiveCommandChange={(update) => {
            setActiveCommand(update);
          }}
        />
      </aside>
      <div className="w-fit overflow-x-auto">
        <main className="aspect-square h-full">
          <PathCommandsContext.Provider
            value={{ commands, previewCommands, activeCommand: _activeCommand }}
          >
            <GridSquare size={100} gap={10} padding={4}>
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
            </GridSquare>
          </PathCommandsContext.Provider>
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
        switch (command.code) {
          case "M":
            return (
              <Line
                key={`${command.code}-${i}`}
                x1={cursor.x}
                y1={cursor.y}
                x2={command.x}
                y2={command.y}
                className="text-slate-6"
                strokeDasharray="1"
              />
            );
          case "Q": {
            const { x1, y1, x, y } = command;
            return (
              <g
                key={`${command.code}-${i}`}
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

const isActive = (
  activeCommand: ActiveCommand | null,
  i: number,
  props: string[]
) => {
  return activeCommand?.index === i && props.includes(activeCommand?.prop);
};

const CurvePoints = ({ preview = false }: { preview?: boolean }) => {
  const { commands, previewCommands, activeCommand } = usePathCommands();
  const _commands = preview ? previewCommands : commands;
  return (
    <>
      {_commands.map((command, i) => {
        switch (command.code) {
          case "Q": {
            const { x1, y1 } = command;
            const active = isActive(activeCommand, i, ["x1", "y1"]);
            return (
              <motion.g
                key={`${command.code}-${i}`}
                style={{ x: x1, y: y1, rotate: 45 }}
                className={preview ? "text-slate-6" : "text-blue-9"}
              >
                <motion.rect
                  width="3"
                  height="3"
                  x="-1.5"
                  y="-1.5"
                  stroke="currentColor"
                  fill="none"
                  strokeWidth="0.2"
                  animate={{ scale: !preview && active ? 1 : 0 }}
                  initial={{ scale: 0 }}
                />
                <rect x="-1" y="-1" width="2" height="2" fill="currentColor" />
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
  const { commands, activeCommand } = usePathCommands();
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
        const active = isActive(activeCommand, i, ["x", "y"]);
        return (
          <motion.g style={{ x, y }} key={i}>
            <motion.circle
              cx="0"
              cy="0"
              r="2"
              className="fill-blue-8"
              animate={{ scale: active ? 1 : 0 }}
              initial={{ scale: 0 }}
            />
            <circle
              r="1"
              cx="0"
              cy="0"
              className="fill-slate-2 stroke-slate-12"
              strokeWidth="0.2"
            />
          </motion.g>
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
    switch (command.code) {
      case "M":
      case "L":
      case "Q":
        cursor.x = command.x;
        cursor.y = command.y;
        break;
    }
  });

  return cursor;
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

const getActiveLine = (
  commands: Command[],
  activeCommand: ActiveCommand | null
): { axis: "x" | "y"; offset: number } | null => {
  if (!activeCommand) return null;
  if (
    !activeCommand.prop.startsWith("x") &&
    !activeCommand.prop.startsWith("y")
  )
    return null;
  const { index, prop } = activeCommand;
  const command = commands[index];
  const isX = prop.startsWith("x");
  const oppositeProp = prop.replace(isX ? "x" : "y", isX ? "y" : "x");
  return {
    axis: isX ? "y" : "x",
    offset: (command as any)[oppositeProp] as number,
  };
};

const GridSquare = ({ size, gap, padding, children }: GridSquareProps) => {
  const { commands, activeCommand } = usePathCommands();
  const cols = range(0, size, gap);
  const rows = range(0, size, gap);
  const viewBox = `-${padding} -${padding} ${size + padding * 2} ${
    size + padding * 2
  }`;
  const max = size + padding * 2;
  const min = -padding;
  const activeLine = getActiveLine(commands, activeCommand);
  return (
    <svg viewBox={viewBox} width="100%" height="100%">
      <g className="text-slate-3">
        {cols.map((x) => {
          return (
            <Line key={x} x1={x} x2={x} y1={min} y2={max} strokeWidth="0.2" />
          );
        })}
        {rows.map((y) => {
          return (
            <Line key={y} x1={min} x2={max} y1={y} y2={y} strokeWidth="0.2" />
          );
        })}
        <AnimatePresence>
          {activeLine && (
            <motion.g
              className="text-slate-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {activeLine.axis === "x" ? (
                <Line
                  x1={activeLine.offset}
                  x2={activeLine.offset}
                  y1={min}
                  y2={max}
                  strokeWidth="0.5"
                  strokeDasharray="2 1"
                />
              ) : (
                <Line
                  y1={activeLine.offset}
                  y2={activeLine.offset}
                  x1={min}
                  x2={max}
                  strokeWidth="0.5"
                  strokeDasharray="2 1"
                />
              )}
            </motion.g>
          )}
        </AnimatePresence>
      </g>
      {children}
    </svg>
  );
};
