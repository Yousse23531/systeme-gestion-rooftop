import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Plus, ShoppingCart, RotateCcw, RefreshCw, Trash2, CreditCard, DollarSign, Edit } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Achat, StockItem } from "../types";
import { getAchats, saveAchats, getStock, saveStock, resetAchats } from "../lib/storage";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { PinDialog } from "./PinDialog";
import { useState } from "react";

export function Achats() {
  const [achats, setAchats] = useState<Achat[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAchatId, setSelectedAchatId] = useState<string | null>(null);
  const [editingAchat, setEditingAchat] = useState<Achat | null>(null);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    loadAchats();
  }, []);

  const loadAchats = () => {
    setAchats(getAchats());
  };

  const handleAddAchat = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newAchat: Achat = {
      id: Date.now().toString(),
      date: formData.get("date") as string,
      article: formData.get("article") as string,
      quantite: parseFloat(formData.get("quantite") as string),
      montant: parseFloat(formData.get("montant") as string),
      paye: formData.get("paye") === "true",
    };

    const allAchats = getAchats();
    allAchats.push(newAchat);
    saveAchats(allAchats);

    // Add to stock
    const stock = getStock();
    const existingStockItem = stock.find(s => s.nom.toLowerCase() === newAchat.article.toLowerCase());
    
    if (existingStockItem) {
      existingStockItem.quantite += newAchat.quantite;
    } else {
      const newStockItem: StockItem = {
        id: Date.now().toString(),
        nom: newAchat.article,
        quantite: newAchat.quantite,
        unite: formData.get("unite") as string || "unité",
        dateAjout: newAchat.date,
      };
      stock.push(newStockItem);
    }
    saveStock(stock);

    loadAchats();
    setIsDialogOpen(false);
    toast.success("Achat ajouté et stock mis à jour");
  };

  const totalAchatsPayes = achats.reduce((sum, a) => sum + (a.paye ? a.montant : 0), 0);
  const totalAchatsCredit = achats.reduce((sum, a) => sum + (!a.paye ? a.montant : 0), 0);
  const totalAchats = achats.reduce((sum, a) => sum + a.montant, 0);

  const handleResetAchats = () => {
    setPendingAction(() => () => {
      resetAchats();
      loadAchats();
      toast.success("Achats archivés dans l'historique et réinitialisés");
    });
    setIsPinDialogOpen(true);
  };

  const handleEditAchat = (achatId: string) => {
    const achat = achats.find(a => a.id === achatId);
    if (achat) {
      setEditingAchat(achat);
      setIsEditDialogOpen(true);
    }
  };

  const handleUpdateAchat = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingAchat) return;

    const formData = new FormData(e.currentTarget);
    const newPayeStatus = formData.get("paye") === "true";

    const allAchats = getAchats();
    const updatedAchats = allAchats.map(achat => {
      if (achat.id === editingAchat.id) {
        return {
          ...achat,
          paye: newPayeStatus
        };
      }
      return achat;
    });

    saveAchats(updatedAchats);
    loadAchats();
    setIsEditDialogOpen(false);
    setEditingAchat(null);
    toast.success("Statut de paiement mis à jour");
  };

  const toggleAchatStatus = (achatId: string) => {
    const allAchats = getAchats();
    const updatedAchats = allAchats.map(a => a.id === achatId ? { ...a, paye: !a.paye } : a);
    saveAchats(updatedAchats);
    loadAchats();
    toast.success("Statut mis à jour");
  };

  const handlePinSuccess = () => {
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const handleDeleteAchat = (achatId: string) => {
    setSelectedAchatId(achatId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteAchat = () => {
    if (!selectedAchatId) return;
    
    setPendingAction(() => () => {
      const allAchats = getAchats();
      const achatToDelete = allAchats.find(a => a.id === selectedAchatId);
      
      if (achatToDelete) {
        // Remove from stock
        const stock = getStock();
        const stockItem = stock.find(s => s.nom.toLowerCase() === achatToDelete.article.toLowerCase());
        
        if (stockItem) {
          stockItem.quantite -= achatToDelete.quantite;
          if (stockItem.quantite <= 0) {
            // Remove stock item if quantity becomes 0 or negative
            const stockIndex = stock.findIndex(s => s.id === stockItem.id);
            stock.splice(stockIndex, 1);
          }
          saveStock(stock);
        }
        
        // Remove from achats
        const updatedAchats = allAchats.filter(a => a.id !== selectedAchatId);
        saveAchats(updatedAchats);
        loadAchats();
        toast.success("Achat supprimé et stock mis à jour");
      }
    });
    setIsDeleteDialogOpen(false);
    setIsPinDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Gestion des Achats</h1>
          <p className="text-muted-foreground">Enregistrez vos achats et gérez votre stock</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadAchats}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" disabled={achats.length === 0}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Réinitialiser
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Réinitialiser les achats</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action va archiver tous les achats actuels dans l'historique et les supprimer de la liste actuelle. 
                  Cette action est irréversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetAchats}>
                  Confirmer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvel achat
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enregistrer un achat</DialogTitle>
              <DialogDescription>
                Ajoutez un nouvel achat qui sera automatiquement ajouté au stock
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddAchat} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input 
                  id="date" 
                  name="date" 
                  type="date" 
                  defaultValue={new Date().toISOString().split("T")[0]}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="article">Article</Label>
                <Input id="article" name="article" required placeholder="Nom de l'article" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantite">Quantité</Label>
                  <Input id="quantite" name="quantite" type="number" step="0.01" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unite">Unité</Label>
                  <Input id="unite" name="unite" placeholder="kg, L, unité..." defaultValue="unité" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="montant">Montant (TND)</Label>
                <Input id="montant" name="montant" type="number" step="0.01" required />
              </div>
              <div className="space-y-2">
                <Label>Statut de paiement</Label>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="paye" value="true" defaultChecked className="rounded" />
                    <span className="flex items-center gap-1">
                      <CreditCard className="h-4 w-4 text-green-600" />
                      Payé
                    </span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="paye" value="false" className="rounded" />
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-orange-600" />
                      Crédit
                    </span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">Enregistrer</Button>
              </div>
            </form>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total des achats: {totalAchats.toFixed(2)} TND</CardTitle>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>Payés: {totalAchatsPayes.toFixed(2)} TND</span>
            <span>Crédit: {totalAchatsCredit.toFixed(2)} TND</span>
          </div>
        </CardHeader>
        <CardContent>
          {achats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucun achat enregistré</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Article</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead className="text-center">Statut</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {achats.map((achat) => (
                  <TableRow key={achat.id}>
                    <TableCell>{new Date(achat.date).toLocaleDateString("fr-FR")}</TableCell>
                    <TableCell>{achat.article}</TableCell>
                    <TableCell>{achat.quantite}</TableCell>
                    <TableCell className="text-right">{achat.montant.toFixed(2)} TND</TableCell>
                    <TableCell className="text-center">
                      <button
                        onClick={() => toggleAchatStatus(achat.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded border hover:bg-muted transition-colors text-sm"
                        title="Cliquer pour changer le statut"
                      >
                        {achat.paye ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <CreditCard className="h-4 w-4" />
                            Payé
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-orange-600">
                            <DollarSign className="h-4 w-4" />
                            Crédit
                          </span>
                        )}
                      </button>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditAchat(achat.id)}
                          title="Modifier le statut de paiement"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteAchat(achat.id)}
                          title="Supprimer l'achat"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'achat</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cet achat ? Cette action va également mettre à jour le stock.
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteAchat}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le statut de paiement</DialogTitle>
            <DialogDescription>
              Modifiez le statut de paiement pour l'achat: {editingAchat?.article}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateAchat} className="space-y-4">
            <div className="space-y-2">
              <Label>Statut de paiement</Label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    name="paye" 
                    value="true" 
                    defaultChecked={editingAchat?.paye === true}
                    className="rounded" 
                  />
                  <span className="flex items-center gap-1">
                    <CreditCard className="h-4 w-4 text-green-600" />
                    Payé
                  </span>
                </label>
                <label className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    name="paye" 
                    value="false" 
                    defaultChecked={editingAchat?.paye === false}
                    className="rounded" 
                  />
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-orange-600" />
                    Crédit
                  </span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">
                Mettre à jour
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

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
