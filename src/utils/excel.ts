import { utils, write } from 'xlsx';
import { Asset, AssetEntry } from '../types';
import { format } from 'date-fns';

export const exportToExcel = (assets: Asset[]) => {
  const data = assets.flatMap((asset) =>
    asset.entries.map((entry) => ({
      'Asset ID': asset.id,
      'Date': format(entry.timestamp, 'yyyy-MM-dd'),
      'Time': format(entry.timestamp, 'HH:mm:ss'),
      'Type': entry.type.charAt(0).toUpperCase() + entry.type.slice(1),
      'Location': entry.location.charAt(0).toUpperCase() + entry.location.slice(1),
      'Remarks': entry.remarks,
    }))
  );

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