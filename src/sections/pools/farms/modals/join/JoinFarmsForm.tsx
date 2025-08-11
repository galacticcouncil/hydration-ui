import { Controller, useForm } from "react-hook-form"
import { scaleHuman } from "utils/balance"
import { SJoinFarmContainer } from "./JoinFarmsModal.styled"
import { useTranslation } from "react-i18next"
import { zodResolver } from "@hookform/resolvers/zod"
import { useZodSchema } from "./JoinFarmsModal.utils"
import { FormValues } from "utils/helpers"
import { Text } from "components/Typography/Text/Text"
import { Spacer } from "components/Spacer/Spacer"
import { WalletTransferAssetSelect } from "sections/wallet/transfer/WalletTransferAssetSelect"
import { Alert } from "components/Alert/Alert"
import { Button } from "components/Button/Button"
import { TFarmAprData } from "api/farms"
import { TLPData } from "utils/omnipool"
import { TJoinFarmsInput } from "utils/farms/deposit"
import { scale } from "utils/balance"
import { TDeposit } from "api/deposits"
import { usePoolData } from "sections/pools/pool/Pool"
import { isXYKPoolType } from "sections/pools/PoolsPage.utils"
import { BN_0 } from "utils/constants"

type FormProps = {
  position?: TLPData
  farms: TFarmAprData[]
  depositNft?: TDeposit
  onSubmit: (input: TJoinFarmsInput) => void
}

export const JoinFarmsForm = ({
  position,
  farms,
  depositNft,
  onSubmit,
}: FormProps) => {
  const { t } = useTranslation()
  const { pool } = usePoolData()

  const meta = pool.meta
  const isXYK = meta.isShareToken
  const shouldValidate =
    !!position?.amount || (meta.isShareToken && !depositNft)

  const zodSchema = useZodSchema({
    id: meta.id,
    farms,
    xykProps: isXYKPoolType(pool)
      ? {
          poolAddress: pool.poolAddress,
        }
      : undefined,
    position,
    enabled: shouldValidate,
  })

  const form = useForm<{ amount: string }>({
    mode: "onChange",
    defaultValues: {
      amount: position
        ? scaleHuman(position.shares, meta.decimals).toString()
        : undefined,
    },
    resolver: zodSchema ? zodResolver(zodSchema) : undefined,
  })

  const positionValue =
    position?.totalValueShifted ??
    (depositNft ? scaleHuman(depositNft.data.shares, meta.decimals) : undefined)

  const handleOnSubmit = (values: FormValues<typeof form>) => {
    if (isXYK) {
      onSubmit({
        shares: depositNft
          ? depositNft.data.shares.toString()
          : scale(values.amount, meta.decimals).toString(),
        depositId: depositNft?.id,
      })
    } else if (position && positionValue) {
      onSubmit({
        positionId: position.id,
        depositId: depositNft?.id,
        value: scale(positionValue, meta.decimals).toString(),
      })
    }
  }

  const error = form.formState.errors.amount?.message

  return (
    <form onSubmit={form.handleSubmit(handleOnSubmit)} autoComplete="off">
      <SJoinFarmContainer>
        {positionValue ? (
          <div
            sx={{
              flex: ["column", "row"],
              justify: "space-between",
              p: 30,
              gap: [4, 120],
            }}
          >
            <div sx={{ flex: "column", gap: 13 }}>
              <Text>{t("farms.modal.footer.title")}</Text>
            </div>
            <Text color="pink600" fs={20} css={{ whiteSpace: "nowrap" }}>
              {t("value.tokenWithSymbol", {
                value: positionValue,
                symbol: meta.symbol,
              })}
            </Text>
          </div>
        ) : (
          <>
            <Spacer size={20} />
            <Controller
              name="amount"
              control={form.control}
              render={({
                field: { name, value, onChange },
                fieldState: { error },
              }) => (
                <WalletTransferAssetSelect
                  title={t("wallet.assets.transfer.asset.label_mob")}
                  name={name}
                  value={value}
                  onChange={onChange}
                  asset={pool.id}
                  error={error?.message}
                />
              )}
            />
            <Spacer size={20} />
          </>
        )}

        {error && position && (
          <Alert variant="error" css={{ margin: "20px 0" }}>
            {error}
          </Alert>
        )}

        <Button
          fullWidth
          variant="primary"
          disabled={shouldValidate ? !!error || !zodSchema : false}
        >
          {t("farms.modal.join.button.label", {
            count: farms.length,
          })}
        </Button>
      </SJoinFarmContainer>
    </form>
  )
}
