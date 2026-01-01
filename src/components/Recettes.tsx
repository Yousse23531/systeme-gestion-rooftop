import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Plus, Receipt, Trash2, AlertCircle, RotateCcw, RefreshCw } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Recette, RecetteItem, Article } from "../types";
import { getRecettes, saveRecettes, getArticles, getStock, saveStock, resetRecettes } from "../lib/storage";
import { toast } from "sonner";
import { Badge } from "./ui/badge";
import { exportDataToPDF } from "../lib/pdfExport";
import { Download } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { PinDialog } from "./PinDialog";

export function Recettes() {
  const [recettes, setRecettes] = useState<Recette[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRecetteId, setSelectedRecetteId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [recetteItems, setRecetteItems] = useState<RecetteItem[]>([
    { article: "", quantite: 0, prixUnitaire: 0 }
  ]);

  useEffect(() => {
    loadRecettes();
    loadArticles();
  }, []);

  const loadRecettes = () => {
    setRecettes(getRecettes());
  };

  const loadArticles = () => {
    setArticles(getArticles());
  };

  const handleAddItem = () => {
    setRecetteItems([...recetteItems, { article: "", quantite: 0, prixUnitaire: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setRecetteItems(recetteItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof RecetteItem, value: string | number) => {
    const newItems = [...recetteItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setRecetteItems(newItems);
  };

  const getArticleConsommation = (articleNom: string, quantite: number) => {
    const article = articles.find(a => a.nom === articleNom);
    if (!article || quantite === 0) return [];

    const stock = getStock();
    return article.consommationStock.map(cons => {
      const stockItem = stock.find(s => s.id === cons.stockItemId);
      const totalConsommation = cons.quantite * quantite;
      return {
        nom: cons.stockItemNom,
        quantiteNecessaire: totalConsommation,
        quantiteDisponible: stockItem?.quantite || 0,
        unite: stockItem?.unite || "",
        suffisant: (stockItem?.quantite || 0) >= totalConsommation
      };
    });
  };

  const calculateTotal = () => {
    return recetteItems.reduce((sum, item) => sum + (item.quantite * item.prixUnitaire), 0);
  };

  const updateStock = (items: RecetteItem[]) => {
    const articlesData = getArticles();
    const stock = getStock();

    items.forEach(recetteItem => {
      const article = articlesData.find(a => a.nom === recetteItem.article);
      
      if (article && article.consommationStock.length > 0) {
        article.consommationStock.forEach(cons => {
          const stockItem = stock.find(s => s.id === cons.stockItemId);
          if (stockItem) {
            const consommation = cons.quantite * recetteItem.quantite;
            stockItem.quantite = Math.max(0, stockItem.quantite - consommation);
          }
        });
      }
    });

    saveStock(stock);
  };

  const handleSaveRecette = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Validate items
    const validItems = recetteItems.filter(item => 
      item.article && item.quantite > 0 && item.prixUnitaire > 0
    );

    if (validItems.length === 0) {
      toast.error("Veuillez ajouter au moins un article valide");
      return;
    }

    const newRecette: Recette = {
      id: Date.now().toString(),
      date: formData.get("date") as string,
      items: validItems,
      total: calculateTotal(),
    };

    const allRecettes = getRecettes();
    allRecettes.push(newRecette);
    saveRecettes(allRecettes);

    // Update stock based on article consumption
    updateStock(validItems);

    loadRecettes();
    setIsDialogOpen(false);
    setRecetteItems([{ article: "", quantite: 0, prixUnitaire: 0 }]);
    toast.success("Recette enregistrée et stock mis à jour");
  };

  const totalRecettes = recettes.reduce((sum, r) => sum + r.total, 0);

  const handleExportPDF = async () => {
    const success = await exportDataToPDF(
      {
        type: 'recettes',
        recettes: recettes
      },
      'Recettes',
      `recettes_${new Date().toISOString().split('T')[0]}`
    );
    
    if (success) {
      toast.success("PDF exporté avec succès");
    } else {
      toast.error("Erreur lors de l'export PDF");
    }
  };

  const handleResetRecettes = () => {
    setPendingAction(() => () => {
      resetRecettes();
      loadRecettes();
      toast.success("Recettes archivées dans l'historique et réinitialisées");
    });
    setIsPinDialogOpen(true);
  };

  const handleDeleteRecette = (recetteId: string) => {
    setSelectedRecetteId(recetteId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteRecette = () => {
    if (!selectedRecetteId) return;
    
    setPendingAction(() => () => {
      const allRecettes = getRecettes();
      const updatedRecettes = allRecettes.filter(r => r.id !== selectedRecetteId);
      saveRecettes(updatedRecettes);
      loadRecettes();
      toast.success("Recette supprimée");
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
      <div className="flex items-center justify-between">
        <div>
          <h1>Recettes (Z)</h1>
          <p className="text-muted-foreground">Enregistrez vos ventes quotidiennes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadRecettes}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" disabled={recettes.length === 0}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Réinitialiser
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Réinitialiser les recettes</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action va archiver toutes les recettes actuelles dans l'historique et les supprimer de la liste actuelle. 
                  Cette action est irréversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetRecettes}>
                  Confirmer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button onClick={handleExportPDF} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exporter PDF
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle recette
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Enregistrer une recette (Z)</DialogTitle>
                <DialogDescription>
                  Enregistrez les ventes du jour et mettez à jour le stock automatiquement
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSaveRecette} className="space-y-4">
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

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Articles vendus</Label>
                  <Button 
                    type="button" 
                    size="sm" 
                    onClick={handleAddItem}
                    disabled={articles.length === 0}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Ajouter
                  </Button>
                </div>

                {articles.length === 0 && (
                  <div className="bg-muted p-4 rounded-lg flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <p className="text-sm text-muted-foreground">
                      Aucun article disponible. Créez des articles dans la section "Articles" d'abord.
                    </p>
                  </div>
                )}

                {recetteItems.map((item, index) => {
                  const consommationPrevisionnelle = getArticleConsommation(item.article, item.quantite);
                  const aStockInsuffisant = consommationPrevisionnelle.some(c => !c.suffisant);
                  
                  return (
                    <div key={index} className="space-y-2 p-3 border rounded-lg">
                      <div className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-5 space-y-2">
                          <Label className="text-xs">Article</Label>
                          <Select
                            value={item.article}
                            onValueChange={(value) => handleItemChange(index, "article", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un article" />
                            </SelectTrigger>
                            <SelectContent>
                              {articles.map((article) => (
                                <SelectItem key={article.id} value={article.nom}>
                                  {article.nom}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-3 space-y-2">
                          <Label className="text-xs">Quantité</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.quantite || ""}
                            onChange={(e) => handleItemChange(index, "quantite", parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="col-span-3 space-y-2">
                          <Label className="text-xs">Prix unit.</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.prixUnitaire || ""}
                            onChange={(e) => handleItemChange(index, "prixUnitaire", parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="col-span-1">
                          {recetteItems.length > 1 && (
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => handleRemoveItem(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {item.article && item.quantite > 0 && consommationPrevisionnelle.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-muted-foreground mb-2">Consommation du stock:</p>
                          <div className="space-y-1">
                            {consommationPrevisionnelle.map((cons, idx) => (
                              <div key={idx} className="flex justify-between items-center text-xs">
                                <span>{cons.nom}</span>
                                <div className="flex items-center gap-2">
                                  <span className={!cons.suffisant ? "text-destructive" : ""}>
                                    {cons.quantiteNecessaire.toFixed(2)} {cons.unite}
                                  </span>
                                  <Badge variant={cons.suffisant ? "secondary" : "destructive"} className="text-xs">
                                    Stock: {cons.quantiteDisponible.toFixed(2)} {cons.unite}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                          {aStockInsuffisant && (
                            <div className="mt-2 flex items-start gap-2 bg-destructive/10 p-2 rounded">
                              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-destructive">
                                Stock insuffisant pour cet article
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span>Total:</span>
                  <span className="text-2xl">{calculateTotal().toFixed(2)} TND</span>
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
          <CardTitle>Total des recettes: {totalRecettes.toFixed(2)} TND</CardTitle>
        </CardHeader>
        <CardContent>
          {recettes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Receipt className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucune recette enregistrée</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recettes.map((recette) => (
                <Card key={recette.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">
                        {new Date(recette.date).toLocaleDateString("fr-FR")}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{recette.total.toFixed(2)} TND</span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteRecette(recette.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Article</TableHead>
                          <TableHead>Quantité</TableHead>
                          <TableHead>Prix unitaire</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recette.items.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{item.article}</TableCell>
                            <TableCell>{item.quantite}</TableCell>
                            <TableCell>{item.prixUnitaire.toFixed(2)} TND</TableCell>
                            <TableCell className="text-right">
                              {(item.quantite * item.prixUnitaire).toFixed(2)} TND
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la recette</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette recette ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteRecette}>
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
