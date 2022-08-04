import { Page } from "components/Page/Page";
import { PageHeader } from "./PageHeader/PageHeader";
import { PoolCard } from "./PoolCard/PoolCard";

export const FarmsPoolsPage = () => {
  return (
    <Page>
      <PageHeader />
      <PoolCard hasJoinedFarms={true} />
      <PoolCard hasJoinedFarms={false} />
      <PoolCard hasJoinedFarms={true} />
      <PoolCard hasJoinedFarms={true} />
      <PoolCard hasJoinedFarms={false} />
      <PoolCard hasJoinedFarms={true} />
    </Page>
  );
};
