export interface MediaFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  folder: string | null;
  tags: string[];
  createdAt: string;
}

export interface MediaStats {
  totalSize: number;
  fileCount: number;
  typeDistribution: Record<string, number>;
  folderDistribution: Record<string, number>;
  uploadTrends: {
    date: string;
    count: number;
  }[];
}