import { useState, useEffect } from "react";
import { PinDialog } from "./PinDialog";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Lock, Shield } from "lucide-react";

interface AppWrapperProps {
  children: React.ReactNode;
}

export function AppWrapper({ children }: AppWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(true); // Always start with PIN dialog open

  useEffect(() => {
    // Always show PIN dialog on first load for security
    // Clear any existing authentication
    sessionStorage.removeItem('cafe-auth');
    setIsAuthenticated(false);
    setIsPinDialogOpen(true);
  }, []);

  const handlePinSuccess = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem('cafe-auth', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('cafe-auth');
    setIsPinDialogOpen(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Café Management System</CardTitle>
            <p className="text-muted-foreground">
              Système de gestion sécurisé pour votre café
            </p>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Veuillez entrer le code PIN d'accès pour continuer
            </p>
            <button
              onClick={() => setIsPinDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2 mx-auto transition-colors"
            >
              <Lock className="h-4 w-4" />
              Entrer le code PIN
            </button>
            <PinDialog
              isOpen={isPinDialogOpen}
              onClose={() => setIsPinDialogOpen(false)}
              onSuccess={handlePinSuccess}
              title="Accès au système"
              description="Entrez le code PIN pour accéder au système de gestion"
              pinType="access"
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Logout button */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors"
        >
          <Lock className="h-4 w-4" />
          Déconnexion
        </button>
      </div>
      
      {children}
    </div>
  );
}
