<p align="right">
  <a href="./README.md">简体中文</a> |
  <a href="./README.ja.md">日本語</a> |
  English
</p>

# UchiLog

UchiLog is a merchant-first multilingual family budgeting PWA for Chinese, Japanese, and English users. It is used to record and visualize income, expenses, accounts, transfers, categories, and shared household spending, helping families understand which merchants they spend money at, what categories are involved for each merchant, and how daily spending is shared among family members.

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

This project currently manages requirements, Issues, and development notes mainly in Chinese.
Code, directory names, variable names, and technical identifiers are written in English.

## Current Development Status

The project is currently in the early MVP development stage.

Implemented:

- Project development rules documentation
- Initial app screen design direction
- MVP database structure design
- Supabase local development environment setup
- Supabase initial database migration
- Next.js app foundation
- MUI ThemeProvider basic configuration
- Supabase Auth email/password login
- Protected pages after authentication
- Basic App Shell after login
- Current ledger initialization / ledger selection foundation
- Basic account management
- Account holder management (assign holders when creating/editing accounts)
- Basic merchant management
- Merchant alias schema and basic search support
- Local development seed data
- Vitest unit test infrastructure
- Storybook infrastructure
- GitHub Actions CI
- Storybook build CI

Not yet implemented:

- Minimal transaction creation flow
- Transaction list
- Category management improvements
- Account holder experience improvements
- Merchant-based spending summaries and trend analysis
- Data summaries and charts
- PWA setup
- Production deployment

## Tech Stack

### Frontend

- Next.js App Router
- TypeScript
- React
- MUI

### Backend / Database

- Supabase
- PostgreSQL
- Supabase Auth
- Row Level Security design

### Development Tools

- GitHub Issues
- GitHub Pull Requests
- GitHub Actions
- Supabase CLI
- Figma
- Vitest
- Storybook

## Implemented Features

### Authentication

- Email/password login
- Logout
- Redirect to login page when accessing protected pages while unauthenticated
- Redirect to Dashboard when accessing login page while authenticated

### App Shell

- Basic App Shell after login
- Top bar
- Current logged-in user display
- Bottom navigation
- Dashboard placeholder page
- Transaction placeholder page
- Category placeholder page

### Ledger

- Fetch the current user's ledger after login
- Redirect to ledger initialization page if no ledger exists
- Create initial ledger
- Basic ledger list page

### Account Management

- Account list for current ledger
- Add account
- Edit basic account information
- Archive account
- Account holder selection
- Manage holders when creating/editing accounts
- Account type display
- Amount formatting display
- Basic account display component
- Account component Storybook story

### Merchant Management

- Merchant list for current ledger
- Add merchant
- Edit basic merchant information
- Archive merchant
- Merchant alias schema
- Add merchant alias
- Archive merchant alias
- Basic merchant name / alias search support
- Merchants serve as the primary entry point for spending records and future analytics

### Local Development Data

- `supabase/seed.sql`
- Local test users
- Household ledger seed
- Account seed
- Merchant and merchant alias seed
- Basic category seed

### Engineering

- GitHub Actions CI
  - Automatic checks on Pull Requests
  - Automatic checks on main branch updates
  - Type check
  - Format check
  - Lint
  - Test
  - Build
  - Storybook build
- Local development tools
  - Prettier
  - Vitest
  - Storybook

## Development Roadmap

Current planned order:

1. Define project development rules
2. Design initial app screens
3. Design MVP database structure
4. Implement initial database migration
5. Initialize Next.js app
6. Implement email/password login
7. Add GitHub Actions CI
8. Implement basic App Shell after login
9. Implement current ledger initialization / ledger selection
10. Implement basic account management
11. Implement basic merchant management
12. Add local seed data
13. Add unit tests and CI
14. Add Storybook and CI
15. Improve category management page
16. Implement minimal transaction creation flow
17. Implement transaction list
18. Improve account holder experience
19. Implement basic summaries and analytics
20. Configure PWA
21. Document deployment

## Local Development

### Prerequisites

Required:

- Node.js 20 or higher
- npm
- Docker
- Supabase CLI

### Install Dependencies

```bash
npm install
```

To install strictly according to `package-lock.json`:

```bash
npm ci
```

### Start Local Supabase

```bash
npx supabase start
```

Check local Supabase status:

```bash
npx supabase status
```

Supabase Studio default address:

```text
http://127.0.0.1:54323
```

### Environment Variables

Copy the environment variable template:

```bash
cp .env.example .env.local
```

Then fill in `.env.local` based on your local Supabase output.

Example:

```text
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-local-publishable-key
```

`.env.local` is for local development only and should not be committed to the repository.

### Local Test Users

Running `npx supabase db reset` will automatically execute `supabase/seed.sql` and create local test users.

Login credentials:

```text
Email: local@example.test
Password: password123

Email: local2@example.test
Password: password123
```

The seed also creates household ledger, account, merchant, merchant alias, and basic category data for immediate UI testing after a reset.

To manually view or adjust local Auth users, open Supabase Studio:

```text
http://127.0.0.1:54323
```

### Reset Local Database

```bash
npx supabase db reset
```

If stale login state remains in the browser after a reset, you may encounter refresh token errors. Simply log in again.

### Start Next.js Development Server

```bash
npm run dev
```

Open in browser:

```text
http://localhost:3000
```

### Start Storybook and Review Components

```bash
npm run storybook
```

Open Storybook:

```text
http://localhost:6006
```

## Common Commands

### Start development server

```bash
npm run dev
```

### Run format check

```bash
npm run format:check
```

### Auto format

```bash
npm run format
```

### Run lint

```bash
npm run lint
```

### Run unit tests

```bash
npm run test
```

### Run build

```bash
npm run build
```

### Start Storybook development server

```bash
npm run storybook
```

### Run Storybook build

```bash
npm run build-storybook
```

### Reset local Supabase database and run seed

```bash
npx supabase db reset
```

## Development Workflow

This project follows an Issue-first development approach.

Basic flow:

1. Create or select a GitHub Issue
2. Create a branch for the Issue
3. Develop in the new branch
4. Run local checks
5. Create a Pull Request
6. Wait for GitHub Actions CI to pass
7. Merge the PR after review

Branch name examples:

```text
feature/16_implement_authenticated_app_shell
docs/18_update_public_readme
chore/14_add_github_actions_ci
```

Commit message examples:

```text
feat: implement basic App Shell after login
docs: update public repository README
chore: add GitHub Actions CI
```

## Screenshots

Screenshots will be added once the MVP UI is stable.

Planned:

- Login page
- App Shell after login
- Dashboard
- Account management page
- Merchant management page
- Category management page
- Transaction creation page
- Transaction list page

## Portfolio Notes

This project is not just a budgeting app — it also serves as a showcase of the process of building a small web product from scratch.

Key areas demonstrated:

- Requirements breakdown
- Issue-driven development
- Database structure design
- Supabase Auth integration
- Row Level Security design
- Protected route design
- Frontend App Shell design
- Basic account and merchant management
- Local seed data design
- Unit test infrastructure
- Storybook component showcase
- CI configuration
- MVP iteration process

The project is still under development, so Issues, PRs, and Commit history will continue to accumulate in the repository.

## Public Repository Notes

This repository is intended to document the development process and showcase the project implementation.

Local environment variable files, real user data, and personal budgeting data will not be committed to the repository.

## License

No license has been selected yet.
