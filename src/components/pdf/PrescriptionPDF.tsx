import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

export interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface PrescriptionData {
  patientName: string;
  diagnosis: string;
  medicines: Medicine[];
  instructions: string;
  date: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 20,
  },
  clinicName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
    padding: 6,
    borderRadius: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    width: 100,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#475569',
  },
  value: {
    fontSize: 12,
    color: '#0f172a',
  },
  medicineHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 6,
    marginBottom: 10,
  },
  medicineColHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#475569',
    flex: 1,
  },
  medicineRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  medicineColText: {
    fontSize: 11,
    color: '#0f172a',
    flex: 1,
  },
  rxSymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 11,
    color: '#0f172a',
    lineHeight: 1.5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  }
});

export const PrescriptionPDF = ({ data }: { data: PrescriptionData }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.clinicName}>ClinicFlow Care</Text>
          <Text style={styles.title}>Medical Prescription</Text>
          <Text style={styles.subtitle}>Date: {data.date}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Patient Name:</Text>
            <Text style={styles.value}>{data.patientName || 'Not specified'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Diagnosis:</Text>
            <Text style={styles.value}>{data.diagnosis || 'Not specified'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.rxSymbol}>Rx</Text>
          <View style={styles.medicineHeader}>
            <Text style={styles.medicineColHeader}>Medicine Name</Text>
            <Text style={styles.medicineColHeader}>Dosage</Text>
            <Text style={styles.medicineColHeader}>Frequency</Text>
            <Text style={styles.medicineColHeader}>Duration</Text>
          </View>
          {data.medicines.map((med, i) => (
            <View key={i} style={styles.medicineRow}>
              <Text style={styles.medicineColText}>{med.name || '-'}</Text>
              <Text style={styles.medicineColText}>{med.dosage || '-'}</Text>
              <Text style={styles.medicineColText}>{med.frequency || '-'}</Text>
              <Text style={styles.medicineColText}>{med.duration || '-'}</Text>
            </View>
          ))}
        </View>

        {data.instructions ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Instructions</Text>
            <Text style={styles.instructionsText}>{data.instructions}</Text>
          </View>
        ) : null}

        <Text style={styles.footer}>
          This is an electronically generated prescription and does not require a physical signature.
        </Text>
      </Page>
    </Document>
  );
};
