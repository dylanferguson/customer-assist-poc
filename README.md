# Customer Assist PoC

A monorepo project with a Next.js frontend and NestJS API for customer assistance.

## Development Options

### Option 1: Using Dev Containers (Recommended)

This project is configured to use Development Containers, which provide a consistent development environment across different machines.

#### Prerequisites
- [Docker](https://www.docker.com/products/docker-desktop) installed
- [Visual Studio Code](https://code.visualstudio.com/) installed
- [Remote - Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) installed in VS Code

#### Steps
1. Open this repository in VS Code
2. Click the green icon in the bottom-left corner of VS Code
3. Select "Reopen in Container" from the menu
4. Wait for the container to build and start
5. The project will automatically install dependencies and start in development mode

For more information, see the [Dev Container README](.devcontainer/README.md).

### Option 2: Local Development

If you prefer to develop locally without containers:

#### Prerequisites
- Node.js 20.x or later
- npm 10.x or later

#### Steps
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

This will start both the frontend and API servers in development mode.

## Project Structure

- `/api` - NestJS backend API
- `/frontend` - Next.js frontend application

## To Do:
- Inbox
    - Overflow of inbox list
    - Truncation of subject