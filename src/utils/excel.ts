import { utils, write } from 'xlsx';
import { Asset, AssetEntry } from '../types';
import { format } from 'date-fns';

// assets: active assets, deletedEntries: optional list of deleted entry rows
export const exportToExcel = (assets: Asset[], deletedEntries: AssetEntry[] = []) => {
  // compute current status per asset from its last entry
  const assetStatusMap = new Map<string, string>();
  assets.forEach(asset => {
    const last = asset.entries[asset.entries.length - 1];
    if (!last) {
      assetStatusMap.set(asset.id, 'Unknown');
    } else if (last.type === 'entry') {
      assetStatusMap.set(asset.id, 'In Stock');
    } else if (last.type === 'exit') {
      assetStatusMap.set(asset.id, 'Checked Out');
    } else if (last.type === 'delete') {
      assetStatusMap.set(asset.id, 'Deleted');
    } else {
      assetStatusMap.set(asset.id, 'Unknown');
    }
  });

  const deletedIdSet = new Set<string>(deletedEntries.map(d => d.id));

  const activeData = assets.flatMap((asset) =>
    asset.entries.map((entry) => ({
      'Asset ID': asset.id,
      'Date': format(entry.timestamp, 'yyyy-MM-dd'),
      'Time': format(entry.timestamp, 'HH:mm:ss'),
      'Type': entry.type.charAt(0).toUpperCase() + entry.type.slice(1),
      'Location': entry.location ? entry.location.charAt(0).toUpperCase() + entry.location.slice(1) : '',
      'Remarks': entry.remarks || '',
      'Name': entry.name || '',
      'Model': entry.model || '',
      'Source': deletedIdSet.has(entry.id) ? 'Deleted' : 'Active',
      'Current Status': assetStatusMap.get(asset.id) || 'Unknown',
    }))
  );

  const deletedData = deletedEntries.map((entry) => ({
    'Asset ID': entry.assetId,
    'Date': format(new Date(entry.timestamp), 'yyyy-MM-dd'),
    'Time': format(new Date(entry.timestamp), 'HH:mm:ss'),
    'Type': entry.type ? entry.type.charAt(0).toUpperCase() + entry.type.slice(1) : 'Deleted',
    'Location': entry.location ? entry.location.charAt(0).toUpperCase() + entry.location.slice(1) : '',
    'Remarks': (entry as any).deleteRemarks || entry.remarks || '',
    'Name': entry.name || '',
    'Model': entry.model || '',
    'Source': 'Deleted',
    'Current Status': 'Deleted',
  }));

  const data = [...activeData, ...deletedData];

  const ws = utils.json_to_sheet(data);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'Asset Tracking');

  // Generate Excel file
  const excelBuffer = write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Create download link
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `asset-tracking-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.xlsx`;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};