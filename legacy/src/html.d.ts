declare namespace JSX {
  interface ExtendedHtml
    extends React.DetailedHTMLProps<
      React.HtmlHTMLAttributes<HTMLHtmlElement>,
      HTMLHtmlElement
    > {
    theme?: "bsx" | "hdx"
  }

  interface IntrinsicElements {
    html: ExtendedHtml
  }
}
