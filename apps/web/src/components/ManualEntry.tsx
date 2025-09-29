'use client';

import { useState } from 'react';
import { ScanResult } from '@recalllens/core';

interface ManualEntryProps {
  onResult: (result: ScanResult) => void;
}

export function ManualEntry({ onResult }: ManualEntryProps) {
  const [formData, setFormData] = useState({
    upc: '',
    brand: '',
    product: '',
    lot: '',
    expiry: '',
  });

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const result: ScanResult = {
      upc: formData.upc || undefined,
      brand: formData.brand || undefined,
      product: formData.product || undefined,
      lot: formData.lot || undefined,
      expiry: formData.expiry || undefined,
    };
    
    onResult(result);
  };

  const handleClear = () => {
    setFormData({
      upc: '',
      brand: '',
      product: '',
      lot: '',
      expiry: '',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Manual Product Entry
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* UPC Field */}
        <div>
          <label htmlFor="upc" className="block text-sm font-medium text-gray-700 mb-1">
            UPC/Barcode (optional)
          </label>
          <input
            type="text"
            id="upc"
            value={formData.upc}
            onChange={(e) => handleInputChange('upc', e.target.value)}
            placeholder="Enter 8, 12, or 13 digit barcode"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Brand Field */}
        <div>
          <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
            Brand (optional)
          </label>
          <input
            type="text"
            id="brand"
            value={formData.brand}
            onChange={(e) => handleInputChange('brand', e.target.value)}
            placeholder="Enter brand name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Product Field */}
        <div>
          <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-1">
            Product Name (optional)
          </label>
          <input
            type="text"
            id="product"
            value={formData.product}
            onChange={(e) => handleInputChange('product', e.target.value)}
            placeholder="Enter product name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Lot Code Field */}
        <div>
          <label htmlFor="lot" className="block text-sm font-medium text-gray-700 mb-1">
            Lot Code (optional)
          </label>
          <input
            type="text"
            id="lot"
            value={formData.lot}
            onChange={(e) => handleInputChange('lot', e.target.value)}
            placeholder="Enter lot code or batch number"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Expiry Date Field */}
        <div>
          <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-1">
            Expiry Date (optional)
          </label>
          <input
            type="text"
            id="expiry"
            value={formData.expiry}
            onChange={(e) => handleInputChange('expiry', e.target.value)}
            placeholder="MM/DD/YYYY or MM-DD-YYYY"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            className="flex-1 btn btn-primary"
            disabled={!formData.upc && !formData.brand && !formData.product}
          >
            Check for Recalls
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="flex-1 btn btn-secondary"
          >
            Clear
          </button>
        </div>
      </form>

      {/* Help Text */}
      <div className="mt-4 text-sm text-gray-500">
        <p className="mb-2">
          <strong>Tip:</strong> Enter at least one field to check for recalls. More information provides better accuracy.
        </p>
        <ul className="space-y-1 text-xs">
          <li>• UPC: 8, 12, or 13 digit barcode number</li>
          <li>• Brand: Manufacturer or brand name</li>
          <li>• Product: Specific product name or description</li>
          <li>• Lot Code: Batch number, lot number, or serial number</li>
          <li>• Expiry: Best by, use by, or expiration date</li>
        </ul>
      </div>
    </div>
  );
}
