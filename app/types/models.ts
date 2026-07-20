export interface User {
  created_at?: string | Date
  email?: string
  email_verified_at?: string | Date | null
  id?: number | string
  first_name?: string
  last_name?: string
  full_name?: string
  role?: string
  role_label?: string
  updated_at?: string | Date
}

export interface Post {
  id?: number
  title?: string
  tldr?: string
  content?: string
  image_path?: string
  author_id?: number
  category_id?: number
  published_at?: string | Date
  status?: string
  created_at?: string | Date
  updated_at?: string | Date
  deleted_at?: string | Date
  formatType?: string
  htmlContent?: string
}

export interface Category {
  id?: number | string
  name?: string
  created_at?: string | Date
  updated_at?: string | Date
  deleted_at?: string | Date
}

export interface Author {
  id?: number | string
  name?: string
  email?: string
  bio?: string
  main_title?: string
  preferred_social_network?: string
  preferred_social_network_username?: string
  created_at?: string | Date
  updated_at?: string | Date
  deleted_at?: string | Date
}

export interface BibliographicReference {
  id?: string
  post_id?: string
  description?: string
  created_at?: string | Date
  updated_at?: string | Date
}

export interface Footnote {
  id?: string
  post_id?: string
  description?: string
  created_at?: string | Date
  updated_at?: string | Date
}
