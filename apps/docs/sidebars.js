// @ts-check
// Sidebar for the famtree docs. Manually curated so ordering is intentional
// and generated reference pages slot in predictably.

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docsSidebar: [
    "intro",
    {
      type: "category",
      label: "Guides",
      collapsed: false,
      items: [
        "guides/getting-started",
        "guides/document",
        "guides/rendering",
        "guides/packages",
        "guides/contributing",
      ],
    },
    {
      type: "category",
      label: "Reference",
      collapsed: false,
      items: ["reference/schema", "reference/cli"],
    },
  ],
}

export default sidebars
