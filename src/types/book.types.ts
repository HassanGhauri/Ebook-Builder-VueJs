// src/types/book.types.ts
export interface IMetadata {
  title: string
  author: string
  createdAt: string
  updatedAt: string
}

export interface IPage {
  id: string
  title: string
  content: string // HTML content from Tiptap
  order: number
}

export interface IBook {
  id: string
  metadata: IMetadata
  pages: IPage[]
  currentPageIndex: number
  coverImage?: string // Base64 or URL
}
