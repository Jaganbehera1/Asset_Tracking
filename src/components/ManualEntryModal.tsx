import React, { useState } from 'react';
import { X, Plus, QrCode } from 'lucide-react';

interface ManualEntryModalProps {
  onSubmit: (data: {
    assetId: string;
    name: string;
    model: string;
    condition: 'working' | 'damaged';
    location: 'office' | 'client';
    remarks: string;
  }) => void;
  onClose: () => void;
}

export const ManualEntryModal: React.FC<ManualEntryModalProps> = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    assetId: '',
    name: '',
    model: '',
    condition: 'working' as 'working' | 'damaged',
    location: 'office' as 'office' | 'client',
    remarks: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.assetId.trim()) newErrors.assetId = 'Asset ID is required';
    if (!formData.name.trim()) newErrors.name = 'Asset name is required';
    if (!formData.model.trim()) newErrors.model = 'Model number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        assetId: formData.assetId,
        name: formData.name,
        model: formData.model,
        condition: formData.condition,
        location: formData.location,
        remarks: formData.remarks,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md overflow-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-blue-600 flex items-center">
            <Plus className="mr-2" /> Add New Asset
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asset ID / QR Code Data <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <QrCode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={formData.assetId}
                  onChange={(e) => {
                    setFormData({ ...formData, assetId: e.target.value });
                    setErrors({ ...errors, assetId: '' });
                  }}
                  className={`w-full pl-10 pr-4 py-2 border ${
                    errors.assetId ? 'border-red-500' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter Asset ID or QR Code data"
                />
              </div>
              {errors.assetId && <p className="mt-1 text-sm text-red-500">{errors.assetId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asset Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  setErrors({ ...errors, name: '' });
                }}
                className={`w-full px-3 py-2 border ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter asset name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => {
                  setFormData({ ...formData, model: e.target.value });
                  setErrors({ ...errors, model: '' });
                }}
                className={`w-full px-3 py-2 border ${
                  errors.model ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter model number"
              />
              {errors.model && <p className="mt-1 text-sm text-red-500">{errors.model}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Condition <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, condition: 'working' })}
                  className={`flex-1 py-2 px-4 rounded-md ${
                    formData.condition === 'working'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Working
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, condition: 'damaged' })}
                  className={`flex-1 py-2 px-4 rounded-md ${
                    formData.condition === 'damaged'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Damaged
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, location: 'office' })}
                  className={`flex-1 py-2 px-4 rounded-md ${
                    formData.location === 'office'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Office
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, location: 'client' })}
                  className={`flex-1 py-2 px-4 rounded-md ${
                    formData.location === 'client'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Client Site
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remarks
              </label>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Enter any additional remarks"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
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
              <Plus className="w-4 h-4 mr-2" />
              Add Asset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
