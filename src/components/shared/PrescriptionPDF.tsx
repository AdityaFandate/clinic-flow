import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#374151',
    backgroundColor: '#F3F4F6',
    padding: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: 100,
    fontSize: 11,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  value: {
    fontSize: 11,
    color: '#111827',
    flex: 1,
  },
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#F9FAFB',
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCellHeader: {
    margin: 5,
    fontSize: 10,
    fontWeight: 'bold',
  },
  tableCell: {
    margin: 5,
    fontSize: 10,
  },
  notes: {
    fontSize: 11,
    color: '#374151',
    marginTop: 10,
    fontStyle: 'italic',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
  },
});

interface PrescriptionPDFProps {
  doctorName: string;
  doctorSpecialization: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  date: string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];
  notes?: string;
}

export const PrescriptionPDF = ({
  doctorName,
  doctorSpecialization,
  patientName,
  patientAge,
  patientGender,
  date,
  medications,
  notes,
}: PrescriptionPDFProps) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>ClinicFlow</Text>
          <Text style={styles.subtitle}>Digital Prescription Record</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Doctor Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{doctorName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Specialization:</Text>
            <Text style={styles.value}>{doctorSpecialization}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{patientName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Age / Gender:</Text>
            <Text style={styles.value}>{patientAge} yrs / {patientGender}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{date}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medications</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Medicine Name</Text></View>
              <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Dosage</Text></View>
              <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Frequency</Text></View>
              <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Duration</Text></View>
            </View>
            {medications.map((med, idx) => (
              <View style={styles.tableRow} key={idx}>
                <View style={styles.tableCol}><Text style={styles.tableCell}>{med.name}</Text></View>
                <View style={styles.tableCol}><Text style={styles.tableCell}>{med.dosage}</Text></View>
                <View style={styles.tableCol}><Text style={styles.tableCell}>{med.frequency}</Text></View>
                <View style={styles.tableCol}><Text style={styles.tableCell}>{med.duration}</Text></View>
              </View>
            ))}
          </View>
        </View>

        {notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Doctor's Notes</Text>
            <Text style={styles.notes}>{notes}</Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text>This is a digitally generated prescription. Not valid for medico-legal purposes without a valid signature.</Text>
        </View>
      </Page>
    </Document>
  );
};
