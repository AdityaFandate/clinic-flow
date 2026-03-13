import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Send, HeartPulse } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogHeader } from '@/components/ui/dialog';
import { PDFViewer } from '@react-pdf/renderer';
import { PrescriptionPDF } from '@/components/pdf/PrescriptionPDF';

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export default function WritePrescription() {
  const [patientName, setPatientName] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([{ name: '', dosage: '', frequency: '', duration: '' }]);
  const [instructions, setInstructions] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const addMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const removeMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const updateMedicine = (index: number, field: keyof Medicine, value: string) => {
    const newMedicines = [...medicines];
    newMedicines[index][field] = value;
    setMedicines(newMedicines);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Prescription generated and shared with patient!');
    // Reset form
    setPatientName('');
    setDiagnosis('');
    setMedicines([{ name: '', dosage: '', frequency: '', duration: '' }]);
    setInstructions('');
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg text-primary">
            <HeartPulse className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Write Prescription</h1>
            <p className="text-sm text-muted-foreground">Generate a medical prescription for your patient</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="patient">Patient Name</Label>
                <Input 
                  id="patient" 
                  placeholder="e.g. Rahul Sharma" 
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <Input 
                  id="diagnosis" 
                  placeholder="e.g. Mild Hypertension" 
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  required 
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Medicines</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addMedicine} className="gap-1">
                <Plus className="h-4 w-4" /> Add Medicine
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {medicines.map((med, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 rounded-lg border border-dashed border-border relative group">
                  <div className="space-y-2">
                    <Label className="text-xs">Medicine Name</Label>
                    <Input 
                      placeholder="Paracetamol" 
                      value={med.name}
                      onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Dosage</Label>
                    <Input 
                      placeholder="500mg" 
                      value={med.dosage}
                      onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Frequency</Label>
                    <Input 
                      placeholder="1-0-1 (After Food)" 
                      value={med.frequency}
                      onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Duration</Label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="5 Days" 
                        value={med.duration}
                        onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                        required 
                      />
                      {medicines.length > 1 && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeMedicine(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                placeholder="Any lifestyle changes, next follow-up, etc." 
                className="min-h-[100px]" 
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline">Preview</Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] h-[80vh] flex flex-col">
                <DialogHeader>
                  <DialogTitle>Prescription Preview</DialogTitle>
                  <DialogDescription>Review the generated PDF before sending.</DialogDescription>
                </DialogHeader>
                <div className="flex-1 w-full bg-slate-100 rounded-md overflow-hidden min-h-[400px]">
                  {isPreviewOpen && (
                    <PDFViewer width="100%" height="100%" className="border-0">
                      <PrescriptionPDF 
                        data={{
                          patientName,
                          diagnosis,
                          medicines,
                          instructions,
                          date: new Date().toLocaleDateString()
                        }} 
                      />
                    </PDFViewer>
                  )}
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="button" onClick={() => setIsPreviewOpen(false)}>Close Preview</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button type="submit" className="gap-2">
              <Send className="h-4 w-4" /> Generate & Send
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
