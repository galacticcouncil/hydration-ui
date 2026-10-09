import React from "react"
const Container = ({ children }) => <div>{children}</div>
export const Box = Container,
  Flex = Container,
  Stack = Container,
  Text = Container,
  AuthorizedAction = Container,
  Summary = Container,
  SummaryRowValue = Container,
  ModalBody = Container,
  ModalFooter = Container,
  CheckboxLabel = Container,
  Card = Container,
  CardHeader = Container,
  CardTitle = Container,
  Chip = Container
export const Icon = () => null,
  Scale = () => null,
  ShieldCheck = () => null,
  Separator = () => null,
  ModalContentDivider = () => null,
  TooltipIcon = () => null,
  AssetLogo = () => null
export const Alert = ({ title, description }) => (
  <div role="alert">
    {title} {description}
  </div>
)
export const SummaryRow = ({ label, content }) => (
  <div>
    {label}: {content}
  </div>
)
export const Tooltip = ({ text, children }) => (
  <div>
    {children}
    {text}
  </div>
)
export const Checkbox = ({ checked, onCheckedChange, name }) => (
  <input
    type="checkbox"
    name={name}
    checked={checked}
    onChange={(e) => onCheckedChange(e.target.checked)}
  />
)
export const getToken = () => ""
export const LoadingButton = ({
  children,
  disabled,
  type,
  onClick,
  "aria-label": label,
}) => (
  <button type={type} disabled={disabled} onClick={onClick} aria-label={label}>
    {children}
  </button>
)
export const AssetSelect = ({
  value,
  onChange,
  balance,
  amountError,
  displayValue,
}) => (
  <div>
    <input
      aria-label="Amount"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
    <button
      type="button"
      disabled={balance.isMaxDisabled}
      onClick={balance.onMax}
    >
      MAX
    </button>
    <div role="alert">{amountError}</div>
    <output>{displayValue}</output>
  </div>
)
export const AssetInput = AssetSelect

export const DateText = ({ date }) => <span>{date.toISOString()}</span>
export const PendingPosition = ({ value, stats, status }) => (
  <article>
    <span>{value}</span>
    {stats?.map(({ label, value }) => (
      <div key={label}>
        {label}: {value}
      </div>
    ))}
    {status}
  </article>
)
export const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <nav>
    <button
      disabled={currentPage === 1}
      onClick={() => onPageChange(currentPage - 1)}
    >
      Previous
    </button>
    <span>
      {currentPage} / {totalPages}
    </span>
    <button
      disabled={currentPage === totalPages}
      onClick={() => onPageChange(currentPage + 1)}
    >
      Next
    </button>
  </nav>
)

export const Button = LoadingButton
export const ExternalLink = Container
