import { useEffect, useMemo, useState } from "react";
import { useOrdersData, useOrdersState, getOrderStateValue } from "api/otc";
import BN from "bignumber.js";
import { useRpcProvider } from "providers/rpcProvider";
import { TradeRouter } from "@galacticcouncil/sdk";
import {
  getCoinGeckoPairSpotPrice,
  useDisplayAssetStore,
  useDisplayPrices,
} from "utils/displayAsset";
import { getSpotPrice, useSpotPrice, useSpotPrices } from "api/spotPrice";
import { BN_10 } from "utils/constants";
import { u32 } from "@polkadot/types";
import { c } from "vitest/dist/reporters-5f784f42";


export const useOrdersTableData = () => {
  const treasuryAddr = import.meta.env.VITE_TRSRY_ADDR;
  const orders = useOrdersData();
  const orderIds = orders.data?.map((order) => order.id);
  const ordersState = useOrdersState(orderIds || []);
  const queries = [orders, ...ordersState];
  const isLoading = queries.some((q) => q.isLoading);
  const isInitialLoading = queries.some((q) => q.isInitialLoading);

  const data = useMemo(() => {
    if (!orders.data) return [];
    return orders.data.map((order) => {
      const orderState = ordersState.find(
        (state) => state.data?.orderId === parseInt(order.id),
      );
      const orderStateValue = getOrderStateValue(orderState?.data);

      const amountInDp: number = order.assetIn?.decimals ?? 12;
      const amountIn: BN = order.amountIn!.shiftedBy(-1 * amountInDp);
      const amountInInitial: string | undefined = orderStateValue?.amountIn;
      const amountOutDp: number = order.assetOut?.decimals ?? 12;
      const amountOut: BN = order.amountOut!.shiftedBy(-1 * amountOutDp);
      const amountOutInitial: string | undefined = orderStateValue?.amountOut;

      return {
        id: order.id,
        owner: order.owner,
        offer: {
          initial:
            amountOutInitial &&
            new BN(amountOutInitial).shiftedBy(-1 * amountOutDp),
          amount: amountOut,
          asset: order.assetOut?.id,
          name: order.assetOut?.name,
          symbol: order.assetOut?.symbol,
        },
        accepting: {
          initial:
            amountInInitial &&
            new BN(amountInInitial).shiftedBy(-1 * amountInDp),
          amount: amountIn,
          asset: order.assetIn?.id,
          name: order.assetIn?.name,
          symbol: order.assetIn?.symbol,
        },
        price: amountIn.div(amountOut),
        orderPrice: amountIn.div(amountOut),
        marketPrice: amountIn.div(amountOut),
        partiallyFillable: order.partiallyFillable,
        pol: order.owner === treasuryAddr,
      } as OrderTableData;
    });
  }, [orders.data, ordersState, treasuryAddr]);

  return {
    data,
    isLoading,
    isInitialLoading,
  };
};

export type OrderTableData = {
  id: string;
  owner: string;
  offer: OfferingPair;
  accepting: OfferingPair;
  price: BN;
  orderPrice: BN;
  marketPrice: BN;
  filled: string;
  partiallyFillable: boolean;
  pol: boolean;
};

export type OfferingPair = {
  initial: BN | undefined;
  amount: BN;
  asset: string;
  name: string;
  symbol: string;
};
