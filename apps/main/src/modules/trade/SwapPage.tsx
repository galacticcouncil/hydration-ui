import {
  Flex,
  Paper,
  Separator,
  Skeleton,
  Text,
} from "@galacticcouncil/ui/components"
import { Outlet } from "@tanstack/react-router"

import { useAssetsPrice } from "@/states/displayAsset"

import { FormHeader } from "./components"
import { SContainer } from "./SwapPage.styled"
const keys = ["0", "5", "9", "22", "7", "8", "9"] //["5"] //

export const SwapPage = () => {
  const assets = useAssetsPrice(keys)

  console.log(assets, "updated assets")
  return (
    <Flex gap={20} sx={{ flexWrap: "wrap" }} justify="center">
      <Flex direction="column" gap={20} sx={{ width: ["100%", 440] }}>
        <Paper sx={{ height: 700, minWidth: ["auto", 640] }}>
          {Object.entries(assets).map(([id, data]) => (
            <Flex gap={24} key={id}>
              <Text>{id}</Text>
              {data.isLoading ? (
                <Skeleton width={30} height={15} />
              ) : (
                <Text>{data?.price}</Text>
              )}
            </Flex>
          ))}
        </Paper>
        <SContainer>
          <FormHeader />
          <Separator mx={-20} />
          <Outlet />
        </SContainer>
        <Paper sx={{ height: 50 }}></Paper>
      </Flex>
    </Flex>
  )
}
