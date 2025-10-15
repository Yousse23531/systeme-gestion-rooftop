import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Employee, PresenceRecord } from "../types";
import { toast } from "sonner";
import { Trash2, Edit, Plus } from "lucide-react";

interface PresenceDialogProps {
  employee: Employee;
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Employee) => void;
}

export function PresenceDialog({ employee, isOpen, onClose, onSave }: PresenceDialogProps) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);
  const [newStatus, setNewStatus] = useState<PresenceRecord["status"]>("present");
  const [editingPresence, setEditingPresence] = useState<PresenceRecord | null>(null);

  const recalculateCounters = (presences: PresenceRecord[]) => {
    let joursTravailles = 0;
    let absences = 0;
    let soldeMaladie = employee.soldeMaladie;

    presences.forEach(presence => {
      if (presence.status === "present") {
        joursTravailles += 1;
      } else if (presence.status === "absent") {
        absences += 1;
      } else if (presence.status === "malade") {
        // Deduct from sick balance if available
        if (soldeMaladie > 0) {
          soldeMaladie = Math.max(0, soldeMaladie - 1);
        }
      }
      // "off" status doesn't affect counters
    });

    return { joursTravailles, absences, soldeMaladie };
  };

  const handleAddPresence = () => {
    if (!newDate || !newStatus) return;

    // Check if presence already exists for this date
    const existingPresence = employee.presences.find(p => p.date === newDate);
    if (existingPresence) {
      toast.error("Une présence existe déjà pour cette date");
      return;
    }

    const newPresence: PresenceRecord = {
      date: newDate,
      status: newStatus,
    };

    const updatedPresences = [...employee.presences, newPresence];
    const { joursTravailles, absences, soldeMaladie } = recalculateCounters(updatedPresences);

    const updatedEmployee: Employee = {
      ...employee,
      presences: updatedPresences,
      joursTravailles,
      absences,
      soldeMaladie,
    };

    onSave(updatedEmployee);
    toast.success("Présence ajoutée avec succès");
    setIsAddingNew(false);
    setNewDate(new Date().toISOString().split("T")[0]);
    setNewStatus("present");
  };

  const handleEditPresence = (presence: PresenceRecord) => {
    setEditingPresence(presence);
  };

  const handleUpdatePresence = () => {
    if (!editingPresence) return;

    const updatedPresences = employee.presences.map(p => 
      p.date === editingPresence.date ? editingPresence : p
    );

    const { joursTravailles, absences, soldeMaladie } = recalculateCounters(updatedPresences);

    const updatedEmployee: Employee = {
      ...employee,
      presences: updatedPresences,
      joursTravailles,
      absences,
      soldeMaladie,
    };

    onSave(updatedEmployee);
    toast.success("Présence modifiée avec succès");
    setEditingPresence(null);
  };

  const handleDeletePresence = (date: string) => {
    const updatedPresences = employee.presences.filter(p => p.date !== date);
    const { joursTravailles, absences, soldeMaladie } = recalculateCounters(updatedPresences);

    const updatedEmployee: Employee = {
      ...employee,
      presences: updatedPresences,
      joursTravailles,
      absences,
      soldeMaladie,
    };

    onSave(updatedEmployee);
    toast.success("Présence supprimée avec succès");
  };

  const getStatusLabel = (status: PresenceRecord["status"]) => {
    switch (status) {
      case "present": return "Présent";
      case "absent": return "Absent";
      case "malade": return "Malade";
      case "off": return "Off";
      default: return status;
    }
  };

  const getStatusColor = (status: PresenceRecord["status"]) => {
    switch (status) {
      case "present": return "text-green-600";
      case "absent": return "text-red-600";
      case "malade": return "text-orange-600";
      case "off": return "text-blue-600";
      default: return "text-gray-600";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gestion des présences - {employee.prenom} {employee.nom}</DialogTitle>
          <DialogDescription>
            Gérez les présences de l'employé
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Résumé</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Jours travaillés:</span>
                <span className="ml-2 font-semibold">{employee.joursTravailles}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Absences:</span>
                <span className="ml-2 font-semibold">{employee.absences}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Solde maladie:</span>
                <span className="ml-2 font-semibold">{employee.soldeMaladie}</span>
              </div>
            </div>
          </div>

          {/* Add New Presence */}
          {isAddingNew ? (
            <div className="border p-4 rounded-lg space-y-4">
              <h3 className="font-semibold">Ajouter une présence</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-date">Date</Label>
                  <Input
                    id="new-date"
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                  />
                </div>
          <div className="space-y-2">
            <Label>Statut</Label>
                  <RadioGroup value={newStatus} onValueChange={(value) => setNewStatus(value as PresenceRecord["status"])}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="present" id="new-present" />
                      <Label htmlFor="new-present" className="font-normal cursor-pointer">Présent</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="absent" id="new-absent" />
                      <Label htmlFor="new-absent" className="font-normal cursor-pointer">Absent</Label>
                    </div>
              <div className="flex items-center space-x-2">
                      <RadioGroupItem value="malade" id="new-malade" />
                      <Label htmlFor="new-malade" className="font-normal cursor-pointer">Malade</Label>
              </div>
              <div className="flex items-center space-x-2">
                      <RadioGroupItem value="off" id="new-off" />
                      <Label htmlFor="new-off" className="font-normal cursor-pointer">Off</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddPresence}>Ajouter</Button>
                <Button variant="outline" onClick={() => setIsAddingNew(false)}>Annuler</Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setIsAddingNew(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une présence
            </Button>
          )}

          {/* Edit Presence Dialog */}
          {editingPresence && (
            <div className="border p-4 rounded-lg space-y-4">
              <h3 className="font-semibold">Modifier la présence</h3>
              <div className="space-y-2">
                <Label>Date: {editingPresence.date}</Label>
                <Label>Statut</Label>
                <RadioGroup 
                  value={editingPresence.status} 
                  onValueChange={(value) => setEditingPresence({...editingPresence, status: value as PresenceRecord["status"]})}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="present" id="edit-present" />
                    <Label htmlFor="edit-present" className="font-normal cursor-pointer">Présent</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="absent" id="edit-absent" />
                    <Label htmlFor="edit-absent" className="font-normal cursor-pointer">Absent</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="malade" id="edit-malade" />
                    <Label htmlFor="edit-malade" className="font-normal cursor-pointer">Malade</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="off" id="edit-off" />
                    <Label htmlFor="edit-off" className="font-normal cursor-pointer">Off</Label>
            </div>
            </RadioGroup>
          </div>
              <div className="flex gap-2">
                <Button onClick={handleUpdatePresence}>Mettre à jour</Button>
                <Button variant="outline" onClick={() => setEditingPresence(null)}>Annuler</Button>
              </div>
            </div>
          )}

          {/* Presence Records Table */}
          <div>
            <h3 className="font-semibold mb-4">Historique des présences</h3>
            {employee.presences.length === 0 ? (
              <p className="text-muted-foreground">Aucune présence enregistrée</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employee.presences
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((presence) => (
                    <TableRow key={presence.date}>
                      <TableCell>{new Date(presence.date).toLocaleDateString("fr-FR")}</TableCell>
                      <TableCell>
                        <span className={getStatusColor(presence.status)}>
                          {getStatusLabel(presence.status)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditPresence(presence)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeletePresence(presence.date)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
