import { TProviderContext } from "@/providers/rpcProvider";
import { queryOptions } from "@tanstack/react-query";

export const dcaSellOrderQuery = ({ papi, papiClient ,isLoaded }: TProviderContext) => queryOptions({
    queryFn: () => {
        papiClient.getTypedApi().apis().dca.getSellOrder(
    },
})