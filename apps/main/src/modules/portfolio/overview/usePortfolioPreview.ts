import { useNavigate, useSearch } from "@tanstack/react-router"

import {
  isLocalStrategyPreviewHost,
  isStrategyPreviewEnabled,
} from "@/modules/portfolio/overview/MyStrategies/MyStrategies.preview"

export const usePortfolioPreview = () => {
  const { strategyPreview } = useSearch({ from: "/portfolio/" })
  const navigate = useNavigate({ from: "/portfolio/" })
  const hostname = window.location.hostname
  const isPreview = isStrategyPreviewEnabled(
    hostname,
    strategyPreview,
    import.meta.env.VITE_PORTFOLIO_STRATEGY_PREVIEW === "true",
  )

  return {
    isPreview,
    isLocal: isLocalStrategyPreviewHost(hostname),
    toggle: () =>
      navigate({
        search: (search) => ({ ...search, strategyPreview: !isPreview }),
        resetScroll: false,
        replace: true,
      }),
  }
}
