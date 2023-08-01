import { GradientText } from "components/Typography/GradientText/GradientText"
import { ReactComponent as WaterRippleIcon } from "assets/icons/WaterRippleIcon.svg"
import { ReactComponent as DropletIcon } from "assets/icons/DropletIcon.svg"
import { AddLiquidityBlock } from "./AddLiquidityBlock"
import { ListItem } from './ListItem'

export const AddLiquidity = () => (
  <>
    <GradientText fs={24} lh={31} sx={{ mb: 10, ml: 10 }}>
      Add liquidity
    </GradientText>
    <AddLiquidityBlock
      selected={true}
      heading="Add to omnipool"
      subheading="Benefits"
      icon={<WaterRippleIcon />}
    >
      <ListItem>
        First benefit mentioned here. A line of of text would be enough.
      </ListItem>
      <ListItem>
        Second benefit mentioned here. A line of of text would be enough.
      </ListItem>
      <ListItem>
        Third benefit mentioned here. A line of of text would be enough.
      </ListItem>
      <ListItem>Fourth benefit mentioned here.</ListItem>
    </AddLiquidityBlock>
    <AddLiquidityBlock
      selected={false}
      heading="Add to stablepool"
      subheading="Benefits"
      icon={<DropletIcon />}
    >
      <ListItem>
        First benefit mentioned here. A line of of text would be enough.
      </ListItem>
      <ListItem>
        Second benefit mentioned here. A line of of text would be enough.
      </ListItem>
      <ListItem>
        Third benefit mentioned here. A line of of text would be enough.
      </ListItem>
      <ListItem>Fourth benefit mentioned here.</ListItem>
    </AddLiquidityBlock>
  </>
)
