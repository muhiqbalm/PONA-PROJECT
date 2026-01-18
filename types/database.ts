// --- Tipe Konten Materi (JSONB) ---
export type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "image"; src: string; caption?: string }
  | { type: "green-list"; title?: string; text: string; subItems?: string[] }
  | { type: "bullet-list"; items: string[] };

// --- Tipe Tabel Database ---

// 1. Subject (Disederhanakan)
export interface Subject {
  id: number;
  name: string;
  created_at: string;
}

// 2. Reading Material
export interface ReadingMaterial {
  id: number;
  subject_id: number;
  title: string;
  order_number: number;
  content: ContentBlock[]; // Otomatis mapping dari JSONB ke array ini
}

// 3. Practice Question
export interface PracticeQuestion {
  id: number;
  subject_id: number;
  number: number;
  question_text: string;
  flip_image_front: string; // Mapping dari database: flip_image_front
  flip_image_back: string; // Mapping dari database: flip_image_back
}

export interface RoleCodeData {
  id: string;
  code: string;
  role_name: string;
  created_at: string;
}
