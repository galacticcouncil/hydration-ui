import CrossIcon from "assets/icons/CrossIcon.svg?react"
import { SContainer } from "./ReferralCode.styled"
import { IconButton } from "components/IconButton/IconButton"
import { Text } from "components/Typography/Text/Text"
import { useReferralCodesStore } from "sections/referrals/store/useReferralCodesStore"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"

export const ReferralCode = ({ code }: { code: string }) => {
  const { account } = useAccount()
  const { setReferralCode } = useReferralCodesStore()

  const onCancel = () => {
    account && setReferralCode(undefined, account.address)
  }

  return (
    <div sx={{ flex: "column", align: "end" }}>
      <SContainer>
        <Text color="white" fs={13} lh={13}>
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
