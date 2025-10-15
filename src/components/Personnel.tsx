import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Plus, UserCircle, Trash2 } from "lucide-react";
import { Employee, PresenceRecord } from "../types";
import { getEmployees, saveEmployees } from "../lib/storage";
import { toast } from "sonner";
import { EmployeeCard } from "./EmployeeCard";
import { PresenceDialog } from "./PresenceDialog";
import { MonthlyReset } from "./MonthlyReset";
import { exportDataToPDF } from "../lib/pdfExport";
import { Download } from "lucide-react";

export function Personnel() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isPresenceDialogOpen, setIsPresenceDialogOpen] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = () => {
    const data = getEmployees().filter(e => !e.deleted);
    setEmployees(data);
  };

  const handleAddEmployee = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newEmployee: Employee = {
      id: Date.now().toString(),
      nom: formData.get("nom") as string,
      prenom: formData.get("prenom") as string,
      poste: formData.get("poste") as string,
      salaireParJour: parseFloat(formData.get("salaireParJour") as string),
        salaireTotal: formData.get("salaireTotal") ? parseFloat(formData.get("salaireTotal") as string) : undefined,
      joursTravailles: 0,
      soldeMaladie: parseFloat(formData.get("soldeMaladie") as string) || 0,
      avance: 0,
      absences: 0,
      presences: [],
    };

    const allEmployees = getEmployees();
    allEmployees.push(newEmployee);
    saveEmployees(allEmployees);
    loadEmployees();
    setIsAddDialogOpen(false);
    toast.success("Employé ajouté avec succès");
  };

  const handleDeleteEmployee = (id: string) => {
    const allEmployees = getEmployees();
    const employeeIndex = allEmployees.findIndex(e => e.id === id);
    
    if (employeeIndex !== -1) {
      allEmployees[employeeIndex].deleted = true;
      allEmployees[employeeIndex].deletedAt = new Date().toISOString();
      saveEmployees(allEmployees);
      loadEmployees();
      toast.success("Employé supprimé et déplacé vers l'historique");
    }
  };

  const handleUpdateEmployee = (updatedEmployee: Employee) => {
    const allEmployees = getEmployees();
    const index = allEmployees.findIndex(e => e.id === updatedEmployee.id);
    if (index !== -1) {
      allEmployees[index] = updatedEmployee;
      saveEmployees(allEmployees);
      loadEmployees();
    }
  };

  const handleExportPDF = async () => {
    const success = await exportDataToPDF(
      {
        type: 'employees',
        employees: employees
      },
      'Liste des Employés',
      `employes_${new Date().toISOString().split('T')[0]}`
    );
    
    if (success) {
      toast.success("PDF exporté avec succès");
    } else {
      toast.error("Erreur lors de l'export PDF");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Gestion du Personnel</h1>
          <p className="text-muted-foreground">Gérez vos employés et leurs présences</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportPDF} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exporter PDF
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un employé
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un nouvel employé</DialogTitle>
              <DialogDescription>
                Remplissez les informations pour créer un nouveau profil employé
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom</Label>
                  <Input id="nom" name="nom" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prenom">Prénom</Label>
                  <Input id="prenom" name="prenom" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="poste">Poste</Label>
                <Input id="poste" name="poste" required placeholder="Ex: Serveur, Barista, Cuisinier" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salaireParJour">Salaire par jour (TND)</Label>
                  <Input id="salaireParJour" name="salaireParJour" type="number" step="0.01" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="soldeMaladie">Solde maladie (TND)</Label>
                  <Input id="soldeMaladie" name="soldeMaladie" type="number" step="0.01" defaultValue="0" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaireTotal">Salaire total (mensuel, optionnel)</Label>
                <Input id="salaireTotal" name="salaireTotal" type="number" step="0.01" placeholder="Ex: 1200.00" />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">Ajouter</Button>
              </div>
            </form>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      {employees.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <UserCircle className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Aucun employé enregistré</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter votre premier employé
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {employees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onDelete={handleDeleteEmployee}
              onUpdate={handleUpdateEmployee}
              onMarkPresence={(emp) => {
                setSelectedEmployee(emp);
                setIsPresenceDialogOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {selectedEmployee && (
        <PresenceDialog
          employee={selectedEmployee}
          isOpen={isPresenceDialogOpen}
          onClose={() => {
            setIsPresenceDialogOpen(false);
            setSelectedEmployee(null);
          }}
          onSave={(updatedEmployee) => {
            handleUpdateEmployee(updatedEmployee);
            setIsPresenceDialogOpen(false);
            setSelectedEmployee(null);
          }}
        />
      )}

      <MonthlyReset />
    </div>
  );
}
