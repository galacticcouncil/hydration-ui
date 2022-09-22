import { ReactComponent as BasiliskLogo } from "./icons/BasiliskLogo.svg"
import { ReactComponent as BasiliskIcon } from "./icons/BasiliskIcon.svg"

import { ReactComponent as ChevronRight } from "./icons/ChevronRight.svg"
import { ReactComponent as ChevronDown } from "./icons/ChevronDown.svg"

import { ReactComponent as CrossIcon } from "./icons/CrossIcon.svg"

import { ReactComponent as DownloadIcon } from "./icons/DownloadIcon.svg"
import { ReactComponent as LinkIcon } from "./icons/LinkIcon.svg"
import { ReactComponent as FlagIcon } from "./icons/FlagIcon.svg"
import { ReactComponent as FarmIcon } from "./icons/FarmIcon.svg"
import { ReactComponent as PolkadotLogo } from "./icons/PolkadotLogo.svg"
import { ReactComponent as TalismanLogo } from "./icons/TalismanLogo.svg"
import { ReactComponent as MinusIcon } from "./icons/MinusIcon.svg"
import { ReactComponent as PlusIcon } from "./icons/PlusIcon.svg"
import { ReactComponent as WindMillIcon } from "./icons/WindMillIcon.svg"

import { ReactComponent as FailIcon } from "./icons/FailIcon.svg"
import { ReactComponent as SuccessIcon } from "./icons/SuccessIcon.svg"

export default {
  title: "assets/icons",
}

export const Icons = () => (
  <div>
    <div>
      <BasiliskIcon />
      <BasiliskLogo />
    </div>

    <div>
      <ChevronRight />
      <ChevronDown />
      <CrossIcon />
      <DownloadIcon />
      <LinkIcon />
      <FlagIcon />
      <FarmIcon />
      <MinusIcon />
      <PlusIcon />
      <WindMillIcon />
    </div>

    <div>
      <PolkadotLogo />
      <TalismanLogo />
    </div>

    <div>
      <FailIcon />
      <SuccessIcon />
    </div>
  </div>
)
