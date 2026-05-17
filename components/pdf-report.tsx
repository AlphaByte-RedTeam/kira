"use client"

import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', lineHeight: 1.5, color: '#374151' },
  titlePage: { padding: 80, backgroundColor: '#111827', color: 'white', flex: 1, justifyContent: 'center', alignItems: 'center' },
  brandTitle: { fontSize: 32, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  reportType: { fontSize: 16, color: '#9ca3af', marginBottom: 40 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, marginTop: 24, color: '#111827', borderBottom: 1, borderBottomColor: '#e5e7eb', paddingBottom: 5 },
  finding: { marginBottom: 30, padding: 12, border: 1, borderColor: '#e5e7eb', borderRadius: 4 },
  findingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9fafb', padding: 10, borderRadius: 4, marginBottom: 10 },
  findingTitle: { fontWeight: 'bold', fontSize: 12, color: '#111827' },
  severityBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 4, fontSize: 9, fontWeight: 'bold', color: 'white', textAlign: 'center' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, borderTop: 1, borderTopColor: '#e5e7eb', paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between', fontSize: 8, color: '#6b7280' },
  toc: { marginBottom: 30 },
  tocItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  scorecard: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 30, gap: 10 },
  scoreItem: { alignItems: 'center', paddingVertical: 10, paddingHorizontal: 5, borderRadius: 4, flex: 1 },
  scoreVal: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  scoreLabel: { fontSize: 9, color: 'white', marginTop: 4 }
})

export function PDFReport({ data }: { data: any }) {
  const getSeverityColor = (s: string) => {
    switch (s?.toLowerCase()) {
      case 'critical': return '#dc2626'; case 'high': return '#ea580c';
      case 'medium': return '#ca8a04'; case 'low': return '#16a34a';
      default: return '#6b7280';
    }
  }

  const counts = (data.vulnerabilities || []).reduce((acc: any, v: any) => {
    const sev = (v.severity || 'None').toLowerCase()
    acc[sev] = (acc[sev] || 0) + 1
    return acc
  }, {})

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
        <View style={styles.scorecard} break={false}>
          <View style={[styles.scoreItem, { backgroundColor: '#dc2626' }]}><Text style={styles.scoreVal}>{counts.critical || 0}</Text><Text style={styles.scoreLabel}>Critical</Text></View>
          <View style={[styles.scoreItem, { backgroundColor: '#ea580c' }]}><Text style={styles.scoreVal}>{counts.high || 0}</Text><Text style={styles.scoreLabel}>High</Text></View>
          <View style={[styles.scoreItem, { backgroundColor: '#ca8a04' }]}><Text style={styles.scoreVal}>{counts.medium || 0}</Text><Text style={styles.scoreLabel}>Medium</Text></View>
          <View style={[styles.scoreItem, { backgroundColor: '#16a34a' }]}><Text style={styles.scoreVal}>{counts.low || 0}</Text><Text style={styles.scoreLabel}>Low</Text></View>
          <View style={[styles.scoreItem, { backgroundColor: '#2563eb' }]}><Text style={styles.scoreVal}>{counts.informational || 0}</Text><Text style={styles.scoreLabel}>Info</Text></View>
        </View>

        <Text style={styles.sectionTitle}>1. Executive Summary</Text>
        <Text style={{ marginBottom: 20 }}>{data.executive_summary || 'No summary.'}</Text>

        <Text style={styles.sectionTitle}>2. Scope</Text>
        <Text style={{ marginBottom: 20 }}>{(data.targets || []).map((t: any) => `${t.host} (${t.ip})`).join(', ') || 'No targets.'}</Text>

        <Text style={styles.sectionTitle}>3. Detailed Findings</Text>
        {(data.vulnerabilities || []).sort((a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0)).map((v: any) => (
          <View key={v.id} style={styles.finding} wrap={true}>
            <View style={styles.findingHeader} break={false}>
              <Text style={styles.findingTitle}>{v.synopsis}</Text>
              <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(v.severity), flexShrink: 0, alignSelf: 'flex-start' }]}>
                <Text>{v.severity.toUpperCase()} ({v.cvss_score?.toFixed(1) || 0})</Text>
              </View>
            </View>
            <Text style={{ fontWeight: 'bold' }}>Description</Text>
            <Text style={{ marginBottom: 12 }}>{v.description}</Text>
            
            <View wrap={true}>
              {(Array.isArray(v.screenshot_url) ? v.screenshot_url : [v.screenshot_url]).filter(Boolean).map((url: string, index: number) => (
                <View key={index} wrap={false} style={{ marginVertical: 10 }}>
                  <Image src={url} style={{ width: '100%', objectFit: 'contain' }} />
                </View>
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
