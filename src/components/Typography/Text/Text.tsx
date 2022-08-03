import { FC } from "react";
import { StyledText } from "./Text.styled";

export type TextProps = {
  children?: string;
  text?: string;
  weight?: number;
  fs?: number;
};

export const Text: FC<TextProps> = ({ children, text, ...rest }) => (
  <StyledText {...rest}>{text || children}</StyledText>
);
