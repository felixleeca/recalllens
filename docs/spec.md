# RecallLens Product Specification

## Overview

RecallLens is a Progressive Web App (PWA) that allows users to scan product barcodes and instantly check for recalls from official government sources.

## Core Value Proposition

**"Scan it. If it's recalled, know in seconds."**

## Primary Users

- Families shopping for groceries and household products
- Students and school staff checking food safety
- Health-conscious consumers
- Anyone concerned about product safety

## Core User Flows

### 1. Barcode Scanning Flow
1. Open app → Camera activates automatically
2. Point camera at UPC/EAN barcode on product
3. App automatically detects and reads barcode
4. System queries recall databases
5. Display traffic light result (Green/Yellow/Red)
6. Show detailed recall information if applicable

### 2. Manual Entry Flow
1. User taps "Manual Entry" button
2. Fill in product details (UPC, brand, product name, lot code, expiry date)
3. Submit form to check for recalls
4. Display results with same traffic light system

### 3. Results Interpretation
- **GREEN**: No recalls found for this product
- **YELLOW**: Similar product recalled, but lot/date doesn't match - verify details
- **RED**: Exact match found - product is recalled

## Data Sources

### FDA (Food and Drug Administration)
- **Source**: openFDA Food Enforcement API
- **Coverage**: Food, drugs, cosmetics, medical devices
- **Update Frequency**: Weekly
- **Data Range**: 2004-present
- **Key Fields**: UPC codes, lot numbers, brand names, product descriptions

### FSIS (Food Safety and Inspection Service)
- **Source**: FSIS Recall API
- **Coverage**: Meat, poultry, egg products
- **Update Frequency**: Daily
- **Key Fields**: Brand names, product descriptions, lot codes

### CPSC (Consumer Product Safety Commission)
- **Source**: CPSC Recall API
- **Coverage**: Consumer products, toys, appliances
- **Update Frequency**: Daily
- **Key Fields**: Model numbers, serial numbers, brand names

## Technical Architecture

### Frontend (PWA)
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Barcode Scanning**: @zxing/library
- **OCR**: Tesseract.js (WASM)
- **Offline Storage**: IndexedDB via idb

### Backend/Data Processing
- **Data Fetching**: Node.js scripts
- **Normalization**: Custom parsers for each source
- **Storage**: JSON files with versioning
- **Caching**: Service Worker with stale-while-revalidate

### Matching Engine
- **Tier 1**: Exact UPC match + lot/date validation
- **Tier 2**: Brand + product fuzzy matching
- **Tier 3**: Category-level matching with verification prompts

## Data Schema

```typescript
interface RecallRecord {
  id: string;                 // Source-native ID
  source: 'fda' | 'fsis' | 'cpsc';
  brand: string[];            // Normalized brand names
  product: string;            // Normalized product name
  upcs: string[];             // UPC/EAN codes
  lotRegex?: string[];        // Lot code patterns
  expiration?: {              // Date ranges
    start?: string;
    end?: string;
  };
  hazard: string;             // Risk description
  actions: string[];          // Consumer actions
  jurisdictions?: string[];   // Geographic scope
  links: {                    // Official links
    official: string;
    manufacturer?: string;
  };
  published: string;          // ISO date
  updated?: string;           // ISO date
  status?: 'ongoing' | 'terminated' | 'unknown';
}
```

## Privacy & Security

### Data Handling
- **No image storage**: Camera frames processed in memory only
- **No personal data**: Only anonymous usage statistics
- **Local processing**: All matching done client-side
- **HTTPS only**: All communications encrypted

### User Consent
- Camera permission required for scanning
- Optional telemetry with clear opt-in
- Clear data usage disclosure

## Performance Targets

### Speed
- **Barcode detection**: < 300ms
- **OCR processing**: < 800ms
- **Recall matching**: < 200ms
- **Total scan-to-result**: < 1.5 seconds

### Offline Capability
- **Core functionality**: Works offline with cached data
- **Data freshness**: Background updates when online
- **Cache size**: < 50MB total

### Accessibility
- **Screen readers**: Full support
- **Keyboard navigation**: Complete
- **High contrast**: Supported
- **Large text**: Responsive design

## Non-Goals (v1)

- Medical advice or diagnosis
- User accounts or profiles
- Vehicle recalls (NHTSA)
- International recall sources
- Social features or sharing
- Payment processing

## Success Metrics

### User Engagement
- Scans per session
- Return usage rate
- Time to result

### Accuracy
- False positive rate < 5%
- False negative rate < 2%
- User verification rate

### Performance
- App load time < 3 seconds
- Offline functionality rate > 95%
- PWA installation rate > 20%

## Future Enhancements (Post-MVP)

- Batch scanning mode
- Multilingual support
- AR lot code detection
- Push notifications for new recalls
- Integration with shopping lists
- Manufacturer direct integration
