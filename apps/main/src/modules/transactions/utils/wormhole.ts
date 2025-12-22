import { isEvmParachain, stringEquals, subscan } from "@galacticcouncil/utils"
import { chainsMap } from "@galacticcouncil/xc-cfg"

export const getWormholeHashByExtrinsicIndex = async (
  extrinsicIndex: string,
): Promise<string> => {
  const xcmListEndpoint = subscan.api("polkadot/xcm/list")
  const xcmBody = JSON.stringify({
    extrinsic_index: extrinsicIndex,
    message_type: "transfer",
    row: 1,
  })

  const xcmRes = await fetch(xcmListEndpoint, {
    method: "POST",
    body: xcmBody,
    headers: {
      "Content-type": "application/json",
    },
  })

  const xcmListData = await xcmRes.json()
  const tx = xcmListData?.data?.list?.[0]

  if (!tx) return ""

  try {
    const destExtrinsicIndex = tx.dest_extrinsic_index
    const [destBlockNumber] = destExtrinsicIndex.split("-")
    const fromAccountId = tx.to_account_id

    const moonbeam = chainsMap.get("moonbeam")

    const isMoonbeamEvmParachain = moonbeam && isEvmParachain(moonbeam)

    if (!isMoonbeamEvmParachain || !destBlockNumber || !fromAccountId) return ""

    const moonbeamClient = moonbeam.evmClient.getProvider()
    const block = await moonbeamClient.getBlock({
      blockNumber: BigInt(destBlockNumber),
      includeTransactions: true,
    })

    if (!block.transactions) {
      return ""
    }

    const wormholeTx = block.transactions.find((tx) =>
      stringEquals(tx.from, fromAccountId),
    )

    return wormholeTx?.hash ?? ""
  } catch (error) {
    return ""
  }
}
