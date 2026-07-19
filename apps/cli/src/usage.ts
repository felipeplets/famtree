// famtree CLI usage / help text.

const HELP = `famtree — render a genogram JSON document to SVG

Usage:
  famtree [input.json] [options]

Arguments:
  input.json            Path to a genogram document. Reads stdin if omitted or "-".

Options:
  -o, --output <file>   Write SVG to <file>. Writes stdout if omitted.
  -t, --title <title>   Override the document title.
      --validate        Validate the document against the schema before rendering.
  -h, --help            Show this help.
  -v, --version         Show the version.

Examples:
  famtree family.json -o family.svg
  cat family.json | famtree > family.svg
  famtree family.json --validate -o family.svg
`

export { HELP }
