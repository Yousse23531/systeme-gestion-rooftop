import React from "react";

export function FAQ() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Foire Aux Questions</h1>
        <p className="text-gray-600">Retrouvez ici les questions fréquemment posées sur le système de gestion.</p>
      </div>
      
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Comment ajouter un nouvel employé ?</h2>
          <p className="text-gray-600">Allez dans l'onglet "Personnel", cliquez sur le bouton "Ajouter un employé" et remplissez les informations demandées.</p>
        </div>
        
        <div className="border-b pb-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Comment gérer les stocks ?</h2>
          <p className="text-gray-600">Accédez à l'onglet "Stock" pour ajouter, modifier ou suivre les niveaux de stock de vos articles.</p>
        </div>
        
        <div className="border-b pb-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Comment effectuer une remise mensuelle ?</h2>
          <p className="text-gray-600">À la fin de chaque mois, utilisez la fonction "Remise mensuelle" pour archiver les données et réinitialiser les compteurs.</p>
        </div>
        
        <div className="border-b pb-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Comment exporter les données ?</h2>
          <p className="text-gray-600">Dans chaque section, vous trouverez un bouton d'exportation pour sauvegarder vos données au format Excel.</p>
        </div>
        
        <div className="pb-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Comment contacter le support ?</h2>
          <p className="text-gray-600">Utilisez l'onglet "Contact" pour joindre l'équipe de support en cas de problème technique.</p>
        </div>
      </div>
    </div>
  );
}
