import { ColorProps, FontProps, MarginProps } from "common/styles";
import { FC } from "react";
import { StyledText } from "./Text.styled";

export type TextProps = {
  children?: string;
  text?: string;
} & ColorProps &
  MarginProps &
  FontProps;

export const Text: FC<TextProps> = ({ children, text, fw = 500, ...rest }) => (
  <StyledText {...rest} fw={fw}>
    {text || children}
  </StyledText>
);
