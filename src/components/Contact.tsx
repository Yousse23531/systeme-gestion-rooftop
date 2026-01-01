import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { 
  Phone, 
  Mail, 
  MessageCircle, 
  MapPin, 
  Clock,
  ExternalLink 
} from "lucide-react";

export function Contact() {
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("Bonjour, je souhaite obtenir plus d'informations sur vos services.");
    window.open(`https://wa.me/21648115274?text=${message}`, '_blank');
  };

  const handlePhoneClick = (number: string) => {
    window.open(`tel:${number}`, '_self');
  };

  const handleEmailClick = () => {
    window.open('mailto:contact@hekma.ovh', '_blank');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Contact</h1>
        <p className="text-muted-foreground">
          Contactez notre équipe pour toute question ou assistance
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Company Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary overflow-hidden">
                <img src="./logo.png" alt="Hekmaware Dev Solutions" className="h-full w-full object-cover" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Hekmaware Dev Solutions</h2>
                <p className="text-sm text-muted-foreground font-normal">
                  Solutions de développement et gestion
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Adresse</p>
                <p className="text-sm text-muted-foreground">
                  Tunisie
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Heures d'ouverture</p>
                <p className="text-sm text-muted-foreground">
                  Lundi - Vendredi: 9h00 - 18h00<br />
                  Samedi: 9h00 - 13h00
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Methods Card */}
        <Card>
          <CardHeader>
            <CardTitle>Moyens de contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* WhatsApp */}
            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">WhatsApp</p>
                  <p className="text-sm text-muted-foreground">+216 48 115 274</p>
                </div>
              </div>
              <Button 
                onClick={handleWhatsAppClick}
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Contacter
              </Button>
            </div>

            {/* Phone */}
            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500">
                  <Phone className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">Téléphone</p>
                  <p className="text-sm text-muted-foreground">+216 29 173 456</p>
                </div>
              </div>
              <Button 
                onClick={() => handlePhoneClick('+21629173456')}
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Appeler
              </Button>
            </div>

            {/* Email */}
            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">contact@hekma.ovh</p>
                </div>
              </div>
              <Button 
                onClick={handleEmailClick}
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Envoyer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services Card */}
      <Card>
        <CardHeader>
          <CardTitle>Nos services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Développement Web</h3>
              <p className="text-sm text-muted-foreground">
                Applications web modernes et responsives
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Systèmes de Gestion</h3>
              <p className="text-sm text-muted-foreground">
                Solutions personnalisées pour votre entreprise
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Support Technique</h3>
              <p className="text-sm text-muted-foreground">
                Maintenance et assistance continue
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Contact Form */}
      <Card>
        <CardHeader>
          <CardTitle>Message rapide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Pour un contact plus direct, utilisez les boutons ci-dessus ou envoyez-nous un email.
            </p>
            <div className="flex gap-2">
              <Button onClick={handleWhatsAppClick} className="flex-1">
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
              <Button onClick={handleEmailClick} variant="outline" className="flex-1">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
