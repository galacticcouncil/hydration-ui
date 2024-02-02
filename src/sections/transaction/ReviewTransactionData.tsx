import { XCall } from "@galacticcouncil/xcm-sdk"
import { SubmittableExtrinsic } from "@polkadot/api/promise/types"
import ChevronDown from "assets/icons/ChevronDown.svg?react"
import ChevronDownSmallIcon from "assets/icons/ChevronDownSmall.svg?react"
import { Separator } from "components/Separator/Separator"
import { TransactionCode } from "components/TransactionCode/TransactionCode"
import { utils } from "ethers"
import { FC, Fragment, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useMeasure } from "react-use"
import {
  hexDataSlice,
  splitHexByZeroes,
  decodedResultToJson,
} from "sections/transaction/ReviewTransactionData.utils"
import { isEvmAccount, isEvmAddress } from "utils/evm"
import { getTransactionJSON } from "./ReviewTransaction.utils"
import {
  SContainer,
  SExpandButton,
  SRawCallData,
  SShowMoreButton,
} from "./ReviewTransactionData.styled"
import { TransactionRequest } from "@ethersproject/providers"

const MAX_DECODED_HEIGHT = 130

type Props = {
  address?: string
  tx?: SubmittableExtrinsic
  evmTx?: TransactionRequest
  xcall?: XCall
}

const ExtrinsicData: FC<Pick<Props, "tx">> = ({ tx }) => {
  if (!tx) return null
  const json = getTransactionJSON(tx)
  if (!json) return null
  return <TransactionCode name={json.method} src={json.args} />
}

const EvmExtrinsicData: FC<Pick<Props, "tx">> = ({ tx }) => {
  const { t } = useTranslation()

  const [ref, { height }] = useMeasure<HTMLDivElement>()

  const [encodedExpanded, setEncodedExpanded] = useState(true)
  const [decodedExpanded, setDecodedExpanded] = useState(true)

  const [decodedFullyExpanded, setDecodedFullyExpanded] = useState(false)

  const allowDecodedFullExpand =
    !decodedFullyExpanded && height > MAX_DECODED_HEIGHT

  if (!tx) return null

  const json = getTransactionJSON(tx)

  if (!json) return null

  return (
    <SContainer>
      <div>
        <SExpandButton
          onClick={() => setDecodedExpanded((prev) => !prev)}
          expanded={decodedExpanded}
        >
          <ChevronDownSmallIcon />
          {t("liquidity.reviewTransaction.calldata.decoded")}
        </SExpandButton>
        {decodedExpanded && (
          <div
            sx={{
              mt: 10,
              pl: 16,
            }}
            css={{
              position: "relative",
              height: allowDecodedFullExpand ? MAX_DECODED_HEIGHT : "auto",
              overflow: "hidden",
            }}
          >
            <TransactionCode ref={ref} name={json.method} src={json.args} />
            {allowDecodedFullExpand && (
              <SShowMoreButton
                onClick={() => setDecodedFullyExpanded(true)}
                css={{
                  position: "absolute",
                  bottom: 0,
                }}
              >
                Show more <ChevronDown width={16} height={16} />
              </SShowMoreButton>
            )}
          </div>
        )}
      </div>
      <Separator sx={{ my: 12 }} />
      <div>
        <SExpandButton
          onClick={() => setEncodedExpanded((prev) => !prev)}
          expanded={encodedExpanded}
        >
          <ChevronDownSmallIcon />
          {t("liquidity.reviewTransaction.calldata.encoded")}
        </SExpandButton>
        {encodedExpanded && (
          <SRawCallData>
            <span>0x</span>
            {splitHexByZeroes(tx.method.toHex()).map((str, index, arr) => (
              <Fragment key={index}>
                {str.startsWith("00") ? <>{str}</> : <span>{str}</span>}
              </Fragment>
            ))}
          </SRawCallData>
        )}
      </div>
    </SContainer>
  )
}

const EvmTxData: FC<{ method?: string; abi?: string; data?: string }> = ({
  data,
  method,
  abi,
}) => {
  const { t } = useTranslation()

  const [ref, { height }] = useMeasure<HTMLDivElement>()

  const [encodedExpanded, setEncodedExpanded] = useState(true)
  const [decodedExpanded, setDecodedExpanded] = useState(true)

  const [decodedFullyExpanded, setDecodedFullyExpanded] = useState(false)

  const allowDecodedFullExpand =
    !decodedFullyExpanded && height > MAX_DECODED_HEIGHT

  const decodedData = useMemo(() => {
    if (abi && data) {
      try {
        const parsedAbi = JSON.parse(abi) as any[]
        const types = parsedAbi.find((f) => f.name === method)?.inputs ?? []
        const decoded = utils.defaultAbiCoder.decode(
          types,
          hexDataSlice(data, 10),
        )

        return decodedResultToJson(decoded)
      } catch (error) {}
    }
  }, [abi, data, method])

  if (!decodedData) return null
  if (!data) return null

  return (
    <SContainer>
      <div>
        <SExpandButton
          onClick={() => setDecodedExpanded((prev) => !prev)}
          expanded={decodedExpanded}
        >
          <ChevronDownSmallIcon />
          {t("liquidity.reviewTransaction.calldata.decoded")}
        </SExpandButton>
        {decodedExpanded && (
          <div
            sx={{
              mt: 10,
              pl: 16,
            }}
            css={{
              position: "relative",
              height: allowDecodedFullExpand ? MAX_DECODED_HEIGHT : "auto",
              overflow: "hidden",
            }}
          >
            <TransactionCode ref={ref} name={method} src={decodedData} />
            {allowDecodedFullExpand && (
              <SShowMoreButton
                onClick={() => setDecodedFullyExpanded(true)}
                css={{
                  position: "absolute",
                  bottom: 0,
                }}
              >
                Show more <ChevronDown width={16} height={16} />
              </SShowMoreButton>
            )}
          </div>
        )}
      </div>
      <Separator sx={{ my: 12 }} />
      <div>
        <SExpandButton
          onClick={() => setEncodedExpanded((prev) => !prev)}
          expanded={encodedExpanded}
        >
          <ChevronDownSmallIcon />
          {t("liquidity.reviewTransaction.calldata.encoded")}
        </SExpandButton>
        {encodedExpanded && (
          <SRawCallData>
            <span>0x</span>
            {splitHexByZeroes(data).map((str, index) => (
              <Fragment key={index}>
                {str.startsWith("00") ? <>{str}</> : <span>{str}</span>}
              </Fragment>
            ))}
          </SRawCallData>
        )}
      </div>
    </SContainer>
  )
}

export const ReviewTransactionData: FC<Props> = ({
  tx,
  evmTx,
  xcall,
  address = "",
}) => {
  const isEVM = isEvmAccount(address) || isEvmAddress(address)

  if (!isEVM && tx) return <ExtrinsicData tx={tx} />
  if (isEVM && tx) return <EvmExtrinsicData tx={tx} />
  if (isEVM && xcall)
    return <EvmTxData method="transfer" data={xcall?.data} abi={xcall?.abi} />
  if (evmTx)
    return <EvmTxData method="?" data={evmTx?.data?.toString()} abi="[]" />
  return null
}
