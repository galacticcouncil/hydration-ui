import CrossIcon from "assets/icons/CrossIcon.svg?react"
import { SContainer } from "./ReferralCode.styled"
import { IconButton } from "components/IconButton/IconButton"
import { Text } from "components/Typography/Text/Text"
import { useWeb3ConnectStore } from "sections/web3-connect/store/useWeb3ConnectStore"

export const ReferralCode = ({ code }: { code: string }) => {
  const onCancel = () => useWeb3ConnectStore.getState().setReferralCode("")

  return (
    <div sx={{ flex: "column", align: "end" }}>
      <SContainer>
        <Text color="white" fs={13}>
          {code}
        </Text>
        <IconButton
          icon={<CrossIcon sx={{ width: 12, height: 12 }} />}
          onClick={onCancel}
          size={18}
          sx={{ color: "white" }}
        />
      </SContainer>
    </div>
  )
}
