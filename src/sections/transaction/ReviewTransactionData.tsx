import { TransactionRequest } from "@ethersproject/providers"
import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { SubmittableExtrinsic } from "@polkadot/api/promise/types"
import ChevronDown from "assets/icons/ChevronDown.svg?react"
import ChevronDownSmallIcon from "assets/icons/ChevronDownSmall.svg?react"
import CopyIcon from "assets/icons/CopyIcon.svg?react"
import SuccessIcon from "assets/icons/SuccessIcon.svg?react"
import { Button } from "components/Button/Button"
import { Dropdown } from "components/Dropdown/Dropdown"
import { Separator } from "components/Separator/Separator"
import { TransactionCode } from "components/TransactionCode/TransactionCode"
import React, { FC, Fragment, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useCopyToClipboard, useMeasure } from "react-use"
import {
  decodeEvmCall,
  getCallDataHex,
  splitHexByZeroes,
} from "sections/transaction/ReviewTransactionData.utils"
import { createPolkadotJSTxUrl } from "sections/transaction/ReviewTransactionForm.utils"
import { isAnyParachain } from "utils/helpers"
import { getTransactionJSON } from "./ReviewTransaction.utils"
import {
  SContainer,
  SExpandableContainer,
  SExpandButton,
  SModeButton,
  SRawData,
  SScrollableContent,
  SShowMoreButton,
} from "./ReviewTransactionData.styled"
import { EvmCall, SolanaCall } from "@galacticcouncil/xcm-sdk"
import {
  isEvmCall,
  isSolanaCall,
} from "sections/transaction/ReviewTransactionXCallForm.utils"

const MAX_DECODED_HEIGHT = 130

type Props = {
  tx?: SubmittableExtrinsic
  evmTx?: {
    data: TransactionRequest
    abi?: string
  }
  xcall?: EvmCall | SolanaCall
  xcallMeta?: Record<string, string>
}

type TransactionMode = "auto" | "evm" | "solana" | "substrate"

const TransactionData: FC<{ data: string }> = ({ data }) => {
  return (
    <SRawData>
      {data.startsWith("0x") && <span>0x</span>}
      {splitHexByZeroes(data).map((str, index) => (
        <Fragment key={index}>
          {str.startsWith("00") ? <>{str}</> : <span>{str}</span>}
        </Fragment>
      ))}
    </SRawData>
  )
}

const TransactionExpander: FC<{
  decodedCall: React.ReactNode
  encodedCall: React.ReactNode
  encodedCallHash?: React.ReactNode
}> = ({ decodedCall, encodedCall, encodedCallHash }) => {
  const { t } = useTranslation()
  const [ref, { height }] = useMeasure<HTMLDivElement>()

  const [decodedExpanded, setDecodedExpanded] = useState(true)
  const [encodedExpanded, setEncodedExpanded] = useState(true)
  const [encodedHashExpanded, setEncodedHashExpanded] = useState(true)

  const [decodedFullyExpanded, setDecodedFullyExpanded] = useState(false)

  const allowDecodedFullExpand =
    !decodedFullyExpanded && height > MAX_DECODED_HEIGHT

  return (
    <SExpandableContainer>
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
            <div ref={ref}>{decodedCall}</div>
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
        {encodedExpanded && <div>{encodedCall}</div>}
      </div>
      {encodedCallHash && (
        <>
          <Separator sx={{ my: 12 }} />
          <div>
            <SExpandButton
              onClick={() => setEncodedHashExpanded((prev) => !prev)}
              expanded={encodedHashExpanded}
            >
              <ChevronDownSmallIcon />
              {t("liquidity.reviewTransaction.calldata.encodedHash")}
            </SExpandButton>
            {encodedHashExpanded && <div>{encodedCallHash}</div>}
          </div>
        </>
      )}
    </SExpandableContainer>
  )
}

export const ReviewTransactionData: FC<Props> = ({
  tx,
  evmTx,
  xcall,
  xcallMeta,
}) => {
  const { t } = useTranslation()
  const [, copyToClipboard] = useCopyToClipboard()
  const [copied, setCopied] = useState(false)

  const txJson = tx ? getTransactionJSON(tx) : null

  const evmCall = evmTx || (isEvmCall(xcall) && xcall)

  const evmTxJson = evmCall ? decodeEvmCall(evmCall) : null
  const evmTxData = evmCall ? getCallDataHex(evmCall.data) : ""

  const isSubstrateTx = !!tx && !!txJson
  const isEvmTx = isEvmCall(xcall) && !!evmTxJson
  const isSolanaTx = isSolanaCall(xcall)
  const isWrappedEvmTx = isSubstrateTx && txJson?.method.startsWith("evm.call")

  const [mode, setMode] = useState<TransactionMode>(
    isWrappedEvmTx ? "evm" : "auto",
  )

  const shouldRenderEvm = isEvmTx && (mode === "evm" || mode === "auto")
  const shouldRenderSolana =
    isSolanaTx && (mode === "solana" || mode === "auto")
  const shouldRenderSubstrate =
    isSubstrateTx && (mode === "substrate" || mode === "auto")

  useEffect(() => {
    if (!copied) return
    const id = setTimeout(() => {
      setCopied(false)
    }, 2000)

    return () => {
      clearTimeout(id)
    }
  }, [copied])

  const dropdownItems = useMemo(() => {
    const items = []

    function copy(str: string) {
      copyToClipboard(str)
      setCopied(true)
    }

    if (shouldRenderEvm) {
      items.push({
        key: "json-evm",
        label: t("liquidity.reviewTransaction.dropdown.json"),
        onSelect: () => {
          copy(JSON.stringify(evmTxJson.data, null, 2))
        },
      })
      items.push({
        key: "calldata-evm",
        label: t("liquidity.reviewTransaction.dropdown.calldata"),
        onSelect: () => {
          copy(evmTxData)
        },
      })
    }

    if (shouldRenderSubstrate) {
      items.push({
        key: "json",
        label: t("liquidity.reviewTransaction.dropdown.json"),
        onSelect: () => {
          copy(JSON.stringify(tx.method.toHuman(), null, 2))
        },
      })

      items.push({
        key: "calldata",
        label: t("liquidity.reviewTransaction.dropdown.calldata"),
        onSelect: () => {
          copy(tx.method.toHex())
        },
      })
      items.push({
        key: "callhash",
        label: t("liquidity.reviewTransaction.dropdown.callhash"),

        onSelect: () => {
          copy(tx.method.hash.toHex())
        },
      })

      const chain = chainsMap.get(xcallMeta?.srcChain ?? "hydration")
      const url =
        chain && isAnyParachain(chain) && chain?.ws
          ? createPolkadotJSTxUrl(
              Array.isArray(chain.ws) ? chain.ws[0] : chain.ws,
              tx,
            )
          : ""

      if (url) {
        items.push({
          key: "polkadotjs",
          label: t(
            "liquidity.reviewTransaction.modal.confirmButton.openPolkadotJS",
          ),
          onSelect: () => {
            window.open(url, "_blank")
          },
        })
      }
    }

    return items
  }, [
    copyToClipboard,
    evmTxJson?.data,
    evmTxData,
    shouldRenderEvm,
    shouldRenderSubstrate,
    t,
    tx,
    xcallMeta?.srcChain,
  ])

  return (
    <SContainer>
      <SScrollableContent>
        {mode !== "auto" && (
          <div sx={{ flex: "row", gap: 12, mb: 12, mt: -8 }}>
            <SModeButton active={mode === "evm"} onClick={() => setMode("evm")}>
              EVM
            </SModeButton>
            <SModeButton
              active={mode === "substrate"}
              onClick={() => setMode("substrate")}
            >
              SUBSTRATE
            </SModeButton>
          </div>
        )}

        {shouldRenderEvm && (
          <TransactionExpander
            decodedCall={
              <TransactionCode name={evmTxJson.method} src={evmTxJson.data} />
            }
            encodedCall={<TransactionData data={evmTxData} />}
          />
        )}
        {shouldRenderSolana && (
          <TransactionExpander
            decodedCall={<TransactionCode name="" src={xcall.ix} />}
            encodedCall={<TransactionData data={xcall.data} />}
          />
        )}
        {shouldRenderSubstrate && (
          <TransactionExpander
            decodedCall={
              <TransactionCode name={txJson.method} src={txJson.args} />
            }
            encodedCall={<TransactionData data={tx.method.toHex()} />}
            encodedCallHash={<TransactionData data={tx.method.hash.toHex()} />}
          />
        )}
      </SScrollableContent>
      <Dropdown
        asChild
        align="end"
        items={dropdownItems}
        onSelect={(item) => item.onSelect?.()}
      >
        <Button
          size="micro"
          variant="outline"
          sx={{ p: 4 }}
          css={{ position: "absolute", top: 6, right: 12 }}
        >
          {copied ? (
            <SuccessIcon width={18} height={18} css={{ scale: "75%" }} />
          ) : (
            <CopyIcon width={18} height={18} />
          )}
          {t("copy")}
        </Button>
      </Dropdown>
    </SContainer>
  )
}
