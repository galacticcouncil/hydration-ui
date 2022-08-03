import { FC } from "react";
import { StyledH1 } from "./Heading.styled";

type variant = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
export type HeadingProps = {
  as: variant;
  children?: string;
  text?: string;
  weight?: number;
  fs?: number;
};

export const Heading: FC<HeadingProps> = ({
  children,
  text,
  as = "h1",
  ...rest
}) => (
  <StyledH1 as={as} {...rest}>
    {text || children}
  </StyledH1>
);
