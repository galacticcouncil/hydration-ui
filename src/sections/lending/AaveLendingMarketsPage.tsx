import { Box, Container } from "@mui/material"
import { ReactNode } from "react"
import { MarketAssetsListContainer } from "sections/lending/modules/markets/MarketAssetsListContainer"
import { MarketsTopPanel } from "sections/lending/modules/markets/MarketsTopPanel"
import { marketContainerProps } from "sections/lending/styles"

interface MarketContainerProps {
  children: ReactNode
}

export const MarketContainer = ({ children }: MarketContainerProps) => {
  return <Container {...marketContainerProps}>{children}</Container>
}

export const AaveLendingMarketsPage = () => {
  return (
    <>
      <MarketsTopPanel />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flex: 1,
          mt: { xs: "-32px", lg: "-46px", xl: "-44px", xxl: "-48px" },
        }}
      >
        <MarketContainer>
          <MarketAssetsListContainer />
        </MarketContainer>
      </Box>
    </>
  )
}
