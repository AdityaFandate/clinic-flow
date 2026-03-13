import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { FileText, Download, Eye } from 'lucide-react';
import { mockPrescriptions, mockDoctors, mockPatients } from '@/lib/mock-data';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { PrescriptionPDF } from '@/components/shared/PrescriptionPDF';

export default function PatientPrescriptions() {
  const [selectedPrescription, setSelectedPrescription] = useState<null | string>(null);

  const getPrescriptionDetails = (prescriptionId: string) => {
    const rx = mockPrescriptions.find(p => p.id === prescriptionId);
    if (!rx) return null;

    const doctor = mockDoctors.find(d => d.id === rx.doctor_id);
    const patient = mockPatients.find(p => p.id === rx.patient_id);

    if (!doctor || !patient) return null;

    return {
      doctorName: doctor.profile.full_name,
      doctorSpecialization: doctor.specialization,
      patientName: patient.profile.full_name,
      patientAge: patient.age,
      patientGender: patient.gender,
      date: rx.created_at,
      medications: rx.medications,
      notes: rx.notes,
    };
  };

  const selectedDetails = selectedPrescription ? getPrescriptionDetails(selectedPrescription) : null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">My Prescriptions</h1>
          <p className="text-sm text-muted-foreground">Access and download your previous digital prescriptions</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockPrescriptions.map(rx => {
            const rxDetails = getPrescriptionDetails(rx.id);
            if (!rxDetails) return null;

            return (
              <Card key={rx.id} className="border-border">
                <CardHeader className="pb-3 border-b border-border/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        {rxDetails.doctorName}
                      </CardTitle>
                      <CardDescription>{rxDetails.date}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Medications ({rx.medications.length})</p>
                    <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
                      {rx.medications.slice(0, 3).map((m, i) => (
                        <li key={i}>{m.name}</li>
                      ))}
                      {rx.medications.length > 3 && (
                        <li>+ {rx.medications.length - 3} more</li>
                      )}
                    </ul>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedPrescription(rx.id)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-2" /> Preview
                    </Button>
                    <PDFDownloadLink
                      document={<PrescriptionPDF {...rxDetails} />}
                      fileName={`prescription_${rx.id}.pdf`}
                      className="flex-1"
                    >
                      {/* @ts-ignore */}
                      {({ loading }) => (
                        <Button className="w-full" disabled={loading}>
                          <Download className="h-4 w-4 mr-2" /> 
                          {loading ? 'Loading...' : 'Download'}
                        </Button>
                      )}
                    </PDFDownloadLink>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {mockPrescriptions.length === 0 && (
            <div className="col-span-full py-10 text-center border-2 border-dashed border-border rounded-lg text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
              <p>No prescriptions found</p>
            </div>
          )}
        </div>

        {/* Preview Dialog */}
        <Dialog open={!!selectedPrescription} onOpenChange={(open) => !open && setSelectedPrescription(null)}>
          <DialogContent className="max-w-4xl h-[85vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Prescription Preview</DialogTitle>
              <DialogDescription>
                Preview the digital copy of your prescription. You can also download it from the top/bottom bar of the viewer.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 w-full bg-slate-100 rounded-md overflow-hidden mt-4">
              {selectedDetails && (
                <PDFViewer width="100%" height="100%" className="border-none">
                  <PrescriptionPDF {...selectedDetails} />
                </PDFViewer>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
