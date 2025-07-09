export interface Folder {
  id: string
  name: string
  imageCount: number
  created_at: string
}

export interface Image {
  id: string
  name: string
  file_path: string
  notes: string | null
  created_at: string
}

export interface DatabaseFolder {
  id: string
  name: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface DatabaseImage {
  id: string
  name: string
  file_path: string
  folder_id: string
  user_id: string
  notes: string | null
  created_at: string
  updated_at: string
}
