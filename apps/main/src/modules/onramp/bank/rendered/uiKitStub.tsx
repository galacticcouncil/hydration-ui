/**
 * Test-only stand-in for `@galacticcouncil/ui/components`, used by the rendered
 * bank tests through `vi.mock(..., () => import("./uiKitStub"))`. The real kit
 * does not load under vitest: its sources import SVGs as `?react` (svgr) and use
 * a package-local `@/` alias, and its styles use Emotion component selectors
 * that need the Emotion babel transform; all three come only from the app's
 * Vite config. Each stub keeps the props the bank screens rely on (disabled,
 * type, value, label, text) as plain DOM, so tests read what a user acts on.
 */
import {
  Children,
  cloneElement,
  FC,
  isValidElement,
  ReactElement,
  ReactNode,
} from "react"

type ChildrenProps = { children?: ReactNode }

export const ModalBody: FC<ChildrenProps> = ({ children }) => (
  <div>{children}</div>
)
export const Stack: FC<ChildrenProps> = ({ children }) => <div>{children}</div>
export const Flex: FC<ChildrenProps> = ({ children }) => <div>{children}</div>
export const FormField: FC<ChildrenProps & { error?: string }> = ({
  children,
  error,
}) => (
  <div>
    {children}
    {error && <span data-field-error="1">{error}</span>}
  </div>
)
export const Text: FC<ChildrenProps> = ({ children }) => <span>{children}</span>
export const Separator: FC = () => <hr />
export const Skeleton: FC = () => <i>skeleton</i>
export const Icon: FC = () => null

type ButtonProps = ChildrenProps & {
  onClick?: () => void
  disabled?: boolean
  type?: "submit" | "button"
}

export const Button: FC<ButtonProps> = ({
  children,
  onClick,
  disabled,
  type,
}) =>
  type === "submit" ? (
    <button type="submit" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ) : (
    <button type="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
export const LoadingButton = Button
export const TextButton = Button

export const Alert: FC<{ description: string }> = ({ description }) => (
  <p data-alert="1">{description}</p>
)

export const OptionCard: FC<{
  label: string
  onClick: () => void
  disabled?: boolean
}> = ({ label, onClick, disabled }) => (
  <button type="button" onClick={onClick} disabled={disabled}>
    {label}
  </button>
)

export const CopyButton: FC<{ text: string }> = ({ text }) => (
  <button type="button" data-copy={text}>
    copy
  </button>
)

export const Input: FC<Record<string, unknown>> = (props) => (
  <input {...props} />
)

type PickProps = { onPick?: (value: string) => void }

export const ToggleGroup: FC<
  ChildrenProps & { value: string; onValueChange: (value: string) => void }
> = ({ children, value, onValueChange }) => (
  <div data-toggle={value}>
    {Children.map(children, (child) =>
      isValidElement(child)
        ? cloneElement(child as ReactElement<PickProps>, {
            onPick: onValueChange,
          })
        : child,
    )}
  </div>
)

export const ToggleGroupItem: FC<
  ChildrenProps & PickProps & { value: string; disabled?: boolean }
> = ({ children, value, onPick, disabled }) => (
  <button
    type="button"
    data-toggle-item={value}
    disabled={disabled}
    onClick={() => onPick?.(value)}
  >
    {children}
  </button>
)

// ---- stage 3: the transaction review modal and summaries ----------------

export const Modal: FC<
  ChildrenProps & {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    topContent?: ReactNode
  }
> = ({ children, open, onOpenChange, topContent }) =>
  open ? (
    <div data-modal="1">
      {topContent}
      <button
        type="button"
        data-modal-close="1"
        onClick={() => onOpenChange?.(false)}
      >
        modal-close
      </button>
      {children}
    </div>
  ) : null
export const ModalHeader: FC<{ title?: string; description?: string }> = ({
  title,
}) => <h2>{title}</h2>
export const ModalFooter: FC<ChildrenProps> = ({ children }) => (
  <div>{children}</div>
)
export const ModalContentDivider: FC = () => <hr />
export const Stepper: FC<{ steps: string[]; activeStepIndex: number }> = ({
  steps,
  activeStepIndex,
}) => <ol data-step={steps[activeStepIndex]} />
export const SummaryRow: FC<{ label: ReactNode; content: ReactNode }> = ({
  label,
  content,
}) => (
  <div data-summary="1">
    {label}: {content}
  </div>
)
export const Toggle: FC = () => null
export const Spinner: FC = () => null
export const Image: FC = () => null
export const DEFAULT_AUTO_CLOSE_TIME = 5000
export const Notification: FC = () => null
