# Node.js Express TypeScript Project Setup
This guide explains how to set up and work with a Node.js + Express project using TypeScript, ESLint, Jest, Husky, and other development tools.

## Prerequisites
Make sure the following tools are installed on your system:
- Node.js (v16 or higher recommended)
- npm or yarn
- Git (for Husky hooks to work)

## Folder Structure
Typical structure after setup:
```
├── src/
│── server.ts             # Entry point
├── dist/                 # Compiled JS output
├── .eslintrc.js          # ESLint config
├── tsconfig.json         # TypeScript config
├── jest.config.js        # Jest config
├── .husky/               # Git hooks
├── package.json
├── .env
└── README.md
```
## environment variables

- PORT
- MONGODB_URL


## Installation
```sh
npm install
```

## Run Tests
```sh
npm test
```
Executes tests using Jest.

## Git Hooks (Husky)
```sh
npm run prepare
```
Initializes Husky to add Git hooks (e.g., pre-commit for linting/tests).

## Start the Project
```sh
npm start
```
Runs the app using ts-node (development mode, TypeScript directly).

## Development Mode with Auto Reload
```sh
npm run dev
```
Starts the app with nodemon watching for file changes.
