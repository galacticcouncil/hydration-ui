export function Tab(props: {
  value: string
  active: boolean
  label: string
  onChange: (e: any) => void
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
      />
      <label htmlFor={props.value}>{props.label}</label>
    </>
  )
}
