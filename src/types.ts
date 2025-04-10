export interface AssetEntry {
  id: string;
  assetId: string;
  timestamp: Date;
  type: 'entry' | 'exit' | 'delete';
  location: 'office' | 'client';
  remarks: string;
  name?: string;
  model?: string;
  condition?: 'working' | 'damaged';
}

export interface Asset {
  id: string;
  entries: AssetEntry[];
  name?: string;
  model?: string;
  condition?: 'working' | 'damaged';
}

export interface DeleteModalProps {
  assetId: string;
  onConfirm: (remarks: string) => void;
  onClose: () => void;
}

export interface ManualEntryModalProps {
  onSubmit: (data: {
    assetId: string;
    name: string;
    model: string;
    condition: 'working' | 'damaged';
    remarks: string;
  }) => void;
  onClose: () => void;
}
