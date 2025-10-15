import React, { useState } from "react";
import { SidebarProvider } from "./components/ui/sidebar";
import { AppSidebar } from "./components/AppSidebar";
import { Dashboard } from "./components/Dashboard";
import { Personnel } from "./components/Personnel";
import { Achats } from "./components/Achats";
import { Stock } from "./components/Stock";
import { Depenses } from "./components/Depenses";
import { Recettes } from "./components/Recettes";
import { Articles } from "./components/Articles";
import { Historique } from "./components/Historique";
import { MoisPrecedents } from "./components/MoisPrecedents";
import { FAQ } from "./components/FAQ";
import { Contact } from "./components/Contact";
import { HistoriqueAchats } from "./components/HistoriqueAchats";
import { HistoriqueMaintenances } from "./components/HistoriqueMaintenances";
import { HistoriqueCDBenefice } from "./components/HistoriqueCDBenefice";
import { AppWrapper } from "./components/AppWrapper";
import { Toaster } from "./components/ui/sonner";

export type Section = 
  | "dashboard" 
  | "personnel" 
  | "achats" 
  | "stock" 
  | "depenses" 
  | "recettes" 
  | "articles"
  | "historique"
  | "historique-achats"
  | "historique-maintenances"
  | "historique-cd-benefice"
  | "mois-precedents"
  | "faq"
  | "contact";

export default function App() {
  const [currentSection, setCurrentSection] = useState("dashboard" as Section);

  const renderSection = () => {
    switch (currentSection) {
      case "dashboard":
        return <Dashboard />;
      case "personnel":
        return <Personnel />;
      case "achats":
        return <Achats />;
      case "stock":
        return <Stock />;
      case "depenses":
        return <Depenses />;
      case "recettes":
        return <Recettes />;
      case "articles":
        return <Articles />;
      case "historique":
        return <Historique />;
      case "historique-achats":
        return <HistoriqueAchats />;
      case "historique-maintenances":
        return <HistoriqueMaintenances />;
      case "historique-cd-benefice":
        return <HistoriqueCDBenefice />;
      case "mois-precedents":
        return <MoisPrecedents />;
      case "faq":
        return <FAQ />;
      case "contact":
        return <Contact />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppWrapper children={
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-muted/30">
          <AppSidebar 
            currentSection={currentSection} 
            onSectionChange={setCurrentSection} 
          />
          <main className="flex-1 overflow-y-auto">
            {currentSection !== "faq" && currentSection !== "contact" && (
              <div className="w-full bg-primary/10 text-primary border-b border-primary/20">
                <div className="container mx-auto max-w-7xl px-6 py-3 text-center font-semibold tracking-wide">
                  SUR MESURES POUR ROOFTOP
                </div>
              </div>
            )}
            <div className="container mx-auto p-6 max-w-7xl">
              {renderSection()}
            </div>
          </main>
        </div>
        <Toaster />
      </SidebarProvider>
    } />
  );
}
