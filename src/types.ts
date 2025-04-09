export interface AssetEntry {
  id: string;
  assetId: string;
  timestamp: Date;
  type: 'entry' | 'exit';
  location: 'office' | 'client';
  remarks: string;
}

export interface Asset {
  id: string;
  entries: AssetEntry[];
}