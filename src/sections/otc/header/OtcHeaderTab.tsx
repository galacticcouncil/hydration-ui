export function Tab(props: {
  value: string
  active: boolean
  label: string
  onChange: (e: any) => void
  disabled: boolean
}) {
  return (
    <>
      <input
        type="radio"
        name="filter"
        value={props.value}
        id={props.value}
        checked={props.active}
        onChange={props.onChange}
        disabled={props.disabled}
      />
      <label htmlFor={props.value}>{props.label}</label>
    </>
  )
}
