import {
  AccountInput,
  Button,
  Flex,
  FormError,
  FormLabel,
  ModalBody,
  ModalContentDivider,
  ModalHeader,
  Separator,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { stringEquals } from "@galacticcouncil/utils"
import {
  AddressBookButton,
  AddressBookModal,
  addressToPublicKey,
  getWalletModeByAddress,
  useAccount,
} from "@galacticcouncil/web3-connect"
import { FC, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import { TrackedWalletEntry } from "@/modules/wallet/assets/Portfolio/TrackedWalletEntry"
import {
  useTrackedWalletActions,
  useTrackedWallets,
} from "@/states/trackedWallets"

export const MAX_TRACKED_WALLETS = 5

type Error = "invalid" | "own" | "duplicate" | "limit"

export const ManageTrackedWalletsModal: FC = () => {
  const { t } = useTranslation(["wallet", "common"])
  const { account } = useAccount()

  const wallets = useTrackedWallets()
  const { add, remove } = useTrackedWalletActions()

  const addressInputRef = useRef<HTMLInputElement | null>(null)
  const [isAddressBookOpen, setIsAddressBookOpen] = useState(false)
  const [address, setAddress] = useState("")
  const [error, setError] = useState<Error | null>(null)

  const accountPublicKey = account ? addressToPublicKey(account.address) : ""

  const validate = (value: string): Error | null => {
    const publicKey = addressToPublicKey(value)

    if (!publicKey || !getWalletModeByAddress(value)) return "invalid"
    if (stringEquals(publicKey, accountPublicKey)) return "own"
    if (wallets.some((wallet) => stringEquals(wallet.publicKey, publicKey)))
      return "duplicate"
    if (wallets.length >= MAX_TRACKED_WALLETS) return "limit"

    return null
  }

  const save = (value: string): boolean => {
    const nextError = validate(value)
    setError(nextError)

    if (nextError) return false

    add(value)
    setAddress("")
    return true
  }

  if (isAddressBookOpen) {
    return (
      <AddressBookModal
        excludePublicKeys={accountPublicKey ? [accountPublicKey] : []}
        onBack={() => setIsAddressBookOpen(false)}
        onSelect={(selected) => {
          setAddress(selected.address)
          setError(null)
          setIsAddressBookOpen(false)
        }}
      />
    )
  }

  return (
    <>
      <ModalHeader align="center" title={t("myAssets.tracked.modal.title")} />
      <ModalBody scrollable={false}>
        <Stack>
          <Flex justify="space-between" align="center">
            <FormLabel>{t("myAssets.tracked.modal.addressLabel")}</FormLabel>
            <AddressBookButton onClick={() => setIsAddressBookOpen(true)} />
          </Flex>
          <AccountInput
            ref={addressInputRef}
            value={address}
            isError={!!error}
            placeholder={t("myAssets.tracked.modal.placeholder")}
            onChange={(value) => {
              setAddress(value)
              setError(null)
            }}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return
              save(address)
            }}
          />
          {error && (
            <FormError>
              {t(`myAssets.tracked.manage.error.${error}`, {
                max: MAX_TRACKED_WALLETS,
              })}
            </FormError>
          )}
          <ModalContentDivider my="xl" />
          <Button
            disabled={!address}
            size="large"
            onClick={() => save(address)}
            width="100%"
          >
            {t("myAssets.tracked.manage.save")}
          </Button>
        </Stack>
      </ModalBody>
      {wallets.length > 0 && (
        <ModalBody noPadding>
          <Flex direction="column" gap="base" sx={{ flexShrink: 0 }}>
            <Text fs="p5" fw={500} color="text.high" px="xl" pt="xl">
              {t("myAssets.tracked.title")}
            </Text>

            <Separator />

            <Stack separated>
              {wallets.map((wallet) => (
                <TrackedWalletEntry
                  key={wallet.publicKey}
                  address={wallet.address}
                  onRemove={() => remove(wallet.publicKey)}
                />
              ))}
            </Stack>
          </Flex>
        </ModalBody>
      )}
    </>
  )
}
