import { FC } from "react";
import { StyledSwitch, StyledThumb } from "./Switch.styled";

type SwitchProps = {
  value: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
  size?: "small" | "regular";
};

export const Switch: FC<SwitchProps> = ({
  value,
  onCheckedChange,
  disabled,
  size = "regular",
}) => {
  return (
    <StyledSwitch
      checked={value}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      size={size}
    >
      <StyledThumb checked={value} disabled={disabled} size={size} />
    </StyledSwitch>
  );
};
