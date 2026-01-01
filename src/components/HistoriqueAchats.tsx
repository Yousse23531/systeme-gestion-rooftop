import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Archive, ShoppingCart } from "lucide-react";
import { Achat } from "../types";
import { getHistoriqueAchats } from "../lib/storage";

export function HistoriqueAchats() {
  const [historiqueAchats, setHistoriqueAchats] = useState<Achat[]>([]);

  useEffect(() => {
    loadHistoriqueAchats();
  }, []);

  const loadHistoriqueAchats = () => {
    setHistoriqueAchats(getHistoriqueAchats());
  };

  // Group achats by month
  const groupedAchats = historiqueAchats.reduce((groups, achat) => {
    const month = achat.archivedMonth || 'Unknown';
    if (!groups[month]) {
      groups[month] = [];
    }
    groups[month].push(achat);
    return groups;
  }, {} as Record<string, Achat[]>);

  // Sort months in descending order
  const sortedMonths = Object.keys(groupedAchats).sort((a, b) => b.localeCompare(a));

  const formatMonthName = (month: string) => {
    if (month === 'Unknown') return 'Mois inconnu';
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
  };

  const getMonthTotal = (achats: Achat[]) => {
    return achats.reduce((sum, achat) => sum + achat.montant, 0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Historique des Achats</h1>
        <p className="text-muted-foreground">Archives de tous les achats réinitialisés</p>
      </div>

      {historiqueAchats.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Archive className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucun achat archivé</p>
            <p className="text-sm text-muted-foreground mt-2">
              Les achats apparaîtront ici après une réinitialisation
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedMonths.map((month) => {
            const monthAchats = groupedAchats[month];
            const monthTotal = getMonthTotal(monthAchats);
            
            return (
              <Card key={month}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Archive className="h-5 w-5" />
                      {formatMonthName(month)}
                    </CardTitle>
                    <Badge variant="secondary">
                      {monthAchats.length} achat{monthAchats.length > 1 ? 's' : ''} - {monthTotal.toFixed(2)} TND
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Article</TableHead>
                        <TableHead>Quantité</TableHead>
                        <TableHead className="text-right">Montant</TableHead>
                        <TableHead className="text-right">Archivé le</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthAchats
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((achat) => (
                        <TableRow key={achat.id}>
                          <TableCell>{new Date(achat.date).toLocaleDateString("fr-FR")}</TableCell>
                          <TableCell>
                            {achat.article}
                            {achat.expiree && (
                              <div className="text-xs text-red-600 font-medium mt-1">PÉRIMER ({achat.expireeQuantite} - {achat.expireeMotif})</div>
                            )}
                            {achat.supprime && (
                              <div className="text-xs text-red-600 font-medium mt-1">SUPPRIMÉ ({achat.supprimeMotif})</div>
                            )}
                          </TableCell>
                          <TableCell>{achat.quantite}</TableCell>
                          <TableCell className="text-right">{achat.montant.toFixed(2)} TND</TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground">
                            {achat.archivedAt ? new Date(achat.archivedAt).toLocaleDateString("fr-FR") : '-'}
                            {achat.expireeDate && (
                              <div className="text-xs">Périmer le: {new Date(achat.expireeDate).toLocaleDateString("fr-FR")}</div>
                            )}
                            {achat.supprimeDate && (
                              <div className="text-xs">Supprimé le: {new Date(achat.supprimeDate).toLocaleDateString("fr-FR")}</div>
                            )}
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
