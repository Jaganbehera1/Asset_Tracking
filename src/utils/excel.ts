import { utils, write } from 'xlsx';
import { Asset, AssetEntry } from '../types';
import { format } from 'date-fns';

// assets: active assets, deletedEntries: optional list of deleted entry rows
export const exportToExcel = (assets: Asset[], deletedEntries: AssetEntry[] = []) => {
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