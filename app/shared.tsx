import { motion } from "framer-motion";
import { useViewBoxContext } from "./svg";

export const Line = (props: React.ComponentPropsWithoutRef<"line">) => {
  const { getRelativeSize } = useViewBoxContext();
  return (
    <line stroke="currentColor" strokeWidth={getRelativeSize(0.5)} {...props} />
  );
};

type EndpointProps = {
  x: number;
  y: number;
  active?: boolean;
  isCursor?: boolean;
};

export const Endpoint = ({ x, y, active, isCursor }: EndpointProps) => {
  const { getRelativeSize } = useViewBoxContext();
  return (
    <motion.g style={{ x, y }}>
      <motion.circle
        cx="0"
        cy="0"
        r={getRelativeSize(2)}
        className="fill-blue-8"
        animate={{ scale: active ? 1 : 0 }}
        initial={{ scale: 0 }}
      />
      <circle
        r={getRelativeSize(1)}
        cx="0"
        cy="0"
        className={
          isCursor
            ? "fill-slate-2 stroke-slate-12"
            : "fill-slate-12 stroke-slate-12"
        }
        strokeWidth={getRelativeSize(0.5)}
      />
    </motion.g>
  );
};
