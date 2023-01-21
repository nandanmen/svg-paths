"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import produce from "immer";
import { PathEditor } from "./path-editor";
import { Endpoint, Line } from "./shared";
import { Svg, useViewBoxContext } from "./svg";
import {
  parseSVG,
  makeAbsolute,
  type Command,
  type CommandMadeAbsolute,
} from "svg-path-parser";

type ActiveCommand = {
  index: number;
  prop: string;
};

type IPathCommandsContext = {
  commands: Command[];
  toAbsolute: (commands: Command[]) => CommandMadeAbsolute[];
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

export function App() {
  const [value, setValue] = React.useState("M 10 20");
  const [size, setSize] = React.useState(100);
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

  const toAbsolute = React.useCallback((commands: Command[]) => {
    return produce(commands, (draft) =>
      makeAbsolute(draft)
    ) as CommandMadeAbsolute[];
  }, []);

  return (
    <div className="flex h-full gap-6">
      <aside className="w-[35ch] flex-shrink-0 flex flex-col">
        <div className="flex font-mono mb-4">
          <input
            type="range"
            value={size}
            onChange={(evt) => setSize(evt.target.valueAsNumber)}
            min={25}
            max={200}
            step={5}
          />
          <p className="ml-auto text-sm">size: {size}</p>
        </div>
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
            value={{
              commands,
              previewCommands,
              activeCommand: _activeCommand,
              toAbsolute,
            }}
          >
            <Svg size={size} onSizeChange={setSize} gap={5} padding={4}>
              <ActiveLine />
              <Lines preview />
              <Lines />
              <Paths value={value} placeholder={placeholder} />
              <CurvePoints preview />
              <CurvePoints />
              <CursorPoints />
            </Svg>
          </PathCommandsContext.Provider>
        </main>
      </div>
    </div>
  );
}

const Paths = ({
  value,
  placeholder,
}: {
  value: string;
  placeholder: string | null;
}) => {
  const { getRelativeSize } = useViewBoxContext();
  return (
    <g>
      <path
        d={`${value}\n${placeholder ?? ""}`}
        stroke="currentColor"
        strokeWidth={getRelativeSize(1)}
        className="text-slate-8"
        fill="none"
      />
      <path
        d={value}
        stroke="currentColor"
        strokeWidth={getRelativeSize(1)}
        className="text-slate-12"
        fill="none"
      />
    </g>
  );
};

const Lines = ({ preview = false }: { preview?: boolean }) => {
  const { getRelativeSize } = useViewBoxContext();
  const { commands, previewCommands, toAbsolute } = usePathCommands();
  const _commands = toAbsolute(preview ? previewCommands : commands);
  return (
    <>
      {_commands.map((command, i) => {
        switch (command.code) {
          case "M": {
            return (
              <Line
                key={`${command.code}-${i}`}
                x1={command.x0}
                y1={command.y0}
                x2={command.x}
                y2={command.y}
                className="text-slate-8"
                strokeDasharray={getRelativeSize(1)}
              />
            );
          }
          case "C": {
            const { x1, y1, x2, y2, x, y, x0, y0 } = command;
            return (
              <g key={`${command.code}-${i}`} className="text-slate-8">
                <Line x1={x0} y1={y0} x2={x1} y2={y1} />
                <Line x1={x2} y1={y2} x2={x} y2={y} />
              </g>
            );
          }
          case "Q": {
            const { x1, y1, x, y, x0, y0 } = command;
            return (
              <g key={`${command.code}-${i}`} className="text-slate-8">
                <Line x1={x0} y1={y0} x2={x1} y2={y1} />
                <Line x1={x1} y1={y1} x2={x} y2={y} />
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

const isActive = (
  activeCommand: ActiveCommand | null,
  i: number,
  props: string[]
) => {
  return activeCommand?.index === i && props.includes(activeCommand?.prop);
};

const CurvePoints = ({ preview = false }: { preview?: boolean }) => {
  const { commands, previewCommands, activeCommand, toAbsolute } =
    usePathCommands();
  const _commands = toAbsolute(preview ? previewCommands : commands);
  return (
    <>
      <Endpoint x={0} y={0} />
      {_commands.map((command, i) => {
        switch (command.code) {
          case "Q": {
            const { x1, y1 } = command;
            const active = isActive(activeCommand, i, ["x1", "y1"]);
            return <Endpoint x={x1} y={y1} active={active} />;
          }
          default:
            return null;
        }
      })}
    </>
  );
};

const CursorPoints = () => {
  const { commands, activeCommand, toAbsolute } = usePathCommands();
  const _commands = toAbsolute(commands);
  return (
    <>
      <Endpoint x={0} y={0} isCursor />
      {_commands.map((command, i) => {
        const active = isActive(activeCommand, i, ["x", "y"]);
        return (
          <Endpoint
            key={i}
            x={command.x}
            y={command.y}
            active={active}
            isCursor
          />
        );
      })}
    </>
  );
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

const ActiveLine = () => {
  const { commands, activeCommand } = usePathCommands();
  const { min, max, getRelativeSize } = useViewBoxContext();
  const activeLine = getActiveLine(commands, activeCommand);
  return (
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
              strokeWidth={getRelativeSize(0.5)}
              strokeDasharray={`${getRelativeSize(2)} ${getRelativeSize(1)}`}
            />
          ) : (
            <Line
              y1={activeLine.offset}
              y2={activeLine.offset}
              x1={min}
              x2={max}
              strokeWidth={getRelativeSize(0.5)}
              strokeDasharray={`${getRelativeSize(2)} ${getRelativeSize(1)}`}
            />
          )}
        </motion.g>
      )}
    </AnimatePresence>
  );
};
