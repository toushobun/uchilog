<p align="right">
  <a href="./README.md">简体中文</a> |
  <a href="./README.ja.md">日本語</a> |
  English
</p>

# UchiLog

UchiLog is a merchant-first, multilingual family budgeting PWA for Chinese, Japanese, and English users. It is used to track and visualize income, expenses, accounts, transfers, categories, and shared household spending.

This repository also serves as a record of the personal development process.
The project is currently in the MVP development stage.

## Overview

UchiLog aims to be a practical merchant-first budgeting app for everyday household use.

Many budgeting apps organize spending primarily by category. In real household use, however, "where the money was spent" is often the most natural way to review daily expenses. UchiLog treats merchants as a key entry point, so users can review spending records, category distribution, and spending trends around each merchant.

Initial goals:

- Quickly record daily expenses and income
- Use merchants as a primary entry point for reviewing spending
- Manage cash, bank accounts, credit cards, and digital wallets
- Manage expense and income categories
- Support multiple expense categories under the same merchant
- Support shared bookkeeping among family members
- Prioritize the daily mobile experience
- Keep features clear and avoid the common complexity of budgeting apps

## Tech Stack

- Next.js App Router
- TypeScript
- React
- MUI
- Supabase
- PostgreSQL
- Supabase Auth
- Vitest
- Storybook
- GitHub Actions

## Development Status

The project is currently in the MVP development stage.

Implemented so far:

- Email / password authentication
- Basic App Shell after login
- Initial household ledger setup
- Basic account management
- Account holder management (assign holders when creating/editing accounts)
- Basic merchant management
- Merchant alias schema and search support
- Local development seed data
- Vitest / Storybook / GitHub Actions CI

Planned next:

- Minimal transaction creation flow
- Transaction list
- Category management improvements
- Account holder experience improvements
- Merchant-based spending summaries and trend analysis
- Basic summaries and charts
- PWA setup
- Deployment documentation

## Local Development

```bash
npm install
npx supabase start
npm run dev
```

## Language

Requirements, Issues, and development notes are currently managed mainly in Chinese.
Code, directory names, variable names, and technical identifiers are written in English.
