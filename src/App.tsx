import React, { useState, useCallback, useEffect } from 'react';
import { QRScanner } from './components/QRScanner';
import { AssetModal } from './components/AssetModal';
import { Asset, AssetEntry } from './types';
import { exportToExcel } from './utils/excel';
import { QrCode, Download, History, Search, AlertCircle } from 'lucide-react';

function App() {
  const [showScanner, setShowScanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [scannedAssetId, setScannedAssetId] = useState<string>('');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      setFetchError(null);
      const response = await fetch('/api/assets');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAssets(data.map((asset: any) => ({
        ...asset,
        entries: asset.entries.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }))
      })));
    } catch (error) {
      console.error('Failed to fetch assets:', error);
      setFetchError('Failed to load assets. Please ensure the backend server is running.');
      setAssets([]);
    }
  };

  const handleScan = useCallback((data: string) => {
    setScannedAssetId(data);
    setShowScanner(false);
    setShowModal(true);
  }, []);

  const handleAssetSubmit = async (type: 'entry' | 'exit', location: 'office' | 'client', remarks: string) => {
    const entry: AssetEntry = {
      id: crypto.randomUUID(),
      assetId: scannedAssetId,
      timestamp: new Date(),
      type,
      location,
      remarks,
    };

    try {
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...entry,
          timestamp: entry.timestamp.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create entry');
      }

      await fetchAssets();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to submit entry:', error);
    }
  };

  const filteredAssets = assets
    .filter((asset) => asset.id.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const lastEntryA = a.entries[a.entries.length - 1].timestamp;
      const lastEntryB = b.entries[b.entries.length - 1].timestamp;
      return lastEntryB.getTime() - lastEntryA.getTime();
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <QrCode className="mr-3" /> Asset Management System
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8 flex flex-wrap gap-4">
          <button
            onClick={() => setShowScanner(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
          >
            <QrCode className="mr-2" /> Scan QR Code
          </button>
          <button
            onClick={() => exportToExcel(assets)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg flex items-center hover:bg-green-700 transition-colors"
          >
            <Download className="mr-2" /> Export to Excel
          </button>
        </div>

        {fetchError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center text-red-700">
            <AlertCircle className="mr-2 flex-shrink-0" />
            <p>{fetchError}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asset ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAssets.map((asset) => {
                  const lastEntry = asset.entries[asset.entries.length - 1];
                  return (
                    <tr key={asset.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <History className="mr-2 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {asset.id}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {lastEntry.timestamp.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            lastEntry.type === 'entry'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {lastEntry.type.charAt(0).toUpperCase() +
                            lastEntry.type.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lastEntry.location.charAt(0).toUpperCase() +
                          lastEntry.location.slice(1)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {showScanner && (
        <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
      )}
      
      {showModal && (
        <AssetModal
          assetId={scannedAssetId}
          onSubmit={handleAssetSubmit}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

export default App;