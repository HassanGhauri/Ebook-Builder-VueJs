// src/composables/useExport.ts
import { ref } from 'vue'
import html2pdf from 'html2pdf.js'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'
import JSZip from 'jszip'
import type { IBook } from '@/types/book.types'

function removeTextColorAndHighlight(content: string): string {
  const document = new DOMParser().parseFromString(content, 'text/html')

  document.querySelectorAll('*').forEach((element) => {
    const styledElement = element as HTMLElement
    styledElement.style.removeProperty('color')
    styledElement.style.removeProperty('background-color')
    styledElement.style.removeProperty('background')
    styledElement.removeAttribute('data-color')

    if (
      styledElement.tagName === 'MARK' ||
      (styledElement.tagName === 'SPAN' && !styledElement.attributes.length)
    ) {
      styledElement.replaceWith(...Array.from(styledElement.childNodes))
    }
  })

  return document.body.innerHTML
}

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
              ${removeTextColorAndHighlight(page.content)}
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
              ${removeTextColorAndHighlight(page.content)}
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

      const escapeXml = (value: unknown) =>
        String(value ?? '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;')

      const title = escapeXml(book.metadata.title || 'Untitled Book')
      const author = escapeXml(book.metadata.author || 'Anonymous')
      const zip = new JSZip()
      const pageIds = book.pages.map((_, index) => `page-${index + 1}`)

      // EPUB requires this file to be the first entry and uncompressed.
      zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' })
      zip.file(
        'META-INF/container.xml',
        `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`,
      )

      book.pages.forEach((page, index) => {
        zip.file(
          `OEBPS/${pageIds[index]}.xhtml`,
          `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
  <head><title>${escapeXml(page.title)}</title></head>
  <body><h1>${escapeXml(page.title)}</h1>${removeTextColorAndHighlight(page.content)}</body>
</html>`,
        )
      })

      const manifest = pageIds
        .map(
          (pageId) =>
            `<item id="${pageId}" href="${pageId}.xhtml" media-type="application/xhtml+xml"/>`,
        )
        .join('\n    ')
      const navigation = book.pages
        .map(
          (page, index) =>
            `<li><a href="${pageIds[index]}.xhtml">${escapeXml(page.title)}</a></li>`,
        )
        .join('\n          ')

      zip.file(
        'OEBPS/content.opf',
        `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="book-id" version="3.0" xml:lang="en">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="book-id">${escapeXml(book.id)}</dc:identifier>
    <dc:title>${title}</dc:title>
    <dc:creator>${author}</dc:creator>
    <dc:language>en</dc:language>
    <meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')}</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    ${manifest}
  </manifest>
  <spine>
    ${pageIds.map((pageId) => `<itemref idref="${pageId}"/>`).join('\n    ')}
  </spine>
</package>`,
      )
      zip.file(
        'OEBPS/nav.xhtml',
        `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en">
  <head><title>Table of Contents</title></head>
  <body>
    <nav epub:type="toc" id="toc"><h1>Table of Contents</h1><ol>
          ${navigation}
    </ol></nav>
  </body>
</html>`,
      )

      exportProgress.value = 50
      const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/epub+zip' })

      // Download the file
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
