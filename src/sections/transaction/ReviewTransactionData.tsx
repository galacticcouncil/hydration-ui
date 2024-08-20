import { XCallEvm } from "@galacticcouncil/xcm-sdk"
import { SubmittableExtrinsic } from "@polkadot/api/promise/types"
import ChevronDown from "assets/icons/ChevronDown.svg?react"
import ChevronDownSmallIcon from "assets/icons/ChevronDownSmall.svg?react"
import { Separator } from "components/Separator/Separator"
import { TransactionCode } from "components/TransactionCode/TransactionCode"
import React, { FC, Fragment, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useCopyToClipboard, useMeasure } from "react-use"
import {
  splitHexByZeroes,
  decodeXCallEvm,
} from "sections/transaction/ReviewTransactionData.utils"
import { isEvmAccount, isEvmAddress } from "utils/evm"
import { getTransactionJSON } from "./ReviewTransaction.utils"
import {
  SContainer,
  SExpandableContainer,
  SExpandButton,
  SRawData,
  SScrollableContent,
  SShowMoreButton,
} from "./ReviewTransactionData.styled"
import { Button } from "components/Button/Button"
import CopyIcon from "assets/icons/CopyIcon.svg?react"
import SuccessIcon from "assets/icons/SuccessIcon.svg?react"
import { Dropdown } from "components/Dropdown/Dropdown"
import { createPolkadotJSTxUrl } from "sections/transaction/ReviewTransactionForm.utils"
import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { isAnyParachain } from "utils/helpers"

const MAX_DECODED_HEIGHT = 130

type Props = {
  address?: string
  tx?: SubmittableExtrinsic
  xcallEvm?: XCallEvm
  xcallMeta?: Record<string, string>
}

const TransactionData: FC<{ data: string }> = ({ data }) => {
  return (
    <SRawData>
      <span>0x</span>
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
            {encodedExpanded && <div>{encodedCallHash}</div>}
          </div>
        </>
      )}
    </SExpandableContainer>
  )
}

export const ReviewTransactionData: FC<Props> = ({
  tx,
  xcallEvm,
  xcallMeta,
  address = "",
}) => {
  const { t } = useTranslation()
  const [, copyToClipboard] = useCopyToClipboard()
  const [copied, setCopied] = useState(false)

  const isEVM = isEvmAccount(address) || isEvmAddress(address)
  const json = tx ? getTransactionJSON(tx) : null
  const decodedEvmData = isEVM && xcallEvm ? decodeXCallEvm(xcallEvm) : null

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

    if (xcallEvm && decodedEvmData) {
      items.push({
        key: "json-evm",
        label: t("liquidity.reviewTransaction.dropdown.json"),
        onSelect: () => {
          copy(JSON.stringify(decodedEvmData.data, null, 2))
        },
      })
      items.push({
        key: "calldata-evm",
        label: t("liquidity.reviewTransaction.dropdown.calldata"),
        onSelect: () => {
          copy(xcallEvm.data)
        },
      })
    }

    if (tx) {
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

      const chain = chainsMap.get(xcallMeta?.srcChain ?? "hydradx")
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
  }, [copyToClipboard, decodedEvmData, t, tx, xcallEvm, xcallMeta?.srcChain])

  return (
    <SContainer>
      <SScrollableContent>
        {isEVM && xcallEvm && decodedEvmData ? (
          <TransactionExpander
            decodedCall={
              <TransactionCode
                name={decodedEvmData.method}
                src={decodedEvmData.data}
              />
            }
            encodedCall={<TransactionData data={xcallEvm.data} />}
          />
        ) : json && tx ? (
          <TransactionExpander
            decodedCall={<TransactionCode name={json.method} src={json.args} />}
            encodedCall={<TransactionData data={tx.method.toHex()} />}
            encodedCallHash={<TransactionData data={tx.method.hash.toHex()} />}
          />
        ) : null}
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
        </Button>
      </Dropdown>
    </SContainer>
  )
}
