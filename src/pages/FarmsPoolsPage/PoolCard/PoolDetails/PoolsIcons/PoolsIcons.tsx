import { BasiliskIcon } from "assets/icons/BasiliskIcon";
import { AssetIcon } from "components/AssetIcon/AssetIcon";
import { Box } from "components/Box/Box";
import { FC } from "react";

type PoolsIconsProps = {};

export const PoolsIcons: FC<PoolsIconsProps> = () => (
  <Box mr={12} flex>
    <AssetIcon icon={<BasiliskIcon />} />
    <AssetIcon chainedIcon={<BasiliskIcon />} />
  </Box>
);
