import { Link } from "components/Link";
import { FC, ReactNode } from "react";
import { StyledButton } from "./styled";

export type ButtonProps = {
  variant?: "primary";
  disabled?: boolean;
  text?: string;
  to?: string;
  type?: "button" | "submit" | "reset";
  icon?: SVGElement;
  children?: ReactNode;
  onClick?: () => void;
  size?: "small" | "medium";
};

export const Button: FC<ButtonProps> = ({
  type = "button",
  variant = "primary",
  size = "medium",
  ...props
}) => {
  const element = (
    <StyledButton {...props} type={type} variant={variant} size={size}>
      {props.text || props.children}
    </StyledButton>
  );
  if (props.to) return <Link to={props.to}>{element}</Link>;
  return element;
};
