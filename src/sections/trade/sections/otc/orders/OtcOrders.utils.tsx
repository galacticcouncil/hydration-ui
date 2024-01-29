import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { Text } from "components/Typography/Text/Text";
import { useTranslation } from "react-i18next";
import { useMedia } from "react-use";
import { theme } from "theme";
import { OrderCapacity } from "sections/trade/sections/otc/capacity/OrderCapacity";
import { OtcOrderActions } from "./actions/OtcOrderActions";
import {
  OrderAssetColumn,
  OrderMarketPriceColumn,
  OrderPriceColumn,
} from "./OtcOrdersData";
import { OrderTableData } from "./OtcOrdersData.utils";
import Skeleton from "react-loading-skeleton";
import { useMemo, useState } from "react";

export const useOrdersTable = (
  data: OrderTableData[],
  actions: {
    onFill: (data: OrderTableData) => void;
    onClose: (data: OrderTableData) => void;
  },
) => {
  const { t } = useTranslation();
  const { accessor, display } = createColumnHelper<OrderTableData>();

  const isDesktop = useMedia(theme.viewport.gte.sm);
  const columnVisibility: VisibilityState = {
    pair: true,
    offer: isDesktop,
    accepting: isDesktop,
    orderPrice: true,
    marketPrice: isDesktop,
    filled: isDesktop,
    actions: true,
  };

  const columns = useMemo(
    () => [
      accessor("offer", {
        id: "offer",
        header: isDesktop
          ? t("otc.offers.table.header.offer")
          : t("selectAssets.asset"),
        cell: ({ row }) => <OrderAssetColumn pair={row.original.offer} />,
      }),
      accessor("accepting", {
        id: "accepting",
        header: t("otc.offers.table.header.accepting"),
        cell: ({ row }) => <OrderAssetColumn pair={row.original.accepting} />,
      }),
      accessor("orderPrice", {
        id: "orderPrice",
        header: t("otc.offers.table.header.orderPrice"),
        cell: ({ row }) => (
          <OrderPriceColumn
            pair={row.original.offer}
            price={row.original.orderPrice} //TODO: Implement proper asset price
          />
        ),
      }),
      accessor("marketPrice", {
        id: "marketPrice",
        header: t("otc.offers.table.header.marketPrice"),
        cell: ({ row }) => (
          <OrderMarketPriceColumn
            pair={row.original.offer}
            price={row.original.marketPrice} //TODO: Implement actual market price % here
          />
        ),
      }),
      accessor("filled", {
        id: "filled",
        header: () => (
          <div
            style={{
              textAlign: "center",
              width: "100%",
            }}
          >
            {t("otc.offers.table.header.status")}
          </div>
        ),

        cell: ({ row }) =>
          row.original.accepting.initial && row.original.partiallyFillable ? (
            <OrderCapacity
              total={row.original.accepting.initial}
              free={row.original.accepting.amount}
              symbol={row.original.accepting.symbol}
            />
          ) : (
            <Text fs={12} fw={400} color="basic400" tAlign={"center"} as="div">
              N / A
            </Text>
          ),
      }),
      display({
        id: "actions",
        cell: ({ row }) => (
          <OtcOrderActions
            data={row.original}
            onClose={actions.onClose}
            onFill={actions.onFill}
          />
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [actions, isDesktop],
  );

  return useReactTable({
    data,
    columns,
    state: { columnVisibility },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
};

export const useOrdersTableSkeleton = () => {
  const { t } = useTranslation();
  const { display } = createColumnHelper();

  const isDesktop = useMedia(theme.viewport.gte.sm);
  const columnVisibility: VisibilityState = {
    pair: true,
    price: true,
    offering: isDesktop,
    accepting: isDesktop,
    filled: isDesktop,
    actions: true,
  };

  const columns = useMemo(
    () => [
      display({
        id: "offer",
        header: isDesktop
          ? t("otc.offers.table.header.offer")
          : t("selectAssets.asset"),
        cell: () => <Skeleton width="100%" height="100%" />,
      }),
      display({
        id: "accepting",
        header: t("otc.offers.table.header.accepting"),
        cell: () => <Skeleton width="100%" height="100%" />,
      }),
      display({
        id: "orderPrice",
        header: t("otc.offers.table.header.orderPrice"),
        cell: () => <Skeleton width="100%" height="100%" />,
      }),
      display({
        id: "marketPrice",
        header: t("otc.offers.table.header.marketPrice"),
        cell: () => <Skeleton width="100%" height="100%" />,
      }),
      display({
        id: "filled",
        header: t("otc.offers.table.header.status"),
        cell: () => <Skeleton width="100%" height="100%" />,
      }),
      display({
        id: "actions",
        cell: "",
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isDesktop],
  );

  return useReactTable({
    data: mockData,
    columns,
    state: { columnVisibility },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
};

const mockData = [1, 2, 3, 4];
