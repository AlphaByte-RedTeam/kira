"use client"

import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer'
import { PDFReport } from './pdf-report'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'

export function PDFPreview({ data, status }: { data: any, status: string }) {
  const [isClient, setIsClient] = useState(false)
  const isDraft = status !== 'published'

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="flex h-200 items-center justify-center rounded-lg border border-dashed bg-muted/20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Report Artifact</h3>
        {isDraft ? (
          <Button disabled title="Publish report to enable download">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        ) : (
          <PDFDownloadLink
            document={<PDFReport data={data} />}
            fileName={`${data.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`}
          >
            {({ loading }) => (
              <Button disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Download PDF
              </Button>
            )}
          </PDFDownloadLink>
        )}
      </div>
      
      <div className="overflow-hidden rounded-lg border bg-background shadow-sm h-200">
        <PDFViewer width="100%" height="100%" className="border-none" showToolbar={true}>
          <PDFReport data={data} />
        </PDFViewer>
      </div>
    </div>
  )
}
