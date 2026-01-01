import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Archive, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { DashboardHistory } from "../types";
import { getDashboardHistory } from "../lib/storage";

export function HistoriqueCDBenefice() {
  const [dashboardHistory, setDashboardHistory] = useState<DashboardHistory[]>([]);

  useEffect(() => {
    loadDashboardHistory();
  }, []);

  const loadDashboardHistory = () => {
    setDashboardHistory(getDashboardHistory());
  };

  // Group by month
  const groupedHistory = dashboardHistory.reduce((groups, entry) => {
    const month = entry.month;
    if (!groups[month]) {
      groups[month] = [];
    }
    groups[month].push(entry);
    return groups;
  }, {} as Record<string, DashboardHistory[]>);

  // Sort months in descending order
  const sortedMonths = Object.keys(groupedHistory).sort((a, b) => b.localeCompare(a));

  const formatMonthName = (month: string) => {
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
  };

  const getBeneficeColor = (benefice: number) => {
    if (benefice > 0) return "text-green-600";
    if (benefice < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getBeneficeIcon = (benefice: number) => {
    if (benefice > 0) return <TrendingUp className="h-4 w-4" />;
    if (benefice < 0) return <TrendingDown className="h-4 w-4" />;
    return <DollarSign className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Historique CD et Bénéfice</h1>
        <p className="text-muted-foreground">Archives des tableaux de bord et calculs de bénéfices</p>
      </div>

      {dashboardHistory.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Archive className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucun historique de tableau de bord</p>
            <p className="text-sm text-muted-foreground mt-2">
              L'historique apparaîtra ici après une réinitialisation du tableau de bord
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedMonths.map((month) => {
            const monthEntries = groupedHistory[month];
            const monthTotalRecettes = monthEntries.reduce((sum, entry) => sum + entry.totalRecettes, 0);
            const monthTotalDepenses = monthEntries.reduce((sum, entry) => sum + entry.totalDepenses, 0);
            const monthTotalBenefice = monthTotalRecettes - monthTotalDepenses;
            
            return (
              <Card key={month}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Archive className="h-5 w-5" />
                      {formatMonthName(month)}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="secondary">
                        {monthEntries.length} entrée{monthEntries.length > 1 ? 's' : ''}
                      </Badge>
                      <Badge 
                        variant={monthTotalBenefice > 0 ? "default" : monthTotalBenefice < 0 ? "destructive" : "secondary"}
                        className="flex items-center gap-1"
                      >
                        {getBeneficeIcon(monthTotalBenefice)}
                        {monthTotalBenefice.toFixed(2)} TND
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Recettes</TableHead>
                        <TableHead className="text-right">Dépenses</TableHead>
                        <TableHead className="text-right">Bénéfice</TableHead>
                        <TableHead className="text-right">Achats</TableHead>
                        <TableHead className="text-right">Maintenances</TableHead>
                        <TableHead className="text-right">Salaires</TableHead>
                        <TableHead className="text-right">Archivé le</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthEntries
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>{new Date(entry.date).toLocaleDateString("fr-FR")}</TableCell>
                          <TableCell className="text-right text-green-600 font-semibold">
                            {entry.totalRecettes.toFixed(2)} TND
                          </TableCell>
                          <TableCell className="text-right text-red-600 font-semibold">
                            {entry.totalDepenses.toFixed(2)} TND
                          </TableCell>
                          <TableCell className={`text-right font-bold ${getBeneficeColor(entry.benefice)}`}>
                            <div className="flex items-center justify-end gap-1">
                              {getBeneficeIcon(entry.benefice)}
                              {entry.benefice.toFixed(2)} TND
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{entry.totalAchats.toFixed(2)} TND</TableCell>
                          <TableCell className="text-right">{entry.totalMaintenances.toFixed(2)} TND</TableCell>
                          <TableCell className="text-right">{entry.totalSalaires.toFixed(2)} TND</TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground">
                            {new Date(entry.archivedAt).toLocaleDateString("fr-FR")}
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
