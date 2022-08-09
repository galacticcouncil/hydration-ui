import { Page } from "components/Page/Page";
import { PageHeader } from "./FarmsPoolsPageHeader/PageHeader";
import { PoolCard } from "./PoolCard/PoolCard";

export const FarmsPoolsPage = () => {
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
  );
};
