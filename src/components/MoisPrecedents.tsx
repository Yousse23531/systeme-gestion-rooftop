import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Archive, Eye, Download, Printer, Trash2 } from "lucide-react";
import { MonthlyArchive } from "../types";
import { getMonthlyArchives, saveMonthlyArchives } from "../lib/storage";
import { toast } from "sonner";

export function MoisPrecedents() {
  const [archives, setArchives] = useState<MonthlyArchive[]>([]);
  const [selectedArchive, setSelectedArchive] = useState<MonthlyArchive | null>(null);

  useEffect(() => {
    loadArchives();
  }, []);

  const loadArchives = () => {
    const data = getMonthlyArchives();
    // Sort by month descending (most recent first)
    data.sort((a, b) => b.month.localeCompare(a.month));
    setArchives(data);
  };

  const handleDeleteArchive = (archiveId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette archive mensuelle ?")) {
      const updatedArchives = archives.filter(a => a.id !== archiveId);
      saveMonthlyArchives(updatedArchives);
      loadArchives();
      toast.success("Archive supprimée");
    }
  };

  const formatMonthName = (monthString: string) => {
    const [year, month] = monthString.split('-');
    const monthNames = [
      "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
      "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  const handlePrint = (archive: MonthlyArchive) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const monthName = formatMonthName(archive.month);
      printWindow.document.write(`
        <html>
          <head>
            <title>Archive - ${monthName}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .section { margin-bottom: 25px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .summary { background-color: #f9f9f9; padding: 15px; border-radius: 5px; }
              .total { font-weight: bold; color: #2c5aa0; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Café Management System</h1>
              <h2>Archive Mensuelle - ${monthName}</h2>
              <p>Archivé le ${new Date(archive.archivedAt).toLocaleDateString("fr-FR")}</p>
            </div>

            <div class="section">
              <h3>Résumé Financier</h3>
              <div class="summary">
                <p><strong>Chiffre d'affaires:</strong> ${archive.revenues.totalRecettes.toFixed(2)} TND</p>
                <p><strong>Salaires totaux:</strong> ${archive.expenses.salaries.toFixed(2)} TND</p>
                <p><strong>Achats totaux:</strong> ${archive.expenses.achats.toFixed(2)} TND</p>
                <p><strong>Maintenance:</strong> ${archive.expenses.maintenances.toFixed(2)} TND</p>
                <p class="total">Total dépenses: ${archive.expenses.total.toFixed(2)} TND</p>
                <p class="total">Bénéfice: ${(archive.revenues.totalRecettes - archive.expenses.total).toFixed(2)} TND</p>
              </div>
            </div>

            <div class="section">
              <h3>Employés (${archive.employees.length})</h3>
              <table>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Poste</th>
                    <th>Jours travaillés</th>
                    <th>Absences</th>
                    <th>Salaire total</th>
                  </tr>
                </thead>
                <tbody>
                  ${archive.employees.map(emp => {
                    const salaireTotal = (emp.joursTravailles * emp.salaireParJour) - 
                                      (emp.absences * emp.salaireParJour) - emp.avance;
                    return `
                      <tr>
                        <td>${emp.prenom} ${emp.nom}</td>
                        <td>${emp.poste}</td>
                        <td>${emp.joursTravailles}</td>
                        <td>${emp.absences}</td>
                        <td>${salaireTotal.toFixed(2)} TND</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownload = (archive: MonthlyArchive) => {
    const monthName = formatMonthName(archive.month);
    const jsonData = JSON.stringify(archive, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `archive-${archive.month}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Archive téléchargée");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Les Mois Précédents</h1>
        <p className="text-muted-foreground">Archives des mois précédents - dépenses, recettes et données d'employés</p>
      </div>

      {archives.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Archive className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucune archive mensuelle disponible</p>
            <p className="text-sm text-muted-foreground mt-2">
              Les archives apparaîtront ici après la première réinitialisation mensuelle
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {archives.map((archive) => (
            <Card key={archive.id} className="border-l-4 border-l-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{formatMonthName(archive.month)}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Archivé le {new Date(archive.archivedAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedArchive(archive)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Voir détails
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePrint(archive)}
                    >
                      <Printer className="mr-2 h-4 w-4" />
                      Imprimer
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(archive)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Télécharger
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteArchive(archive.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Employés</p>
                    <p className="text-lg font-semibold">{archive.employees.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Chiffre d'affaires</p>
                  <p className="text-lg font-semibold">{archive.revenues.totalRecettes.toFixed(2)} TND</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total dépenses</p>
                    <p className="text-lg font-semibold text-destructive">{archive.expenses.total.toFixed(2)} TND</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bénéfice</p>
                    <p className={`text-lg font-semibold ${
                      (archive.revenues.totalRecettes - archive.expenses.total) >= 0 
                        ? 'text-green-600' 
                        : 'text-destructive'
                    }`}>
                      {(archive.revenues.totalRecettes - archive.expenses.total).toFixed(2)} TND
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Archive Details Dialog */}
      <Dialog open={!!selectedArchive} onOpenChange={() => setSelectedArchive(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Détails de l'archive - {selectedArchive ? formatMonthName(selectedArchive.month) : ''}
            </DialogTitle>
            <DialogDescription>
              Informations complètes pour le mois archivé
            </DialogDescription>
          </DialogHeader>
          {selectedArchive && (
            <div className="space-y-6">
              {/* Financial Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Résumé Financier</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Chiffre d'attaires</p>
                      <p className="text-xl font-bold text-blue-600">{selectedArchive.revenues.totalRecettes.toFixed(2)} TND</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Salaires</p>
                      <p className="text-xl font-bold text-red-600">{selectedArchive.expenses.salaries.toFixed(2)} TND</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Achats</p>
                      <p className="text-xl font-bold text-orange-600">{selectedArchive.expenses.achats.toFixed(2)} TND</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Maintenance</p>
                      <p className="text-xl font-bold text-purple-600">{selectedArchive.expenses.maintenances.toFixed(2)} TND</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total dépenses</span>
                      <span className="text-xl font-bold text-destructive">{selectedArchive.expenses.total.toFixed(2)} TND</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-lg font-semibold">Bénéfice</span>
                      <span className={`text-xl font-bold ${
                        (selectedArchive.revenues.totalRecettes - selectedArchive.expenses.total) >= 0 
                          ? 'text-green-600' 
                          : 'text-destructive'
                      }`}>
                        {(selectedArchive.revenues.totalRecettes - selectedArchive.expenses.total).toFixed(2)} TND
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Employees */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Employés ({selectedArchive.employees.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Poste</TableHead>
                        <TableHead>Jours travaillés</TableHead>
                        <TableHead>Absences</TableHead>
                        <TableHead>Avance</TableHead>
                        <TableHead>Salaire final</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedArchive.employees.map(employee => {
                        const salaireTotal = (employee.joursTravailles * employee.salaireParJour) - 
                                            (employee.absences * employee.salaireParJour) - employee.avance;
                        return (
                          <TableRow key={employee.id}>
                            <TableCell>{employee.prenom} {employee.nom}</TableCell>
                            <TableCell>{employee.poste}</TableCell>
                            <TableCell>{employee.joursTravailles}</TableCell>
                            <TableCell>{employee.absences}</TableCell>
                            <TableCell>{employee.avance.toFixed(2)} TND</TableCell>
                            <TableCell className="font-semibold">{salaireTotal.toFixed(2)} TND</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
