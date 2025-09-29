# RecallLens Setup Guide

## Prerequisites

Before setting up RecallLens, ensure you have the following installed:

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download here](https://git-scm.com/)

## Quick Setup

### 1. Install Dependencies

```bash
# Install all dependencies for the monorepo
npm install
```

### 2. Build Core Packages

```bash
# Build the core package first
cd packages/core
npm run build
cd ../..

# Build the fetchers package
cd packages/fetchers
npm run build
cd ../..
```

### 3. Fetch Sample Data

```bash
# Fetch recall data from FDA (this will create sample data)
npm run fetch-data
```

### 4. Start Development Server

```bash
# Start the Next.js development server
npm run dev
```

### 5. Open in Browser

Navigate to `http://localhost:3000` in your browser.

## Troubleshooting

### Camera Not Working

- Ensure you're using HTTPS (required for camera access)
- Check browser permissions for camera access
- Try using the manual entry feature instead

### Build Errors

- Make sure all dependencies are installed: `npm install`
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 18+)

### Data Fetching Issues

- Check your internet connection
- Verify API endpoints are accessible
- Check console for error messages

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Lint code
npm run lint

# Format code
npm run format

# Fetch new data
npm run fetch-data
```

## Project Structure

```
recalllens/
├── apps/web/           # Next.js PWA application
├── packages/
│   ├── core/          # Shared utilities and types
│   ├── fetchers/      # Data ingestion scripts
│   └── fixtures/      # Test data
├── docs/              # Documentation
└── README.md          # This file
```

## Next Steps

1. **Test the app** - Try scanning a barcode or using manual entry
2. **Read the docs** - Check out `/docs/spec.md` for detailed specifications
3. **Customize** - Modify the UI, add new data sources, or extend functionality
4. **Deploy** - Follow the deployment guide in the README

## Need Help?

- Check the [documentation](docs/)
- Open an [issue](https://github.com/your-org/recalllens/issues)
- Join the [discussions](https://github.com/your-org/recalllens/discussions)
