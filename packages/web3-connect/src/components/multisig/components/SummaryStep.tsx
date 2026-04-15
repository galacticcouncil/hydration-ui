import {
  AccountAvatar,
  Button,
  Flex,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { safeConvertAddressSS58 } from "@galacticcouncil/utils"
import { useTranslation } from "react-i18next"

import { AccountIdentity } from "@/components/account/AccountIdentity"
import { MultisigAccount } from "@/components/multisig/components/MultisigAccount"
import { useWeb3ConnectContext } from "@/context/Web3ConnectContext"

type SummaryStepProps = {
  name: string
  derivedAddress: string
  signers: string[]
  threshold: number
  signerCount: number
  isValid: boolean
  onSave: () => void
}

export const SummaryStep: React.FC<SummaryStepProps> = ({
  name,
  derivedAddress,
  signers,
  threshold,
  isValid,
  onSave,
}) => {
  const { papi } = useWeb3ConnectContext()
  const { t } = useTranslation()

  return (
    <Stack gap="m" p="xl" pt={0}>
      <Stack gap="xs">
        <Text fs="p4" color={getToken("text.medium")}>
          {t("multisig.setup.derivedAddressLabel")}
        </Text>
        <MultisigAccount
          config={{
            address: derivedAddress,
            name,
            threshold,
            signers,
          }}
        />
      </Stack>
      <Stack gap="xs">
        <Text fs="p4" color={getToken("text.medium")}>
          {t("multisig.setup.signatories")}
        </Text>
        <Flex gap="s" wrap>
          {signers.map((signer) => {
            const signerAddress = safeConvertAddressSS58(signer)
            return (
              <Flex
                key={signer}
                align="center"
                gap="s"
                py="xs"
                px="m"
                borderRadius="base"
                bg={getToken("surfaces.containers.dim.dimOnHigh")}
                minWidth={0}
              >
                <AccountAvatar
                  address={signerAddress}
                  size={24}
                  sx={{ flexShrink: 0, ml: "-base" }}
                />
                <AccountIdentity
                  papi={papi}
                  truncate="4xl"
                  fs="p5"
                  color={getToken("text.medium")}
                  address={signerAddress}
                />
              </Flex>
            )
          })}
        </Flex>
      </Stack>

      <Button
        variant="primary"
        size="large"
        width="100%"
        disabled={!isValid}
        onClick={onSave}
        type="button"
        sx={{ mt: "s" }}
      >
        {t("multisig.setup.cta")}
      </Button>
    </Stack>
  )
}
