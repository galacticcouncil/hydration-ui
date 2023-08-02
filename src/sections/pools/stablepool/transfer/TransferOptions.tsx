import { ReactComponent as WaterRippleIcon } from "assets/icons/WaterRippleIcon.svg"
import { ReactComponent as DropletIcon } from "assets/icons/DropletIcon.svg"
import { TransferOption } from "./TransferOption"
import { ListItem } from "./ListItem"

export const TransferOptions = () => (
  <>
    <TransferOption
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
    </TransferOption>
    <TransferOption
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
    </TransferOption>
  </>
)
