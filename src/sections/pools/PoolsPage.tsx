import { useQuery } from "@tanstack/react-query"
import { Page } from "components/Page/Page"
import { useApiPromise } from "utils/network"
import { PoolsHeader } from "sections/pools/header/PoolsHeader"
import { Pool } from "sections/pools/pool/Pool"
import { Box } from "components/Box/Box"

export const PoolsPage = () => {
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
      <PoolsHeader />
      <Box flex column gap={20}>
        <Pool hasJoinedFarms={true} hasLiquidity={true} />
        <Pool hasJoinedFarms={true} hasLiquidity={false} />
        <Pool hasJoinedFarms={false} hasLiquidity={true} />
        <Pool hasJoinedFarms={true} hasLiquidity={false} />
        <Pool hasJoinedFarms={false} hasLiquidity={false} />
        <Pool hasJoinedFarms={true} hasLiquidity={false} />
      </Box>
    </Page>
  )
}
