import React, { useState } from 'react';
import { Check, X } from 'lucide-react';

interface AssetModalProps {
  assetId: string;
  onSubmit: (
    type: 'entry' | 'exit',
    location: 'office' | 'client',
    remarks: string,
    name: string,
    model: string,
    condition: 'working' | 'damaged'
  ) => void;
  onClose: () => void;
  // Optional: set initial type (entry|exit) when opening modal
  initialType?: 'entry' | 'exit';
  // Optional: force the choice (user cannot change type when true)
  forceType?: boolean;
  // Optional initial values for name/model/condition when modal opens
  initialName?: string;
  initialModel?: string;
  initialCondition?: 'working' | 'damaged';
}

export const AssetModal: React.FC<AssetModalProps> = ({ assetId, onSubmit, onClose, initialType = 'entry', forceType = false, initialName = '', initialModel = '', initialCondition = 'working' }) => {
  const [type, setType] = useState<'entry' | 'exit'>(initialType);
  const [location, setLocation] = useState<'office' | 'client'>('office');
  const [remarks, setRemarks] = useState('');
  const [name, setName] = useState(initialName);
  const [model, setModel] = useState(initialModel);
  const [condition, setCondition] = useState<'working' | 'damaged'>(initialCondition);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Asset name is required';
    if (!model.trim()) newErrors.model = 'Model number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(type, location, remarks, name, model, condition);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md overflow-auto max-h-[90vh]">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Asset Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors({ ...errors, name: '' });
              }}
              className={`w-full px-3 py-2 border ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter asset name"
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => {
                setModel(e.target.value);
                setErrors({ ...errors, model: '' });
              }}
              className={`w-full px-3 py-2 border ${
                errors.model ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter model number"
            />
            {errors.model && <p className="mt-1 text-sm text-red-500">{errors.model}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => !forceType && setType('entry')}
                disabled={forceType}
                className={`flex-1 py-2 px-4 rounded-md ${
                  type === 'entry'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                } ${forceType ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                Entry
              </button>
              <button
                type="button"
                onClick={() => !forceType && setType('exit')}
                disabled={forceType}
                className={`flex-1 py-2 px-4 rounded-md ${
                  type === 'exit'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                } ${forceType ? 'opacity-60 cursor-not-allowed' : ''}`}
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

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Condition <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setCondition('working')}
                className={`flex-1 py-2 px-4 rounded-md ${
                  condition === 'working'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Working
              </button>
              <button
                type="button"
                onClick={() => setCondition('damaged')}
                className={`flex-1 py-2 px-4 rounded-md ${
                  condition === 'damaged'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Damaged
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
