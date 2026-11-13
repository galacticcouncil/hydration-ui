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
