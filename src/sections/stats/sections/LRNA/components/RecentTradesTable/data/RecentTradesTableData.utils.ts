import BN from 'bignumber.js'

export const useRecentTradesTableData = () => {
  const data =
    Array.from({ length: 10 }).map((_, i) => (
      {
        id: '1',
        isBuy: false,
        isSell: true,
        amountIn: new BN(100),
        amountOut: new BN(101),
        totalValue: new BN(102),
        account: '0xF2CD2AA0c7926743B1D4310b2BC984a0a453c3d4',
        assetInSymbol: '1',
        assetOutSymbol: '1',
        date: new Date(),
      }
    ));

  return { data, isLoading: false }
}

export type TRecentTradesTable = typeof useRecentTradesTableData
export type TRecentTradesTableData = ReturnType<TRecentTradesTable>["data"]
