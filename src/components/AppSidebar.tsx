import { LayoutDashboard, Users, ShoppingCart, Package, TrendingDown, TrendingUp, FileText, History, Calendar, MessageCircle, Phone, Archive } from "lucide-react";
import { Section } from "../App";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "./ui/sidebar";

interface AppSidebarProps {
  currentSection: Section;
  onSectionChange: (section: Section) => void;
}

const menuItems = [
  { id: "dashboard" as Section, label: "Tableau de Bord", icon: LayoutDashboard },
  { id: "personnel" as Section, label: "Personnel", icon: Users },
  { id: "achats" as Section, label: "Achats", icon: ShoppingCart },
  { id: "stock" as Section, label: "Stock", icon: Package },
  { id: "depenses" as Section, label: "Dépenses", icon: TrendingDown },
  { id: "recettes" as Section, label: "Recettes", icon: TrendingUp },
  { id: "articles" as Section, label: "Articles", icon: FileText },
  { id: "historique" as Section, label: "Historique", icon: History },
  { id: "historique-achats" as Section, label: "Historique Achats", icon: Archive },
  { id: "historique-maintenances" as Section, label: "Historique Maintenances", icon: Archive },
  { id: "historique-cd-benefice" as Section, label: "Historique CD et Bénéfice", icon: Archive },
  { id: "mois-precedents" as Section, label: "Les Mois Précédents", icon: Calendar },
  { id: "faq" as Section, label: "FAQ - Assistant IA", icon: MessageCircle },
  { id: "contact" as Section, label: "Contact", icon: Phone },
];

export function AppSidebar({ currentSection, onSectionChange }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-6 py-4">
        <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary overflow-hidden">
                <img src="./logo.png" alt="7ekmaware Solutions" className="h-full w-full object-cover" />
          </div>
          <div>
            <h2 className="text-sidebar-foreground">7ekmaware solutions</h2>
            <p className="text-xs text-muted-foreground">Système de gestion</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onSectionChange(item.id)}
                    isActive={currentSection === item.id}
                    tooltip={item.label}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
