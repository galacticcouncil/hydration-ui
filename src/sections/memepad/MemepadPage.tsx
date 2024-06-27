import { Button } from "components/Button/Button"
import { Page } from "components/Layout/Page/Page"
import { Spacer } from "components/Spacer/Spacer"
import { Stepper } from "components/Stepper/Stepper"
import { useRouteBlock } from "hooks/useRouteBlock"
import { useMemo } from "react"
import { SContent } from "./MemepadPage.styled"
import { MemepadActionBar } from "./components/MemepadActionBar"
import { MemepadHeader } from "./components/MemepadHeader"
import { useMemepadForms } from "./form/MemepadForm.utils"
import { RouteBlockModal } from "./modal/RouteBlockModal"

export const MemepadPage = () => {
  const {
    step,
    currentForm,
    summary,
    submitNext,
    isFinalStep,
    reset,
    isDirty,
  } = useMemepadForms()

  const { isBlocking, accept, cancel } = useRouteBlock(isDirty)

  const steps = useMemo(() => {
    const stepLabels = [
      "Create & Register",
      "Transfer Liquidity",
      "Create Isolated Pool",
      "Summary",
    ]
    return stepLabels.map(
      (label, index) =>
        ({
          label,
          state: step === index ? "active" : step > index ? "done" : "todo",
        }) as const,
    )
  }, [step])

  return (
    <Page flippedBg>
      <MemepadHeader />
      <Spacer size={35} />
      <SContent>
        <div>
          <Stepper fullWidth steps={steps} />
          <Spacer size={60} />
          {currentForm}
          {isFinalStep && (
            <>
              <pre sx={{ color: "white" }}>
                {JSON.stringify(summary, null, 2)}
              </pre>
              <Button onClick={reset}>Create another asset</Button>
            </>
          )}
        </div>
      </SContent>
      {!isFinalStep && (
        <MemepadActionBar
          disabled={step >= steps.length - 1}
          onNext={submitNext}
        />
      )}
      <RouteBlockModal open={isBlocking} onAccept={accept} onCancel={cancel} />
    </Page>
  )
}
