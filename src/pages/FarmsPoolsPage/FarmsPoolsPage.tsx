import { useQuery } from "@tanstack/react-query"
import { Page } from "components/Page/Page"
import { useApiPromise } from "utils/network"
import { PageHeader } from "./FarmsPoolsPageHeader/PageHeader"
import { PoolCard } from "./PoolCard/PoolCard"

export const FarmsPoolsPage = () => {
  const api = useApiPromise()

  useQuery(["rpc"], async () => {
    const signedBlock = await api.rpc.chain.getBlock()

    // the information for each of the contained extrinsics
    signedBlock.block.extrinsics.forEach((ex, index) => {
      // the extrinsics are decoded by the API, human-like view
      console.log(index, ex.toHuman())

      const {
        isSigned,
        method: { args, method, section },
      } = ex

      // explicit display of name, args & documentation
      console.log(
        `${section}.${method}(${args.map((a) => a.toString()).join(", ")})`,
      )
      // console.log(meta.documentation.map((d) => d.toString()).join("\n"))

      // signer/nonce info
      if (isSigned) {
        console.log(
          `signer=${ex.signer.toString()}, nonce=${ex.nonce.toString()}`,
        )
      }
    })
  })

  return (
    <Page>
      <PageHeader />
      <PoolCard hasJoinedFarms={true} hasLiquidity={true} />
      <PoolCard hasJoinedFarms={true} hasLiquidity={false} />
      <PoolCard hasJoinedFarms={false} hasLiquidity={true} />
      <PoolCard hasJoinedFarms={true} hasLiquidity={false} />
      <PoolCard hasJoinedFarms={false} hasLiquidity={false} />
      <PoolCard hasJoinedFarms={true} hasLiquidity={false} />
    </Page>
  )
}
