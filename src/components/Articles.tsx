import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Plus, FileText, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Article, ConsommationStock } from "../types";
import { getArticles, saveArticles, getStock } from "../lib/storage";
import { toast } from "sonner";
import { Badge } from "./ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { PinDialog } from "./PinDialog";

export function Articles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [consommations, setConsommations] = useState<ConsommationStock[]>([]);
  const stock = getStock();
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = () => {
    setArticles(getArticles());
  };

  const handleAddConsommation = () => {
    setConsommations([...consommations, { stockItemId: "", stockItemNom: "", quantite: 0 }]);
  };

  const handleRemoveConsommation = (index: number) => {
    setConsommations(consommations.filter((_, i) => i !== index));
  };

  const handleConsommationChange = (index: number, field: keyof ConsommationStock, value: string | number) => {
    const newConsommations = [...consommations];
    
    if (field === "stockItemId") {
      const selectedStock = stock.find(s => s.id === value);
      if (selectedStock) {
        newConsommations[index] = {
          ...newConsommations[index],
          stockItemId: value as string,
          stockItemNom: selectedStock.nom,
        };
      }
    } else {
      newConsommations[index] = { ...newConsommations[index], [field]: value };
    }
    
    setConsommations(newConsommations);
  };

  const handleAddArticle = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const validConsommations = consommations.filter(c => c.stockItemId && c.quantite > 0);

    const newArticle: Article = {
      id: Date.now().toString(),
      nom: formData.get("nom") as string,
      consommationStock: validConsommations,
    };

    const allArticles = getArticles();
    allArticles.push(newArticle);
    saveArticles(allArticles);

    loadArticles();
    setIsDialogOpen(false);
    setConsommations([]);
    toast.success("Article ajouté avec succès");
  };

  const handleDeleteArticle = (articleId: string) => {
    setPendingAction(() => () => {
      const allArticles = getArticles();
      const updatedArticles = allArticles.filter(a => a.id !== articleId);
      saveArticles(updatedArticles);
      loadArticles();
      toast.success("Article supprimé");
    });
    setIsPinDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Articles</h1>
          <p className="text-muted-foreground">Gérez vos articles et leur consommation de stock</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvel article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer un nouvel article</DialogTitle>
              <DialogDescription>
                Définissez les ingrédients nécessaires pour cet article
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddArticle} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom de l'article</Label>
                <Input id="nom" name="nom" required placeholder="Ex: Café Latte, Croissant..." />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Consommation du stock</Label>
                  <Button 
                    type="button" 
                    size="sm" 
                    onClick={handleAddConsommation}
                    disabled={stock.length === 0}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Ajouter
                  </Button>
                </div>

                {stock.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Aucun article en stock. Ajoutez des achats d'abord.
                  </p>
                )}

                {consommations.map((consommation, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-8 space-y-2">
                      <Label className="text-xs">Article du stock</Label>
                      <Select
                        value={consommation.stockItemId}
                        onValueChange={(value) => handleConsommationChange(index, "stockItemId", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un article" />
                        </SelectTrigger>
                        <SelectContent>
                          {stock.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.nom} ({item.quantite.toFixed(2)} {item.unite})
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
                        value={consommation.quantite || ""}
                        onChange={(e) => handleConsommationChange(index, "quantite", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemoveConsommation(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">Créer</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {articles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucun article créé</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Card key={article.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{article.nom}</CardTitle>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer l'article</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer cet article ? Cette action est irréversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteArticle(article.id)}>
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Consommation stock:</p>
                  {article.consommationStock.length === 0 ? (
                    <Badge variant="secondary">Aucune consommation</Badge>
                  ) : (
                    <div className="space-y-1">
                      {article.consommationStock.map((cons, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <span>{cons.stockItemNom}</span>
                          <Badge variant="outline">{cons.quantite}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PinDialog
        isOpen={isPinDialogOpen}
        onClose={() => setIsPinDialogOpen(false)}
        onSuccess={() => {
          if (pendingAction) pendingAction();
          setPendingAction(null);
        }}
        title="Confirmation de suppression"
        description="Entrez le code PIN pour confirmer cette action"
        pinType="delete"
      />
    </div>
  );
}
