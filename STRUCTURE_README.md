# nurospace

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines Next.js, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **Next.js** - Full-stack React framework
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **shadcn/ui** - Reusable UI components
- **Turborepo** - Optimized monorepo build system
- **Biome** - Linting and formatting
- **Husky** - Git hooks for code quality

## Getting Started

First, install the dependencies:

```bash
bun install
```


Then, run the development server:

```bash
bun dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to see the web application.


## Project Structure

```
nurospace/
├── apps/
│   ├── web/         # Frontend application (Next.js + Tailwind + Shadcn)
│   ├── dashboard/   # Frontend main dashboard ( vite + tailwind + tanstack router) 
│   ├── api/         # Backend application (Nest.js + Fastify)
```

## Available Scripts

- `bun dev`: Start all applications in development mode
- `bun build`: Build all applications
- `bun dev:web`: Start only the web application
- `bun check-types`: Check TypeScript types across all apps
- `bun check`: Run Biome formatting and linting
