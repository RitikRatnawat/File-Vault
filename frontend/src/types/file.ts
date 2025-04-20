export interface File {
  id: string;
  name: string;
  file: string;
  size: number;
  file_type: string;
  uploaded_at: string;
  is_duplicate: boolean;
  original_filename: string;
}

export interface FileType {

}

export interface StorageStats {
  total_files: number;
  unique_files: number;
  duplicates: number;
  total_size: number;
  saved_size: number;
  last_updated: string;
}

export interface FileFilters {
  filename?: string;
  file_type?: string;
  min_size?: number;
  max_size?: number;
  from_date?: string;
  to_date?: string;
}