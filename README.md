# One Mohr UI Kit

A rigorous, accessible, and atomic component library built to serve as a **reference architecture for scalable React applications**.

This repository demonstrates a **“System-First”** approach to frontend development, prioritizing:

- strict type safety
- accessibility (WCAG)
- component composability

over quick-fix solutions and ad-hoc UI code.

---

## 🧠 Architectural Philosophy

### 1. Atomic Design & Scalability

The directory structure follows **Atomic Design** principles (`atoms`, `molecules`, `organisms`) to ensure a clear separation of concerns:

- **Atoms**  
  Pure, logic-less UI primitives (e.g. `Button`, `Badge`).

- **Molecules**  
  Compositions of atoms with **local state and behavior** (e.g. `SearchInput`).

- **Organisms**  
  More complex sections that can start to handle **business logic and layout** (e.g. `Hero`).

This hierarchy makes the system:

- easy to scale
- predictable to navigate
- safer to refactor over time

---

### 2. Design Token Governance with CVA

To solve the **“Tailwind Chaos”** problem at scale, the library uses  
[Class Variance Authority (CVA)](https://github.com/joe-bell/cva) for **variant management**.

**Why CVA?**

- Decouples styling logic from markup.
- Encodes variants (e.g. `intent`, `size`) in a **type-safe API**.
- Plays nicely with Tailwind without introducing runtime CSS-in-JS overhead.

**Benefits**

- **Type-safe class composition** with TypeScript.
- **Design tokens as code**: variants mirror your design system.
- **Zero runtime styling cost** compared to many CSS-in-JS solutions.

---

### 3. Polymorphism & Composition

Components are built to be **open for extension** and highly composable.

The `Button` component implements the **Slot pattern** (inspired by `@radix-ui/react-slot`) and supports an `asChild` prop.

**Use case examples:**

- Render a button as a semantic `<a>` tag  
  → for proper SEO and navigation.

- Render a button as a `Next.js <Link>`  
  → while preserving design system styling and a11y constraints.

This ensures:

- semantic correctness
- accessibility compliance
- consistent styling across different host components

---

## 🛠 Tech Stack

| Category  | Technology              | Reasoning                                                          |
|----------|-------------------------|--------------------------------------------------------------------|
| Core     | React 19, Next.js 16    | App Router architecture, modern SSR/ISR patterns                   |
| Language | TypeScript 5            | Strict mode for comprehensive type safety                          |
| Styling  | Tailwind CSS 4          | Utility-first styling; `tailwind-merge` to resolve class conflicts |
| Variants | CVA                     | Type-safe variants & design token mapping                          |
| Theming  | Next-Themes             | Seamless dark mode integration with app-wide context               |
| Docs     | Storybook 10            | Single source of truth for visual docs and component playground    |
| Testing  | Vitest 4                | Fast unit tests for logic & interaction flows                      |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** `>= 18`
- **npm**

### Installation

Clone the repository:

```bash
git clone https://github.com/patrickmohr/one-mohr-ui-kit.git
cd one-mohr-ui-kit
```

### Install dependencies
(--legacy-peer-deps currently required due to Storybook 10 edge adoption):
```bash
npm install --legacy-peer-deps
```

### 🧪 Development Workflows
1. Component Workbench (Storybook)

We use Storybook as the primary environment for building and testing components in isolation.
```bash
npm run storybook
```
Then open:

http://localhost:6006

Enabled features:
- Controls
- Actions
- Accessibility audit

2. Application Preview (Next.js)

To see how components look and behave in an actual Next.js App Router context:

```bash
npm run dev
```
This boots up the example app that consumes the design system components.

3. Quality Assurance

Run the test suite to verify component logic, rendering, and basic interaction flows:
```bash
npm test
```

### 📦 Project Structure
```
src/
├── app/                  # Next.js App Router (Consumption Layer)
├── components/           # The Design System Core
│   ├── atoms/            # Primitives (Button, Badge, etc.)
│   ├── molecules/        # Interactive groups (SearchInput, etc.)
│   └── organisms/        # Sectional layouts (Hero, etc.)
├── lib/
│   └── utils.ts          # CN (classNames) helper for Tailwind merging
└── ...config files
```

### 🔮 Future Roadmap
#### Theming Engine

Integrate next-themes for robust dark/light mode toggling
without hydration mismatches.

#### NPM Publishing

Configure tsup to bundle and ship the library as a private package:
@mohr/ui.

#### Visual Regression

Integrate Chromatic to automate visual regression testing and
create fast, async UI feedback loops in CI.

---

Authored by
Patrick Mohr