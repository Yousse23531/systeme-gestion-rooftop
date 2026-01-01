import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Archive, Wrench } from "lucide-react";
import { Maintenance } from "../types";
import { getHistoriqueMaintenances } from "../lib/storage";

export function HistoriqueMaintenances() {
  const [historiqueMaintenances, setHistoriqueMaintenances] = useState<Maintenance[]>([]);

  useEffect(() => {
    loadHistoriqueMaintenances();
  }, []);

  const loadHistoriqueMaintenances = () => {
    setHistoriqueMaintenances(getHistoriqueMaintenances());
  };

  // Group maintenances by month
  const groupedMaintenances = historiqueMaintenances.reduce((groups, maintenance) => {
    const month = maintenance.archivedMonth || 'Unknown';
    if (!groups[month]) {
      groups[month] = [];
    }
    groups[month].push(maintenance);
    return groups;
  }, {} as Record<string, Maintenance[]>);

  // Sort months in descending order
  const sortedMonths = Object.keys(groupedMaintenances).sort((a, b) => b.localeCompare(a));

  const formatMonthName = (month: string) => {
    if (month === 'Unknown') return 'Mois inconnu';
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
  };

  const getMonthTotal = (maintenances: Maintenance[]) => {
    return maintenances.reduce((sum, maintenance) => sum + maintenance.montant, 0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Historique des Maintenances</h1>
        <p className="text-muted-foreground">Archives de toutes les maintenances réinitialisées</p>
      </div>

      {historiqueMaintenances.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Archive className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucune maintenance archivée</p>
            <p className="text-sm text-muted-foreground mt-2">
              Les maintenances apparaîtront ici après une réinitialisation
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedMonths.map((month) => {
            const monthMaintenances = groupedMaintenances[month];
            const monthTotal = getMonthTotal(monthMaintenances);
            
            return (
              <Card key={month}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Archive className="h-5 w-5" />
                      {formatMonthName(month)}
                    </CardTitle>
                    <Badge variant="secondary">
                      {monthMaintenances.length} maintenance{monthMaintenances.length > 1 ? 's' : ''} - {monthTotal.toFixed(2)} TND
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Durée</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Montant</TableHead>
                        <TableHead className="text-right">Archivé le</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthMaintenances
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((maintenance) => (
                        <TableRow key={maintenance.id}>
                          <TableCell>{new Date(maintenance.date).toLocaleDateString("fr-FR")}</TableCell>
                          <TableCell>{maintenance.service}</TableCell>
                          <TableCell>{maintenance.temps}</TableCell>
                          <TableCell className="max-w-xs truncate">{maintenance.description}</TableCell>
                          <TableCell className="text-right">{maintenance.montant.toFixed(2)} TND</TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground">
                            {maintenance.archivedAt ? new Date(maintenance.archivedAt).toLocaleDateString("fr-FR") : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
