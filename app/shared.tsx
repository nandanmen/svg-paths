import { useViewBoxContext } from "./svg";

export const Line = (props: React.ComponentPropsWithoutRef<"line">) => {
  const { getRelativeSize } = useViewBoxContext();
  return (
    <line stroke="currentColor" strokeWidth={getRelativeSize(0.5)} {...props} />
  );
};
