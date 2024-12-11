import { css } from "@emotion/react"
import CopyIcon from "assets/icons/CopyIcon.svg?react"
import { AccountAvatar } from "components/AccountAvatar/AccountAvatar"
import { Text } from "components/Typography/Text/Text"
import { useCopyToClipboard, useMedia } from "react-use"
import { safeConvertAddressSS58, shortenAccountAddress } from "utils/formatting"
import { theme as themeParams } from "theme"
import { WalletProviderType } from "sections/web3-connect/constants/providers"
import BigNumber from "bignumber.js"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { BN_BILL } from "utils/constants"
import { getWalletProviderByType } from "sections/web3-connect/Web3Connect.utils"
import { isEvmAddress } from "utils/evm"
import { Badge } from "components/Badge/Badge"
import * as Tooltip from "@radix-ui/react-tooltip"
import {
  SCopyDropdownContent,
  SCopyDropdownItem,
} from "sections/web3-connect/accounts/Web3ConnectAccountSelect.styled"
import { ButtonTransparent } from "components/Button/Button"
import React, { useEffect, useState } from "react"
import CheckIcon from "assets/icons/CheckIcon.svg?react"
import { Icon } from "components/Icon/Icon"
import { genesisHashToChain } from "utils/helpers"

type Props = {
  name: string
  genesisHash?: `0x${string}`
  address: string
  balance?: string
  onClick?: () => void
  provider?: WalletProviderType | null
  isProxy?: boolean
  isActive?: boolean
}

const CopyButton: React.FC<{
  address: string
  className?: string
  children?: React.ReactNode
  wrapper?: React.ElementType
}> = ({ address, children, className, wrapper }) => {
  const [copied, setCopied] = useState(false)
  const [, copyToClipboard] = useCopyToClipboard()

  useEffect(() => {
    if (!copied) return
    const id = setTimeout(() => {
      setCopied(false)
    }, 5000)

    return () => {
      clearTimeout(id)
      setCopied(false)
    }
  }, [copied])

  const Wrapper = wrapper || ButtonTransparent

  function copy(e: React.MouseEvent) {
    e.stopPropagation()
    copyToClipboard(address)
    setCopied(true)
  }

  return (
    <Wrapper className={className} onClick={copy}>
      <span>{children}</span>
      <Icon
        sx={{ ml: [50, 100], color: "brightBlue200" }}
        css={{ cursor: "pointer" }}
        size={18}
        icon={copied ? <CheckIcon sx={{ color: "green400" }} /> : <CopyIcon />}
      />
    </Wrapper>
  )
}

export const Web3ConnectAccountSelect = ({
  name,
  genesisHash,
  address,
  balance,
  onClick,
  isActive,
  provider,
}: Props) => {
  const isDesktop = useMedia(themeParams.viewport.gte.sm)
  const { wallet } = getWalletProviderByType(provider)
  const isEvm = isEvmAddress(address)

  const addressOldFormat = safeConvertAddressSS58(
    address,
    genesisHashToChain(genesisHash).prefix,
    false,
  )

  return (
    <div onClick={onClick} sx={{ flex: "row", align: "center", gap: 12 }}>
      <AccountAvatar
        address={address}
        genesisHash={genesisHash}
        provider={provider}
        size={32}
      />

      <div sx={{ flex: "column", gap: 6 }} css={{ flex: 1 }}>
        <div sx={{ flex: "row", justify: "space-between" }}>
          <div sx={{ flex: "row", align: "center", gap: 4 }}>
            {wallet && (
              <img
                loading="lazy"
                src={wallet.logo.src}
                alt={wallet.logo.alt}
                width={12}
                height={12}
              />
            )}
            <Text fs={14} color="white">
              {name}
            </Text>
            {isEvm && (
              <Badge size="small" variant="orange" rounded={false}>
                EVM
              </Badge>
            )}
          </div>
          <Text fs={14} color="graySoft">
            {balance && (
              <DisplayValue
                value={BigNumber(balance)}
                compact={BigNumber(balance).gt(BN_BILL)}
              />
            )}
          </Text>
        </div>
        <div sx={{ flex: "row", justify: "space-between" }}>
          <Text
            fs={13}
            color={isActive ? "brightBlue200" : "darkBlue200"}
            css={css`
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            `}
          >
            {isDesktop ? address : shortenAccountAddress(address, 12)}
          </Text>
          <div sx={{ mt: -4 }}>
            {isEvm ? (
              <CopyButton
                address={address}
                sx={{
                  color: isActive ? "brightBlue200" : "darkBlue200",
                }}
              />
            ) : (
              <Tooltip.Root delayDuration={0}>
                <Tooltip.Trigger asChild>
                  <ButtonTransparent onClick={(e) => e.stopPropagation()}>
                    <CopyIcon
                      width={18}
                      height={18}
                      sx={{
                        color: isActive ? "brightBlue200" : "darkBlue200",
                      }}
                    />
                  </ButtonTransparent>
                </Tooltip.Trigger>
                <SCopyDropdownContent
                  align="end"
                  side="bottom"
                  onClick={(e) => e.stopPropagation()}
                >
                  <CopyButton wrapper={SCopyDropdownItem} address={address}>
                    New Polkadot format
                  </CopyButton>
                  {addressOldFormat && (
                    <CopyButton
                      wrapper={SCopyDropdownItem}
                      address={addressOldFormat}
                    >
                      Old format (for CEXES)
                    </CopyButton>
                  )}
                </SCopyDropdownContent>
              </Tooltip.Root>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
