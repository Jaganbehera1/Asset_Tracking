import React, { useState } from 'react';
import { Trash2, X, AlertTriangle } from 'lucide-react';

interface DeleteModalProps {
  assetId: string;
  onConfirm: (remarks: string) => void;
  onClose: () => void;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({ assetId, onConfirm, onClose }) => {
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remarks.trim()) {
      setError('Please provide a reason for deletion');
      return;
    }
    onConfirm(remarks);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-red-600 flex items-center">
            <AlertTriangle className="mr-2" /> Delete Asset
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <p className="text-gray-600">Are you sure you want to delete asset: <span className="font-semibold">{assetId}</span>?</p>
            <p className="text-gray-500 text-sm mt-2">This action cannot be undone.</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Deletion <span className="text-red-500">*</span>
            </label>
            <textarea
              value={remarks}
              onChange={(e) => {
                setRemarks(e.target.value);
                setError('');
              }}
              className={`w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-red-500`}
              rows={3}
              placeholder="Please provide a reason for deletion..."
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
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
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Asset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
