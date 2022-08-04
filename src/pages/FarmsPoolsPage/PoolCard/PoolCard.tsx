import { FC, useState } from "react";
import { ActionButtons } from "./ActionButtons/ActionButtons";
import { FarmingIncentives } from "./FarmingIncentives/FarmingIncentives";
import { CardWrapper } from "./PoolCard.styled";
import { PoolDetails } from "./PoolDetails/PoolDetails";

type PoolCardProps = {
  hasJoinedFarms: boolean;
};

export const PoolCard: FC<PoolCardProps> = ({ hasJoinedFarms }) => {
  const [openCard, setOpenCard] = useState(false);
  console.log("open");

  return (
    <CardWrapper onClick={() => setOpenCard((prev) => !prev)}>
      <PoolDetails />
      <FarmingIncentives />
      <ActionButtons
        hasJoinedFarms={hasJoinedFarms}
        closeCard={() => setOpenCard(false)}
      />
    </CardWrapper>
  );
};
