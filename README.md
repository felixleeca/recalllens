# RecallLens

RecallLens is a web app that allows users to scan product barcodes and instantly check for recalls.

## Features

- 📱 **Barcode Scanning**: Point camera at UPC/EAN barcodes for instant recall checking
- 🔍 **Manual Entry**: Enter product details manually if camera isn't available
- 🚦 **Traffic Light System**: Clear Green/Yellow/Red indicators for recall status
- 📊 **Official Sources**: Data from FDA, FSIS, and CPSC APIs
- 🔄 **Offline Support**: Works offline with cached recall data
- ⚡ **Fast Results**: Get results in under 1.5 seconds
- 🔒 **Privacy-First**: No personal data stored, all processing done locally

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Modern web browser with camera support
- HTTPS connection (required for camera access)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/recalllens.git
   cd recalllens
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the core packages**
   ```bash
   npm run build
   ```

4. **Fetch recall data**
   ```bash
   npm run fetch-data
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   Navigate to `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
recalllens/
├── apps/
│   └── web/                 # Next.js PWA application
├── packages/
│   ├── core/               # Shared types, utilities, matching logic
│   ├── fetchers/           # Data ingestion from government APIs
│   └── fixtures/           # Test data and sample images
├── docs/                   # Documentation
└── .github/workflows/      # CI/CD pipelines
```

## Data Sources

### FDA (Food and Drug Administration)
- **API**: openFDA Food Enforcement API
- **Coverage**: Food, drugs, cosmetics, medical devices
- **Update Frequency**: Weekly
- **Data Range**: 2004-present

### FSIS (Food Safety and Inspection Service)
- **API**: FSIS Recall API
- **Coverage**: Meat, poultry, egg products
- **Update Frequency**: Daily

### CPSC (Consumer Product Safety Commission)
- **API**: CPSC Recall API
- **Coverage**: Consumer products, toys, appliances
- **Update Frequency**: Daily

## How It Works

### 1. Barcode Scanning
- Camera detects UPC/EAN barcodes
- @zxing/library processes barcode data
- Optional OCR for lot codes and expiry dates

### 2. Data Matching
- **Tier 1**: Exact UPC match with lot/date validation
- **Tier 2**: Brand + product fuzzy matching
- **Tier 3**: Category-level matching with verification

### 3. Result Display
- **🟢 GREEN**: No recalls found
- **🟡 YELLOW**: Similar product recalled, verify details
- **🔴 RED**: Product is recalled, follow official notice

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run unit tests
- `npm run lint` - Run ESLint
- `npm run fetch-data` - Update recall data

### Data Management

```bash
# Fetch data from all sources
npm run fetch-data

# Fetch from specific source
cd packages/fetchers
npm run fetch:fda
npm run fetch:fsis
npm run fetch:cpsc

# Validate data files
npm run validate -- --directory public/data
```

### Adding New Data Sources

1. Create fetcher in `packages/fetchers/src/[source]/`
2. Implement `fetcher.ts` and `normalize.ts`
3. Add to CLI in `packages/fetchers/src/cli.ts`
4. Update types in `packages/core/src/schemas/recall.ts`

## Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Manual Testing
- Test with various barcode types (UPC-A, EAN-13, EAN-8)
- Test offline functionality
- Test on different devices and browsers

## Deployment

### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `apps/web/.next`
4. Deploy automatically on push

### Netlify
1. Connect GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `apps/web/.next`
4. Add redirects for SPA routing

### Manual Deployment
1. Build the application: `npm run build`
2. Upload `apps/web/.next` to your web server
3. Configure HTTPS and PWA headers
4. Set up data fetching cron job

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style
- Use TypeScript for all new code
- Follow ESLint configuration
- Write tests for new features
- Update documentation as needed

## Privacy & Security

- **No Personal Data**: Only anonymous usage statistics
- **Local Processing**: All matching done client-side
- **No Image Storage**: Camera frames processed in memory
- **HTTPS Only**: All communications encrypted
- **Opt-in Analytics**: Clear consent for data collection

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This tool provides informational recall data for convenience only. Always refer to official recall notices for the most current and accurate information. When in doubt, contact the manufacturer or retailer directly.

## Support

- 📖 [Documentation](docs/)
- 🐛 [Report Issues](https://github.com/your-org/recalllens/issues)
- 💬 [Discussions](https://github.com/your-org/recalllens/discussions)
- 📧 [Contact](mailto:support@recalllens.app)

## Acknowledgments

- [openFDA](https://open.fda.gov/) for food recall data
- [FSIS](https://www.fsis.usda.gov/) for meat/poultry recall data
- [CPSC](https://www.cpsc.gov/) for consumer product recall data
- [@zxing/library](https://github.com/zxing-js/library) for barcode scanning
- [Tesseract.js](https://tesseract.projectnaptha.com/) for OCR functionality

