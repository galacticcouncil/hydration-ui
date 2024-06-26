import { Button } from "components/Button/Button"
import { Page } from "components/Layout/Page/Page"
import { Modal } from "components/Modal/Modal"
import { Spacer } from "components/Spacer/Spacer"
import { Stepper } from "components/Stepper/Stepper"
import { useMemo } from "react"
import { MemepadActionBar } from "sections/memepad/components/MemepadActionBar"
import { MemepadHeader } from "sections/memepad/components/MemepadHeader"
import { useMemepadForms } from "sections/memepad/form/MemepadForm.utils"
import { SContent } from "./MemepadPage.styled"
import { useRouteBlock } from "hooks/useRouteBlock"

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
      <Modal open={isBlocking}>
        <Button variant="primary" onClick={accept}>
          accept
        </Button>
        <Button onClick={cancel}>cancel</Button>
      </Modal>
    </Page>
  )
}
