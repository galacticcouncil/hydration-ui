import { FC } from "react";
import { CardWrapper } from "./PoolCard.styled";
import { PoolDetails } from "./PoolDetails/PoolDetails";

type PoolCardProps = {};

export const PoolCard: FC<PoolCardProps> = () => {
  return (
    <CardWrapper>
      <PoolDetails />
    </CardWrapper>
  );
};
