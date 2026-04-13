import { Trash2, Users } from "@galacticcouncil/ui/assets/icons"
import {
  AccountInput,
  Alert,
  Box,
  Button,
  CopyButton,
  Flex,
  FormError,
  FormLabel,
  Icon,
  Input,
  Separator,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { shortenAccountAddress } from "@galacticcouncil/utils"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { SAccountOption } from "@/components/account/AccountOption.styled"
import { MultisigConfig, useMultisigStore } from "@/hooks/useMultisigStore"
import {
  deriveMultisigAddress,
  deriveMultisigAddressPolkadot,
  isValidAddress,
  toPolkadotAddress,
} from "@/utils/multisig"

type SignerInputState = {
  value: string
  error?: string
}

type Props = {
  onContinue: () => void
}

const MIN_SIGNERS = 2
const MAX_NAME_LENGTH = 32

export const MultisigSetup: React.FC<Props> = ({ onContinue }) => {
  const { t } = useTranslation()
  const { configs, add, remove, setActive, activeConfigId } = useMultisigStore()

  const [signers, setSigners] = useState<SignerInputState[]>([
    { value: "" },
    { value: "" },
  ])
  const [threshold, setThreshold] = useState(2)
  const [name, setName] = useState("")

  const validSigners = useMemo(
    () => signers.map((s) => s.value).filter((v) => v && isValidAddress(v)),
    [signers],
  )

  const derivedAddress = useMemo(() => {
    if (validSigners.length < MIN_SIGNERS) return ""
    return deriveMultisigAddress(validSigners, threshold)
  }, [validSigners, threshold])

  const derivedAddressPolkadot = useMemo(() => {
    if (validSigners.length < MIN_SIGNERS) return ""
    return deriveMultisigAddressPolkadot(validSigners, threshold)
  }, [validSigners, threshold])

  // Clamp threshold when signer count changes
  useEffect(() => {
    if (validSigners.length >= MIN_SIGNERS) {
      setThreshold((prev) => Math.min(prev, validSigners.length))
    }
  }, [validSigners.length])

  const validateSigner = useCallback(
    (value: string, index: number): string | undefined => {
      if (!value) return undefined
      if (!isValidAddress(value)) return t("multisig.setup.error.invalid")
      const others = signers
        .map((s, i) => (i !== index ? s.value : ""))
        .filter(Boolean)
      if (others.includes(value)) return t("multisig.setup.error.duplicate")
      return undefined
    },
    [signers, t],
  )

  const handleSignerChange = (index: number, raw: string) => {
    const value = isValidAddress(raw) ? toPolkadotAddress(raw) : raw
    setSigners((prev) =>
      prev.map((s, i) => (i === index ? { value, error: undefined } : s)),
    )
  }

  const handleSignerBlur = (index: number) => {
    setSigners((prev) =>
      prev.map((s, i) =>
        i === index ? { ...s, error: validateSigner(s.value, index) } : s,
      ),
    )
  }

  const handleAddSigner = () => {
    setSigners((prev) => [...prev, { value: "" }])
  }

  const handleRemoveSigner = (index: number) => {
    if (signers.length <= MIN_SIGNERS) return
    setSigners((prev) => prev.filter((_, i) => i !== index))
  }

  const hasErrors = signers.some((s) => !!s.error)
  const canSave =
    validSigners.length >= MIN_SIGNERS && !hasErrors && !!derivedAddress

  const handleSave = () => {
    if (!canSave) return

    const config: Omit<MultisigConfig, "id"> = {
      name: name.slice(0, MAX_NAME_LENGTH),
      signers: validSigners,
      threshold,
      address: derivedAddress,
    }

    add(config)
    // setActive is called in add — we need the new ID
    // The new config will be at the end of configs
    const newId = useMultisigStore.getState().configs.at(-1)?.id
    if (newId) {
      setActive(newId, null)
    }

    onContinue()
  }

  const handleUseConfig = (config: MultisigConfig) => {
    setActive(config.id, null)
    onContinue()
  }

  return (
    <Stack gap="var(--modal-content-padding)">
      {/* Signers */}
      <Stack gap="m">
        <FormLabel>{t("multisig.setup.signersLabel")}</FormLabel>
        {signers.map((signer, index) => (
          <Stack gap="s" key={index}>
            <Flex gap="s" align="flex-start">
              <AccountInput
                value={signer.value}
                onChange={(value) => handleSignerChange(index, value)}
                onBlur={() => handleSignerBlur(index)}
                placeholder={t("multisig.setup.signerPlaceholder")}
                isError={!!signer.error}
                sx={{ flex: 1 }}
              />
              {signers.length > MIN_SIGNERS && (
                <Button
                  variant="muted"
                  outline
                  size="small"
                  sx={{ mt: "xs", flexShrink: 0 }}
                  onClick={() => handleRemoveSigner(index)}
                  type="button"
                >
                  <Icon size="s" component={Trash2} />
                </Button>
              )}
            </Flex>
            {signer.error && <FormError>{signer.error}</FormError>}
          </Stack>
        ))}
        <Button
          variant="muted"
          outline
          size="small"
          onClick={handleAddSigner}
          type="button"
          sx={{ alignSelf: "flex-start" }}
        >
          {t("multisig.setup.addSigner")}
        </Button>
      </Stack>

      <Separator mx="var(--modal-content-inset)" />

      {/* Threshold */}
      <Stack gap="m">
        <FormLabel>{t("multisig.setup.thresholdLabel")}</FormLabel>
        <Flex gap="m" align="center">
          <Input
            type="number"
            value={threshold}
            min={1}
            max={Math.max(validSigners.length, MIN_SIGNERS)}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10)
              if (!isNaN(val)) {
                setThreshold(
                  Math.max(
                    1,
                    Math.min(val, validSigners.length || MIN_SIGNERS),
                  ),
                )
              }
            }}
            sx={{ width: 80 }}
          />
          <Text fs="p4" color={getToken("text.medium")}>
            {t("multisig.setup.thresholdSuffix", {
              count: validSigners.length || 0,
            })}
          </Text>
        </Flex>
        {threshold === 1 && (
          <Alert
            variant="warning"
            description={t("multisig.setup.warning.threshold1")}
          />
        )}
      </Stack>

      <Separator mx="var(--modal-content-inset)" />

      {/* Name */}
      <Stack gap="m">
        <FormLabel>{t("multisig.setup.nameLabel")}</FormLabel>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, MAX_NAME_LENGTH))}
          placeholder={t("multisig.setup.namePlaceholder")}
        />
      </Stack>

      {/* Derived address */}
      {derivedAddress && (
        <>
          <Separator mx="var(--modal-content-inset)" />
          <Stack gap="m">
            <FormLabel>{t("multisig.setup.derivedAddressLabel")}</FormLabel>
            <Stack gap="s">
              <Flex
                align="center"
                justify="space-between"
                gap="s"
                sx={{
                  p: "m",
                  borderRadius: "m",
                  border: "1px solid",
                  borderColor: "details.borders",
                  bg: "surfaces.containers.dim.dimOnBg",
                }}
              >
                <Stack gap="xs" sx={{ minWidth: 0, flex: 1 }}>
                  <Text fs="p6" color={getToken("text.medium")}>
                    Polkadot
                  </Text>
                  <Text
                    fs="p5"
                    color={getToken("text.high")}
                    sx={{ wordBreak: "break-all" }}
                  >
                    {derivedAddressPolkadot}
                  </Text>
                </Stack>
                <CopyButton text={derivedAddressPolkadot} />
              </Flex>
              <Flex
                align="center"
                justify="space-between"
                gap="s"
                sx={{
                  p: "m",
                  borderRadius: "m",
                  border: "1px solid",
                  borderColor: "details.borders",
                  bg: "surfaces.containers.dim.dimOnBg",
                }}
              >
                <Stack gap="xs" sx={{ minWidth: 0, flex: 1 }}>
                  <Text fs="p6" color={getToken("text.medium")}>
                    Hydration
                  </Text>
                  <Text
                    fs="p5"
                    color={getToken("text.high")}
                    sx={{ wordBreak: "break-all" }}
                  >
                    {derivedAddress}
                  </Text>
                </Stack>
                <CopyButton text={derivedAddress} />
              </Flex>
            </Stack>
          </Stack>
        </>
      )}

      <Separator mx="var(--modal-content-inset)" />

      <Button
        size="large"
        width="100%"
        disabled={!canSave}
        onClick={handleSave}
        type="button"
      >
        {t("multisig.setup.cta")}
      </Button>

      {/* Saved multisigs */}
      {configs.length > 0 && (
        <>
          <Separator mx="var(--modal-content-inset)" />
          <Stack gap="m">
            <Text fs="p4" color={getToken("text.medium")}>
              {t("multisig.setup.savedLabel")}
            </Text>
            {configs.map((config) => (
              <SAccountOption
                key={config.id}
                data-active={activeConfigId === config.id}
                onClick={() => handleUseConfig(config)}
              >
                <Flex align="center" gap="m">
                  <Box sx={{ flexShrink: 0 }}>
                    <Icon
                      size="m"
                      component={Users}
                      color={getToken("text.medium")}
                    />
                  </Box>
                  <Flex direction="column" width="100%" sx={{ minWidth: 0 }}>
                    <Flex align="center" justify="space-between">
                      <Text fs="p3" truncate={200}>
                        {config.name || t("multisig.title")} ({config.threshold}
                        /{config.signers.length})
                      </Text>
                      <Icon
                        size="s"
                        component={Trash2}
                        color={getToken("text.medium")}
                        sx={{ flexShrink: 0, ml: "s" }}
                        onClick={(e) => {
                          e.stopPropagation()
                          remove(config.id)
                        }}
                      />
                    </Flex>
                    <Text
                      fs="p4"
                      color={getToken("text.medium")}
                      truncate={200}
                    >
                      {shortenAccountAddress(config.address)}
                    </Text>
                  </Flex>
                </Flex>
              </SAccountOption>
            ))}
          </Stack>
        </>
      )}
    </Stack>
  )
}
