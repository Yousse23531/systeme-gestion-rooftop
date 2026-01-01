import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { History, UserCircle } from "lucide-react";
import { Employee } from "../types";
import { getEmployees } from "../lib/storage";

export function Historique() {
  const [deletedEmployees, setDeletedEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    loadDeletedEmployees();
  }, []);

  const loadDeletedEmployees = () => {
    const allEmployees = getEmployees();
    const deleted = allEmployees.filter(e => e.deleted);
    // Sort by deletion date, most recent first
    deleted.sort((a, b) => {
      const dateA = new Date(a.deletedAt || 0).getTime();
      const dateB = new Date(b.deletedAt || 0).getTime();
      return dateB - dateA;
    });
    setDeletedEmployees(deleted);
  };

  const calculateFinalSalary = (employee: Employee) => {
    const salaireBase = employee.joursTravailles * employee.salaireParJour;
    const deductions = (employee.absences * employee.salaireParJour) + employee.avance;
    return salaireBase - deductions;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Historique</h1>
        <p className="text-muted-foreground">Employés supprimés et archives</p>
      </div>

      {deletedEmployees.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <History className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucun employé dans l'historique</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {deletedEmployees.map((employee) => (
            <Card key={employee.id} className="border-muted">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <UserCircle className="h-5 w-5 text-muted-foreground" />
                      {employee.prenom} {employee.nom}
                    </CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary">{employee.poste}</Badge>
                      <Badge variant="outline">Supprimé</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Salaire/jour</p>
                    <p>{employee.salaireParJour.toFixed(2)} TND</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Jours travaillés</p>
                    <p>{employee.joursTravailles}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Absences</p>
                    <p>{employee.absences}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Avance</p>
                    <p>{employee.avance.toFixed(2)} TND</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Solde maladie</p>
                    <p>{employee.soldeMaladie.toFixed(2)} TND</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Salaire final</p>
                    <p className="font-semibold">{calculateFinalSalary(employee).toFixed(2)} TND</p>
                  </div>
                </div>

                {employee.deletedAt && (
                  <div className="pt-3 border-t">
                    <p className="text-xs text-muted-foreground">
                      Supprimé le {new Date(employee.deletedAt).toLocaleDateString("fr-FR")} à{" "}
                      {new Date(employee.deletedAt).toLocaleTimeString("fr-FR")}
                    </p>
                  </div>
                )}

                {employee.presences.length > 0 && (
                  <div className="pt-3 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Dernières présences:</p>
                    <div className="space-y-1">
                      {employee.presences.slice(-3).reverse().map((presence, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span>{new Date(presence.date).toLocaleDateString("fr-FR")}</span>
                          <Badge variant="outline" className="text-xs">
                            {presence.status === "present" && "Présent"}
                            {presence.status === "absent" && "Absent"}
                            {presence.status === "malade" && "Malade"}
                            {presence.status === "retard" && `Retard (${presence.retardMinutes === 31 ? "+30min" : `${presence.retardMinutes}min`})`}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
