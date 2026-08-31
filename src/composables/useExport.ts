// src/composables/useExport.ts
import { ref } from 'vue'
import html2pdf from 'html2pdf.js'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'
import type { IBook } from '@/types/book.types'

export function useExport() {
  const isExporting = ref(false)
  const exportProgress = ref(0)

  /**
   * Export book as PDF using html2pdf.js (Simplest method)
   */
  async function exportAsPDF(book: IBook): Promise<void> {
    try {
      isExporting.value = true
      exportProgress.value = 10

      // Create a temporary container to render the book
      const container = document.createElement('div')
      container.style.cssText = `
        padding: 40px;
        max-width: 800px;
        margin: 0 auto;
        font-family: Arial, sans-serif;
        background: white;
        color: black;
      `

      // Build the book HTML
      let bookHTML = `
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="font-size: 28px; font-weight: bold;">${book.metadata.title}</h1>
          <p style="font-size: 16px; color: #666;">By ${book.metadata.author}</p>
          <hr style="margin: 20px 0;">
        </div>
      `

      book.pages.forEach((page, index) => {
        bookHTML += `
          <div style="page-break-after: always; margin-bottom: 40px;">
            <h2 style="font-size: 22px; font-weight: bold; border-bottom: 2px solid #ddd; padding-bottom: 10px;">
              ${page.title}
            </h2>
            <div style="margin-top: 20px; font-size: 14px; line-height: 1.8;">
              ${page.content}
            </div>
          </div>
        `
      })

      container.innerHTML = bookHTML
      document.body.appendChild(container)

      exportProgress.value = 50

      // Generate PDF
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `${book.metadata.title || 'ebook'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      }

      await html2pdf().set(opt).from(container).save()

      exportProgress.value = 100
      document.body.removeChild(container)
    } catch (error) {
      console.error('PDF Export failed:', error)
      throw new Error('Failed to export PDF')
    } finally {
      isExporting.value = false
      exportProgress.value = 0
    }
  }

  /**
   * Export book as PDF using jsPDF + html2canvas (More control)
   */
  async function exportAsPDFAdvanced(book: IBook): Promise<void> {
    try {
      isExporting.value = true
      exportProgress.value = 10

      // Create a preview container
      const container = document.createElement('div')
      container.style.cssText = `
        padding: 40px;
        max-width: 800px;
        margin: 0 auto;
        font-family: Arial, sans-serif;
        background: white;
        color: black;
        position: absolute;
        left: -9999px;
        top: 0;
      `

      let bookHTML = `
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="font-size: 28px; font-weight: bold;">${book.metadata.title}</h1>
          <p style="font-size: 16px; color: #666;">By ${book.metadata.author}</p>
          <hr style="margin: 20px 0;">
        </div>
      `

      book.pages.forEach((page, index) => {
        bookHTML += `
          <div style="page-break-after: always; margin-bottom: 40px;">
            <h2 style="font-size: 22px; font-weight: bold; border-bottom: 2px solid #ddd; padding-bottom: 10px;">
              ${page.title}
            </h2>
            <div style="margin-top: 20px; font-size: 14px; line-height: 1.8;">
              ${page.content}
            </div>
          </div>
        `
      })

      container.innerHTML = bookHTML
      document.body.appendChild(container)

      exportProgress.value = 40

      // Render to canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      })

      exportProgress.value = 70

      // Create PDF
      const imgData = canvas.toDataURL('image/jpeg', 0.95)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      const imgX = (pdfWidth - imgWidth * ratio) / 2
      const imgY = 0

      pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
      pdf.save(`${book.metadata.title || 'ebook'}.pdf`)

      exportProgress.value = 100
      document.body.removeChild(container)
    } catch (error) {
      console.error('Advanced PDF Export failed:', error)
      throw new Error('Failed to export advanced PDF')
    } finally {
      isExporting.value = false
      exportProgress.value = 0
    }
  }

  /**
   * Export book as EPUB
   */
  async function exportAsEPUB(book: IBook): Promise<void> {
    try {
      isExporting.value = true
      exportProgress.value = 10

      // Dynamic import for epub-gen
      const epub = await import('epub-gen')

      const content = book.pages.map((page) => ({
        title: page.title,
        data: page.content,
      }))

      const options = {
        title: book.metadata.title,
        author: book.metadata.author,
        publisher: 'Ebook Builder',
        description: `Generated by Ebook Builder on ${new Date().toLocaleDateString()}`,
        content: content,
        lang: 'en',
        tocTitle: 'Table of Contents',
      }

      exportProgress.value = 50

      const epubGenerator = new epub.default(options)
      const buffer = await epubGenerator.promise()

      // Download the file
      const blob = new Blob([buffer], { type: 'application/epub+zip' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${book.metadata.title || 'ebook'}.epub`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      exportProgress.value = 100
    } catch (error) {
      console.error('EPUB Export failed:', error)
      throw new Error('Failed to export EPUB')
    } finally {
      isExporting.value = false
      exportProgress.value = 0
    }
  }

  /**
   * Export book as DOCX
   */
  async function exportAsDOCX(book: IBook): Promise<void> {
    try {
      isExporting.value = true
      exportProgress.value = 10

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                text: book.metadata.title,
                heading: HeadingLevel.HEADING_1,
                alignment: 'center',
                spacing: { after: 200 },
              }),
              new Paragraph({
                text: `By ${book.metadata.author}`,
                alignment: 'center',
                spacing: { after: 400 },
              }),
              ...book.pages.flatMap((page) => [
                new Paragraph({
                  text: page.title,
                  heading: HeadingLevel.HEADING_2,
                  spacing: { before: 400, after: 200 },
                }),
                // Parse HTML content - this is simplified
                new Paragraph({
                  children: [
                    new TextRun({
                      text: page.content.replace(/<[^>]*>/g, ''), // Strip HTML tags
                      size: 24,
                    }),
                  ],
                  spacing: { after: 200 },
                }),
              ]),
            ],
          },
        ],
      })

      exportProgress.value = 50

      const blob = await Packer.toBlob(doc)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${book.metadata.title || 'ebook'}.docx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      exportProgress.value = 100
    } catch (error) {
      console.error('DOCX Export failed:', error)
      throw new Error('Failed to export DOCX')
    } finally {
      isExporting.value = false
      exportProgress.value = 0
    }
  }

  return {
    isExporting,
    exportProgress,
    exportAsPDF,
    exportAsPDFAdvanced,
    exportAsEPUB,
    exportAsDOCX,
  }
}
