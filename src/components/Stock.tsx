import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Package, AlertTriangle, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { StockItem } from "../types";
import { getStock, saveStock } from "../lib/storage";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { PinDialog } from "./PinDialog";

export function Stock() {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStockId, setSelectedStockId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    loadStock();
  }, []);

  const loadStock = () => {
    setStock(getStock());
  };

  const getStockStatus = (quantite: number) => {
    if (quantite === 0) return { label: "Rupture", variant: "destructive" as const };
    if (quantite < 10) return { label: "Faible", variant: "default" as const };
    return { label: "Disponible", variant: "secondary" as const };
  };

  const handleDeleteStockItem = (itemId: string) => {
    setSelectedStockId(itemId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteStockItem = () => {
    if (!selectedStockId) return;
    
    setPendingAction(() => () => {
      const allStock = getStock();
      const updatedStock = allStock.filter(item => item.id !== selectedStockId);
      saveStock(updatedStock);
      loadStock();
      toast.success("Article supprimé du stock");
    });
    setIsDeleteDialogOpen(false);
    setIsPinDialogOpen(true);
  };

  const handlePinSuccess = () => {
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Gestion du Stock</h1>
        <p className="text-muted-foreground">Suivez vos articles en stock</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Articles en stock ({stock.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {stock.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucun article en stock</p>
              <p className="text-sm text-muted-foreground mt-2">
                Les articles seront ajoutés automatiquement lors de vos achats
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Article</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Unité</TableHead>
                  <TableHead>Date d'ajout</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stock.map((item) => {
                  const status = getStockStatus(item.quantite);
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {item.quantite === 0 && <AlertTriangle className="h-4 w-4 text-destructive" />}
                          {item.nom}
                        </div>
                      </TableCell>
                      <TableCell>{item.quantite.toFixed(2)}</TableCell>
                      <TableCell>{item.unite}</TableCell>
                      <TableCell>{new Date(item.dateAjout).toLocaleDateString("fr-FR")}</TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteStockItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'article du stock</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cet article du stock ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteStockItem}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PinDialog
        isOpen={isPinDialogOpen}
        onClose={() => setIsPinDialogOpen(false)}
        onSuccess={handlePinSuccess}
        title="Confirmation de suppression"
        description="Entrez le code PIN pour confirmer cette action"
        pinType="delete"
      />
    </div>
  );
}
