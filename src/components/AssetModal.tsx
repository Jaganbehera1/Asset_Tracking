import React, { useState } from 'react';
import { Check, X } from 'lucide-react';

interface AssetModalProps {
  assetId: string;
  onSubmit: (type: 'entry' | 'exit', location: 'office' | 'client', remarks: string) => void;
  onClose: () => void;
}

export const AssetModal: React.FC<AssetModalProps> = ({ assetId, onSubmit, onClose }) => {
  const [type, setType] = useState<'entry' | 'exit'>('entry');
  const [location, setLocation] = useState<'office' | 'client'>('office');
  const [remarks, setRemarks] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(type, location, remarks);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Asset Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <p className="text-gray-600">Asset ID: {assetId}</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setType('entry')}
                className={`flex-1 py-2 px-4 rounded-md ${
                  type === 'entry'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Entry
              </button>
              <button
                type="button"
                onClick={() => setType('exit')}
                className={`flex-1 py-2 px-4 rounded-md ${
                  type === 'exit'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Exit
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setLocation('office')}
                className={`flex-1 py-2 px-4 rounded-md ${
                  location === 'office'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Office
              </button>
              <button
                type="button"
                onClick={() => setLocation('client')}
                className={`flex-1 py-2 px-4 rounded-md ${
                  location === 'client'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Client Site
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remarks
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <Check className="w-4 h-4 mr-2" />
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};