// src/composables/useImport.ts
import { ref } from 'vue'
import mammoth from 'mammoth'
import type { IBook } from '@/types/book.types'

export function useImport() {
  const isImporting = ref(false)
  const importError = ref<string>('')

  /**
   * Import DOCX file and convert to book
   */
  async function importFromDOCX(file: File): Promise<Partial<IBook>> {
    try {
      isImporting.value = true
      importError.value = ''

      const arrayBuffer = await file.arrayBuffer()
      const result = await mammoth.convertToHtml({ arrayBuffer })

      // Parse the HTML content
      const parser = new DOMParser()
      const doc = parser.parseFromString(result.value, 'text/html')

      // Try to extract title from first heading
      const firstHeading = doc.querySelector('h1')
      const title = firstHeading?.textContent || file.name.replace(/\.[^/.]+$/, '')

      // Convert content to pages (split by h2 headings)
      const content = doc.body.innerHTML
      const pageContents = splitContentByHeadings(content)

      return {
        metadata: {
          title: title,
          author: 'Imported User',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        pages: pageContents.map((content, index) => ({
          id: crypto.randomUUID(),
          title: `Page ${index + 1}`,
          content: content,
          order: index,
        })),
      }
    } catch (error) {
      importError.value = error instanceof Error ? error.message : 'Import failed'
      throw new Error(importError.value)
    } finally {
      isImporting.value = false
    }
  }

  /**
   * Split HTML content by H2 headings to create pages
   */
  function splitContentByHeadings(html: string): string[] {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const body = doc.body

    // Find all h2 headings
    const headings = body.querySelectorAll('h2')

    if (headings.length === 0) {
      // No headings, just return everything as one page
      return [body.innerHTML]
    }

    const pages: string[] = []
    let currentPage = ''
    let currentElement: Node | null = body.firstChild

    while (currentElement) {
      const nextElement = currentElement.nextSibling

      if (currentElement.nodeType === Node.ELEMENT_NODE) {
        const element = currentElement as Element

        if (element.tagName === 'H2' && currentPage) {
          // Found a new heading, push the current page
          pages.push(currentPage)
          currentPage = ''
        }

        currentPage += element.outerHTML
      }

      currentElement = nextElement
    }

    // Push the last page
    if (currentPage) {
      pages.push(currentPage)
    }

    return pages.length > 0 ? pages : [body.innerHTML]
  }

  /**
   * Import plain text file
   */
  async function importFromText(file: File): Promise<Partial<IBook>> {
    try {
      isImporting.value = true
      importError.value = ''

      const text = await file.text()
      const lines = text.split('\n').filter((line) => line.trim())

      // Split by double newlines or headings
      const pages: string[] = []
      let currentPage = ''

      for (const line of lines) {
        if (line.match(/^(Chapter|Page|Part)\s+\d+/i) && currentPage) {
          pages.push(currentPage)
          currentPage = ''
        }
        currentPage += `<p>${line}</p>`
      }

      if (currentPage) {
        pages.push(currentPage)
      }

      return {
        metadata: {
          title: file.name.replace(/\.[^/.]+$/, ''),
          author: 'Imported User',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        pages: pages.map((content, index) => ({
          id: crypto.randomUUID(),
          title: `Page ${index + 1}`,
          content: content,
          order: index,
        })),
      }
    } catch (error) {
      importError.value = error instanceof Error ? error.message : 'Import failed'
      throw new Error(importError.value)
    } finally {
      isImporting.value = false
    }
  }

  return {
    isImporting,
    importError,
    importFromDOCX,
    importFromText,
  }
}
