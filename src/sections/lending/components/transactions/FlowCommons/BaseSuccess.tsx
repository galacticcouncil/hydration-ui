import { ReactNode } from "react"
import { useModalContext } from "sections/lending/hooks/useModal"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import LinkIcon from "assets/icons/LinkIcon.svg?react"
import { Button } from "components/Button/Button"
import { Text } from "components/Typography/Text/Text"

export type BaseSuccessTxViewProps = {
  txHash?: string
  children: ReactNode
}

export const BaseSuccessView = ({
  txHash,
  children,
}: BaseSuccessTxViewProps) => {
  const { close, mainTxState } = useModalContext()
  const { currentNetworkConfig } = useProtocolDataContext()

  return (
    <>
      <div
        sx={{
          flex: "column",
          justify: "center",
          align: "center",
        }}
      >
        <Text fs={20} sx={{ mt: 12 }}>
          <span>All done!</span>
        </Text>

        {children}
      </div>

      <div sx={{ flex: "column" }}>
        <a
          href={currentNetworkConfig.explorerLinkBuilder({
            tx: txHash ? txHash : mainTxState.txHash,
          })}
          sx={{ flex: "row" }}
          target="_blank"
          rel="noreferrer noopener"
        >
          <span>Review tx details</span>
          <LinkIcon width={20} height={20} />
        </a>
        <Button onClick={close}>
          <span>Ok, Close</span>
        </Button>
      </div>
    </>
  )
}
