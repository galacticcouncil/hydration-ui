import CopyIcon from "assets/icons/CopyIcon.svg?react"
import { Button } from "components/Button/Button"
import { Text } from "components/Typography/Text/Text"
import { useModalContext } from "sections/lending/hooks/useModal"
import { TxErrorType } from "sections/lending/ui-config/errorMapping"

export const TxErrorView = ({ txError }: { txError: TxErrorType }) => {
  const { close } = useModalContext()

  return (
    <>
      <div sx={{ flex: "column", justify: "center", align: "center" }}>
        <Text fs={20} sx={{ mt: 8 }}>
          <span>Transaction failed</span>
        </Text>

        <Button
          onClick={() =>
            navigator.clipboard.writeText(txError.rawError.message.toString())
          }
          sx={{ mt: 24 }}
        >
          <span>Copy error text</span>
          <CopyIcon />
        </Button>
      </div>
      <div sx={{ flex: "column", mt: 16 }}>
        <Button onClick={close}>
          <span>Close</span>
        </Button>
      </div>
    </>
  )
}
