"use client"

import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', lineHeight: 1.5, color: '#374151' },
  titlePage: { padding: 80, backgroundColor: '#111827', color: 'white', flex: 1, justifyContent: 'center', alignItems: 'center' },
  brandTitle: { fontSize: 32, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  reportType: { fontSize: 16, color: '#9ca3af', marginBottom: 40 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, marginTop: 20, color: '#111827', borderBottom: 1, borderBottomColor: '#e5e7eb', paddingBottom: 5 },
  finding: { marginBottom: 20, padding: 10, border: 1, borderColor: '#e5e7eb', borderRadius: 4 },
  findingHeader: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#f9fafb', padding: 8, borderRadius: 4, marginBottom: 8 },
  findingTitle: { fontWeight: 'bold', fontSize: 12, color: '#111827' },
  severityBadge: { padding: '4 8', borderRadius: 4, fontSize: 9, fontWeight: 'bold', color: 'white' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, borderTop: 1, borderTopColor: '#e5e7eb', paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between', fontSize: 8, color: '#6b7280' },
  toc: { marginBottom: 30 },
  tocItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }
})

export function PDFReport({ data }: { data: any }) {
  const getSeverityColor = (s: string) => {
    switch (s?.toLowerCase()) {
      case 'critical': return '#dc2626'; case 'high': return '#ea580c';
      case 'medium': return '#ca8a04'; case 'low': return '#16a34a';
      default: return '#6b7280';
    }
  }

  return (
    <Document>
      <Page size="A4" style={styles.titlePage}>
        {data.logo_url && <Image src={data.logo_url} style={{ width: 150, marginBottom: 40 }} />}
        <Text style={styles.brandTitle}>{data.title}</Text>
        <Text style={styles.reportType}>Security Assessment Report</Text>
        <Text style={{ fontSize: 12 }}>Client: {data.client_name || 'N/A'}</Text>
        <Text style={{ fontSize: 10, marginTop: 10 }}>{new Date().toLocaleDateString()}</Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Table of Contents</Text>
        <View style={styles.toc}>
          <View style={styles.tocItem}><Text>1. Executive Summary</Text></View>
          <View style={styles.tocItem}><Text>2. Scope</Text></View>
          <View style={styles.tocItem}><Text>3. Detailed Findings</Text></View>
        </View>
        <View style={styles.footer}>
          <Text>Kira Security Assessment</Text>
          <Text render={({ pageNumber }) => `Page ${pageNumber}`} />
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>1. Executive Summary</Text>
        <Text>{data.executive_summary || 'No summary.'}</Text>

        <Text style={styles.sectionTitle}>2. Scope</Text>
        <Text>{(data.targets || []).map((t: any) => `${t.host} (${t.ip})`).join(', ') || 'No targets.'}</Text>

        <Text style={styles.sectionTitle}>3. Detailed Findings</Text>
        {(data.vulnerabilities || []).map((v: any) => (
          <View key={v.id} style={styles.finding} wrap={false}>
            <View style={styles.findingHeader}>
              <Text style={styles.findingTitle}>{v.synopsis}</Text>
              <Text style={[styles.severityBadge, { backgroundColor: getSeverityColor(v.severity) }]}>
                {v.severity.toUpperCase()} ({v.cvss_score?.toFixed(1) || 0})
              </Text>
            </View>
            <Text style={{ fontWeight: 'bold' }}>Description</Text>
            <Text style={{ marginBottom: 5 }}>{v.description}</Text>
            
            {/* Evidence rendering: Allow full width, original height aspect ratio, auto-wrap */}
            <View wrap={true}>
              {(Array.isArray(v.screenshot_url) ? v.screenshot_url : [v.screenshot_url]).filter(Boolean).map((url: string, index: number) => (
                <Image 
                  key={index} 
                  src={url} 
                  style={{ 
                    width: '100%', 
                    marginVertical: 10,
                    objectFit: 'contain'
                  }} 
                />
              ))}
            </View>
          </View>
        ))}
        
        <View style={styles.footer}>
          <Text>Kira Security Assessment</Text>
          <Text render={({ pageNumber }) => `Page ${pageNumber}`} />
        </View>
      </Page>
    </Document>
  )
}
