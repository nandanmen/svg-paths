"use client";

import React from "react";
import { Line } from "./shared";

export type SvgProps = {
  size: number;
  gap: number;
  padding: number;
  onSizeChange: (size: number) => void;
  children: React.ReactNode;
};

export type IViewBoxContext = {
  size: number;
  min: number;
  max: number;
  setSize: (size: number) => void;
  getRelativeSize: (size: number) => number;
};

const ViewBoxContext = React.createContext<IViewBoxContext | null>(null);

export const useViewBoxContext = () => {
  const context = React.useContext(ViewBoxContext);
  if (!context) {
    throw new Error("useViewBoxContext must be used within a ViewBoxContext");
  }
  return context;
};

export function Svg({ size, gap, padding, onSizeChange, children }: SvgProps) {
  const getRelativeSize = React.useCallback(
    (value: number) => {
      return (value / 100) * size;
    },
    [size]
  );

  const _padding = getRelativeSize(padding);
  const viewBox = `-${_padding} -${_padding} ${size + _padding * 2} ${
    size + _padding * 2
  }`;
  const max = size + _padding * 2;
  const min = -_padding;
  return (
    <ViewBoxContext.Provider
      value={{ size, min, max, setSize: onSizeChange, getRelativeSize }}
    >
      <svg viewBox={viewBox} width="100%" height="100%">
        <GridSquare gap={gap} />
        {children}
      </svg>
    </ViewBoxContext.Provider>
  );
}

const range = (start: number, end: number, step = 1) => {
  const result = [];
  for (let i = start; i <= end; i += step) {
    result.push(i);
  }
  return result;
};

type GridSquareProps = {
  gap: number;
};

const GridSquare = ({ gap }: GridSquareProps) => {
  const { size, min, max, getRelativeSize } = useViewBoxContext();
  const cols = range(0, size, gap);
  const rows = range(0, size, gap);
  return (
    <g className="text-slate-6">
      {cols.map((x) => {
        return (
          <Line
            key={x}
            x1={x}
            x2={x}
            y1={min}
            y2={max}
            strokeWidth={getRelativeSize(0.2)}
          />
        );
      })}
      {rows.map((y) => {
        return (
          <Line
            key={y}
            x1={min}
            x2={max}
            y1={y}
            y2={y}
            strokeWidth={getRelativeSize(0.2)}
          />
        );
      })}
    </g>
  );
};
