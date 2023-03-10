import { css } from "@emotion/react"
import styled from "@emotion/styled"

import { useProviderRpcUrlStore } from "api/provider"
import { Button } from "components/Button/Button"
import { Modal } from "components/Modal/Modal"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { Fragment, useState } from "react"
import { theme } from "theme"

import { ReactComponent as ChevronRightIcon } from "assets/icons/ChevronRightIcon.svg"

const SCircle = styled.span`
  display: block;
  width: 16px;
  height: 16px;

  border-radius: 9999px;
  background: ${theme.colors.basic900};
  border: 1px solid rgba(${theme.rgbColors.alpha0}, 0.3);

  transition: all ${theme.transitions.default};
`

const SItem = styled.div<{ isActive?: boolean }>`
  display: grid;
  grid-template-columns: 1fr 1fr 3fr;
  grid-gap: 24px;

  padding: 14px var(--modal-body-padding-x);
  cursor: pointer;

  &:hover ${SCircle} {
    background: ${theme.colors.basic800};
  }

  ${(props) => {
    if (props.isActive) {
      return css`
        ${SCircle} {
          border-color: ${theme.colors.pink600};
        }

        &:hover ${SCircle} {
          background: ${theme.colors.basic800};
        }
      `
    }

    return null
  }}
`

const SHeader = styled(SItem)`
  background: rgba(${theme.rgbColors.primaryA06}, 0.06);
  color: ${theme.colors.basic700};

  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;

  padding: 6px var(--modal-body-padding-x);
`

const SContainer = styled.div`
  margin: 0 calc(-1 * var(--modal-body-padding-x));
  margin-top: 20px;
`

function ProviderStatus(props: { status: "online" | "offline" | "slow" }) {
  const color =
    props.status === "online"
      ? "#00FFA0"
      : props.status === "offline"
      ? "#FF4B4B"
      : props.status === "slow"
      ? "#F5A855"
      : undefined
  return (
    <Text
      fs={9}
      lh={9}
      sx={{ flex: "row", gap: 4, align: "center" }}
      css={{
        letterSpacing: "1px",
        color,
      }}
    >
      <span>214244</span>
      <span
        sx={{ width: 6, height: 6, display: "block" }}
        css={{
          background: `currentColor`,
          borderRadius: "9999px",
        }}
      />
    </Text>
  )
}

function ProviderSelectItem(props: {
  name: string
  url: string
  isActive?: boolean
  onClick: () => void
}) {
  return (
    <SItem isActive={props.isActive} onClick={props.onClick}>
      <Text
        color={props.isActive ? "pink600" : "white"}
        css={{ transition: `all ${theme.transitions.default}` }}
      >
        {props.name}
      </Text>
      <ProviderStatus status="online" />
      <div
        sx={{
          textAlign: "right",
          flex: "row",
          align: "center",
          justify: "flex-end",
          gap: 16,
        }}
      >
        <Text
          font="ChakraPetch"
          fs={14}
          fw={500}
          tAlign="right"
          color={props.isActive ? "pink600" : "basic600"}
          css={{ transition: `all ${theme.transitions.default}` }}
        >
          {props.url.replaceAll("wss://", "")}
        </Text>

        <SCircle />
      </div>
    </SItem>
  )
}

const PROVIDERS = [
  { name: "Mainnet", url: "wss://rpc.hydradx.cloud" },
  { name: "Rococo", url: "wss://hydradx-rococo-rpc.play.hydration.cloud" },
  { name: "Testnet", url: "wss://mining-rpc.hydradx.io" },
]

export function ProviderSelectModal(props: {
  open: boolean
  onClose: () => void
}) {
  const preference = useProviderRpcUrlStore()
  const [userRpcUrl, setUserRpcUrl] = useState(
    preference.rpcUrl ?? import.meta.env.VITE_PROVIDER_URL,
  )

  return (
    <Modal open={props.open} onClose={props.onClose} title="Change RPC">
      <SContainer>
        <SHeader>
          <div>Name</div>
          <div>Status</div>
          <div sx={{ textAlign: "right" }}>RPC Address</div>
        </SHeader>

        {PROVIDERS.map((provider, index) => {
          return (
            <Fragment key={provider.url}>
              <ProviderSelectItem
                name={provider.name}
                url={provider.url}
                isActive={provider.url === userRpcUrl}
                onClick={() => setUserRpcUrl(provider.url)}
              />
              {index + 1 < PROVIDERS.length && (
                <Separator color="alpha0" opacity={0.06} />
              )}
            </Fragment>
          )
        })}
      </SContainer>

      <Button
        variant="primary"
        sx={{ mt: 64 }}
        onClick={() => {
          preference.setRpcUrl(userRpcUrl)
          window.location.reload()
        }}
      >
        Save
      </Button>
    </Modal>
  )
}

const SwitchButton = styled.button`
  all: unset;

  position: fixed;
  bottom: 4px;
  right: 4px;

  color: ${theme.colors.white};

  display: flex;
  align-items: center;
  font-size: 11px;

  cursor: pointer;

  gap: 12px;
`

export function ProviderSelectButton() {
  const [open, setOpen] = useState(false)
  const store = useProviderRpcUrlStore()

  const rpcUrl = store.rpcUrl ?? import.meta.env.VITE_PROVIDER_URL
  const selectedProvider = PROVIDERS.find((provider) => provider.url === rpcUrl)
  return (
    <>
      <SwitchButton onClick={() => setOpen(true)}>
        <ProviderStatus status="online" />

        <span
          sx={{ display: "block", width: 1, height: 14, bg: "darkBlue400" }}
        />

        <span sx={{ display: "flex", align: "center" }}>
          <span>{selectedProvider?.name}</span>
          <ChevronRightIcon sx={{ color: "brightBlue300" }} />
        </span>
      </SwitchButton>
      {open && (
        <ProviderSelectModal open={open} onClose={() => setOpen(false)} />
      )}
    </>
  )
}
