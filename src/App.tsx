import { useState, useCallback, useEffect } from 'react';
import { QRScanner } from './components/QRScanner';
import { AssetModal } from './components/AssetModal';
import { DeleteModal } from './components/DeleteModal';
import { ManualEntryModal } from './components/ManualEntryModal';
import { Asset, AssetEntry } from './types';
import { exportToExcel } from './utils/excel';
import { QrCode, Download, History, Search, AlertCircle, Trash2, Plus } from 'lucide-react';

function App() {
  const [showScanner, setShowScanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalInitialType, setModalInitialType] = useState<'entry' | 'exit'>('entry');
  const [modalForceType, setModalForceType] = useState(false);
  const [modalInitialName, setModalInitialName] = useState<string>('');
  const [modalInitialModel, setModalInitialModel] = useState<string>('');
  const [modalInitialCondition, setModalInitialCondition] = useState<'working' | 'damaged'>('working');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showManualEntryModal, setShowManualEntryModal] = useState(false);
  const [scannedAssetId, setScannedAssetId] = useState<string>('');
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
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
    // Determine last action for this asset (if it exists)
    const existing = assets.find(a => a.id === data);
    if (existing && existing.entries && existing.entries.length > 0) {
      const last = existing.entries[existing.entries.length - 1];
      // Prefill name/model/condition from last entry
      setModalInitialName(last.name || '');
      setModalInitialModel(last.model || '');
      setModalInitialCondition(last.condition || 'working');

      if (last.type === 'entry') {
        // If last action was an entry, next logical action is exit
        setModalInitialType('exit');
        setModalForceType(true);
        alert('This asset is currently checked in. Scanning will record an Exit.');
      } else {
        setModalInitialType('entry');
        setModalForceType(false);
      }
    } else {
      setModalInitialType('entry');
      setModalForceType(false);
      setModalInitialName('');
      setModalInitialModel('');
      setModalInitialCondition('working');
    }

    setScannedAssetId(data);
    setShowScanner(false);
    setShowModal(true);
  }, [assets]);

  const handleAssetSubmit = async (
    type: 'entry' | 'exit',
    location: 'office' | 'client',
    remarks: string,
    name: string,
    model: string,
    condition: 'working' | 'damaged'
  ) => {
    const entry: AssetEntry = {
      id: crypto.randomUUID(),
      assetId: scannedAssetId,
      timestamp: new Date(),
      type,
      location,
      remarks,
      name,
      model,
      condition,
    };

    // Prevent duplicate identical consecutive entries
    const existing = assets.find(a => a.id === scannedAssetId);
    if (existing && existing.entries && existing.entries.length > 0) {
      const last = existing.entries[existing.entries.length - 1];
      if (
        last.type === entry.type &&
        (last.name || '') === (entry.name || '') &&
        (last.model || '') === (entry.model || '') &&
        (last.condition || '') === (entry.condition || '')
      ) {
        alert('Duplicate entry detected — the last record is identical. No new entry created.');
        setShowModal(false);
        return;
      }
      // If last was 'entry' and user is attempting another 'entry', block and suggest exit
      if (last.type === 'entry' && entry.type === 'entry') {
        alert('Asset is already checked in. Please record an Exit instead of another Entry.');
        return;
      }
    }

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

  const handleDelete = async (remarks: string) => {
    const entry: AssetEntry = {
      id: crypto.randomUUID(),
      assetId: selectedAssetId,
      timestamp: new Date(),
      type: 'delete',
      location: 'office',
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
        throw new Error('Failed to delete asset');
      }

      await fetchAssets();
      setShowDeleteModal(false);
      setSelectedAssetId('');
    } catch (error) {
      console.error('Failed to delete asset:', error);
    }
  };

  const handleManualEntry = async (data: {
    assetId: string;
    name: string;
    model: string;
    condition: 'working' | 'damaged';
    location: 'office' | 'client';
    remarks: string;
  }) => {
    // If asset exists and last action was 'entry', convert this manual submission to 'exit'
    const existing = assets.find(a => a.id === data.assetId);
    let determinedType: 'entry' | 'exit' = 'entry';
    if (existing && existing.entries && existing.entries.length > 0) {
      const last = existing.entries[existing.entries.length - 1];
      if (last.type === 'entry') {
        // Auto switch to exit to avoid duplicate consecutive entries
        determinedType = 'exit';
        alert('Asset was checked in earlier — this manual action will be recorded as an Exit.');
      }
      // Prevent exact duplicate
      if (
        last.type === determinedType &&
        (last.name || '') === (data.name || '') &&
        (last.model || '') === (data.model || '') &&
        (last.condition || '') === (data.condition || '')
      ) {
        alert('Duplicate manual entry detected — the last record is identical. No new entry created.');
        return;
      }
    }

    const entry: AssetEntry = {
      id: crypto.randomUUID(),
      assetId: data.assetId,
      timestamp: new Date(),
      type: determinedType,
      location: data.location,
      remarks: data.remarks,
      name: data.name,
      model: data.model,
      condition: data.condition,
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
        throw new Error('Failed to create asset');
      }

      await fetchAssets();
      setShowManualEntryModal(false);
    } catch (error) {
      console.error('Failed to create asset:', error);
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
            onClick={() => setShowManualEntryModal(true)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg flex items-center hover:bg-green-700 transition-colors"
          >
            <Plus className="mr-2" /> Add Asset Manually
          </button>
          <button
            onClick={() => exportToExcel(assets)}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg flex items-center hover:bg-purple-700 transition-colors"
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
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Model
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Condition
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAssets.map((asset) => {
                  const lastEntry = asset.entries[asset.entries.length - 1];
                  if (lastEntry.type === 'delete') return null;
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lastEntry.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lastEntry.model || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            lastEntry.condition === 'working'
                              ? 'bg-green-100 text-green-800'
                              : lastEntry.condition === 'damaged'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {lastEntry.condition
                            ? lastEntry.condition.charAt(0).toUpperCase() + lastEntry.condition.slice(1)
                            : 'Unknown'}
                        </span>
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
                          {lastEntry.type.charAt(0).toUpperCase() + lastEntry.type.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lastEntry.location.charAt(0).toUpperCase() + lastEntry.location.slice(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedAssetId(asset.id);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Delete Asset"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
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
          initialType={modalInitialType}
            forceType={modalForceType}
            initialName={modalInitialName}
            initialModel={modalInitialModel}
            initialCondition={modalInitialCondition}
          onSubmit={handleAssetSubmit}
          onClose={() => {
            setShowModal(false);
            setModalForceType(false);
            setModalInitialType('entry');
          }}
        />
      )}

      {showDeleteModal && (
        <DeleteModal
          assetId={selectedAssetId}
          onConfirm={handleDelete}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedAssetId('');
          }}
        />
      )}

      {showManualEntryModal && (
        <ManualEntryModal
          onSubmit={handleManualEntry}
          onClose={() => setShowManualEntryModal(false)}
        />
      )}
    </div>
  );
}

export default App;
