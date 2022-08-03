import { FC } from "react";
import { StyledSwitch, StyledThumb } from "./Switch.styled";

type SwitchProps = {
  value: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
};

export const Switch: FC<SwitchProps> = ({
  value,
  onCheckedChange,
  disabled,
}) => (
  <StyledSwitch
    checked={value}
    onCheckedChange={onCheckedChange}
    disabled={disabled}
  >
    <StyledThumb checked={value} disabled={disabled} />
  </StyledSwitch>
);
