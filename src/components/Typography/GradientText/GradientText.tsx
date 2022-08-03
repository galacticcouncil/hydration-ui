import { FC } from "react";
import { TextProps } from "../Text/Text";
import { StyledGradientText } from "./GradientText.styled";

export const GradientText: FC<TextProps> = ({ text, children, ...props }) => (
  <StyledGradientText {...props}>{text || children}</StyledGradientText>
);
