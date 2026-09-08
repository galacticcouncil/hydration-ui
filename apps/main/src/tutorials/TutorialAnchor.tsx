import { Hint } from "@galacticcouncil/ui/components"
import { ParseKeys } from "i18next"
import {
  cloneElement,
  isValidElement,
  MouseEvent,
  ReactElement,
  ReactNode,
  useEffect,
} from "react"
import { useTranslation } from "react-i18next"

import { Tutorial, TutorialId, tutorials } from "@/tutorials/registry"
import { useTutorialContext } from "@/tutorials/TutorialProvider"

type TutorialAnchorProps = {
  tutorial: TutorialId
  /** Zero-based index into the registry entry's `steps`. */
  step?: number
  asChild?: boolean
  children: ReactNode
}

type ClickableProps = { onClick?: (event: MouseEvent) => void }

/**
 * Attaches a tutorial hint to whatever it wraps. Positioning is Radix's job,
 * so there is no ref registry, no anchor name and no DOM lookup — the wrapped
 * element *is* the anchor.
 */
export const TutorialAnchor = ({
  tutorial,
  step = 0,
  asChild = false,
  children,
}: TutorialAnchorProps) => {
  const { t } = useTranslation()
  const { live, registerAnchor, advance, retire } = useTutorialContext()

  // `satisfies` keeps ids a literal union but narrows each value to its own
  // shape, so the entry is read back through `Tutorial` to see optional fields.
  const entry: Tutorial = tutorials[tutorial]
  const config = entry.steps[step]

  useEffect(() => {
    if (!config) return
    return registerAnchor(tutorial, step)
  }, [config, registerAnchor, tutorial, step])

  useEffect(() => {
    if (import.meta.env.DEV && !config) {
      console.warn(
        `TutorialAnchor: step ${step} does not exist on tutorial "${tutorial}" (${entry.steps.length} step(s) declared).`,
      )
    }
  }, [config, entry.steps.length, step, tutorial])

  const isLive = live?.id === tutorial && live.stepIndex === step

  const retireOnAnchorClick = entry.retireOnAnchorClick ?? true

  const child = isValidElement(children)
    ? (children as ReactElement<ClickableProps>)
    : null

  const anchor =
    retireOnAnchorClick && child
      ? cloneElement(child, {
          onClick: (event: MouseEvent) => {
            child.props.onClick?.(event)
            retire(tutorial)
          },
        })
      : children

  if (!config) return <>{anchor}</>

  const stepCount = entry.steps.length
  // Optional by convention: a step without a `.title` key falls back to "".
  const title = t(`${config.i18nKey}.title` as ParseKeys, { defaultValue: "" })

  const actionLabel =
    stepCount === 1
      ? t("gotIt")
      : step === stepCount - 1
        ? t("finish")
        : t("next")

  return (
    <Hint
      open={isLive}
      title={title || undefined}
      description={t(`${config.i18nKey}.description` as ParseKeys)}
      actionLabel={actionLabel}
      side={config.side}
      align={config.align}
      step={step}
      stepCount={stepCount}
      onDismiss={() => retire(tutorial)}
      onAdvance={() => advance(tutorial)}
      asChild={asChild}
    >
      {anchor}
    </Hint>
  )
}
