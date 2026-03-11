# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 16 app (App Router) with React 19, TypeScript, and Tailwind CSS v4.

## Commands

- `npm run dev` — Start dev server (http://localhost:3000)
- `npm run build` — Production build
- `npm run start` — Serve production build
- `npm run lint` — ESLint (flat config, Next.js core-web-vitals + TypeScript rules)

## Architecture

- **App Router**: All routes live in `app/`. Uses `layout.tsx` for root layout and `page.tsx` for pages.
- **Styling**: Tailwind CSS v4 via `@tailwindcss/postcss` plugin. Theme tokens defined in `app/globals.css` using `@theme inline` directive. Custom CSS variables for `--background`, `--foreground` with dark mode via `prefers-color-scheme`.
- **Fonts**: Geist Sans and Geist Mono loaded via `next/font/google`, exposed as CSS variables `--font-geist-sans` and `--font-geist-mono`.
- **Path aliases**: `@/*` maps to project root (configured in `tsconfig.json`).
