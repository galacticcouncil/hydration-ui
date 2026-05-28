import type { Meta, StoryObj } from "@storybook/react-vite"

import { Paper } from "@/components/Paper"

import { Prose } from "./Prose"

type Story = StoryObj<typeof Prose>

export default {
  component: Prose,
} satisfies Meta<typeof Prose>

const SAMPLE_JS = `function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("world"));`

const Template = (args: Story["args"]) => (
  <Paper maxWidth="42rem" mx="auto" p="xl" asChild>
    <Prose {...args}>
      <h1>H1 - Lorem Ipsum Dolor Sit Amet</h1>

      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.{" "}
        <a href="#">This is a text link</a> inside a paragraph.{" "}
        <strong>Strong text</strong>, <em>italic text</em>, and{" "}
        <code>inlineCode()</code> should all render correctly.
      </p>

      <h2>H2 - Consectetur Adipiscing Elit</h2>

      <p>
        Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut{" "}
        enim ad minim veniam, quis nostrud exercitation ullamco laboris.
      </p>

      <h3>H3 - Quis nostrud exercitation</h3>
      <h4>H4 - Nested Section Heading</h4>
      <h5>H5 - Small Heading Variant</h5>
      <h6>H6 - Tiny Heading Variant</h6>

      <p>
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
        dolore eu fugiat nulla pariatur.
      </p>

      <hr />

      <h2>Blockquote</h2>

      <blockquote>
        <p>
          “Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
          posuere erat a ante.”
        </p>
      </blockquote>

      <h2>Unordered List</h2>

      <ul>
        <li>Lorem ipsum dolor sit amet</li>
        <li>Consectetur adipiscing elit</li>
        <li>
          Nested List
          <ul>
            <li>Nested item one</li>
            <li>Nested item two</li>
          </ul>
        </li>
        <li>Sed do eiusmod tempor</li>
      </ul>

      <h2>Ordered List</h2>

      <ol>
        <li>First ordered item</li>
        <li>Second ordered item</li>
        <li>Third ordered item</li>
      </ol>

      <h2>Code Block</h2>

      <pre>
        <code className="language-js">{SAMPLE_JS}</code>
      </pre>

      <h2>Table Example</h2>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>John Doe</td>
            <td>Developer</td>
            <td>Active</td>
          </tr>
          <tr>
            <td>Jane Smith</td>
            <td>Designer</td>
            <td>Pending</td>
          </tr>
          <tr>
            <td>Alex Johnson</td>
            <td>Manager</td>
            <td>Offline</td>
          </tr>
        </tbody>
      </table>

      <h2>Image Example</h2>

      <figure>
        <img src="https://placehold.co/1200x600" alt="Placeholder image" />
        <figcaption>Figure caption lorem ipsum dolor sit amet.</figcaption>
      </figure>
    </Prose>
  </Paper>
)

export const Default: Story = {
  render: Template,
}

export const Muted: Story = {
  render: Template,
  args: {
    muted: true,
  },
}

export const Small: Story = {
  render: Template,
  args: {
    size: "small",
  },
}

export const Large: Story = {
  render: Template,
  args: {
    size: "large",
  },
}
