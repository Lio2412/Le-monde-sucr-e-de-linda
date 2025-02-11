import { useCallback } from 'react';
import type { Recipe } from '@/types/recipe';

export const usePrint = () => {
  const printRecipe = useCallback((recipe: Recipe) => {
    // Créer une nouvelle fenêtre pour l'impression
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Créer le contenu HTML pour l'impression
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${recipe.title} - Le Monde Sucré de Linda</title>
          <style>
            @media print {
              body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
              }
              h1 {
                font-size: 24px;
                color: #1a1a1a;
                text-align: center;
                margin-bottom: 20px;
              }
              h2 {
                font-size: 20px;
                color: #333;
                margin-top: 30px;
                margin-bottom: 15px;
                border-bottom: 2px solid #eee;
                padding-bottom: 5px;
              }
              .info {
                display: flex;
                justify-content: space-between;
                margin: 20px 0;
                padding: 10px;
                background-color: #f9f9f9;
                border-radius: 5px;
              }
              .ingredients {
                margin: 20px 0;
              }
              .ingredients ul {
                list-style-type: none;
                padding: 0;
              }
              .ingredients li {
                margin: 8px 0;
                padding-left: 20px;
                position: relative;
              }
              .ingredients li:before {
                content: "•";
                position: absolute;
                left: 0;
              }
              .steps {
                margin: 20px 0;
              }
              .steps ol {
                padding-left: 20px;
              }
              .steps li {
                margin: 12px 0;
              }
              .footer {
                margin-top: 40px;
                text-align: center;
                font-size: 12px;
                color: #666;
              }
            }
          </style>
        </head>
        <body>
          <h1>${recipe.title}</h1>
          <div class="info">
            <span>⏱️ Préparation: ${recipe.preparationTime}min</span>
            <span>⏱️ Cuisson: ${recipe.cookingTime}min</span>
            <span>👨‍🍳 Difficulté: ${recipe.difficulty}</span>
            <span>👥 Pour ${recipe.servings} personnes</span>
          </div>
          <p>${recipe.description}</p>
          
          <h2>Ingrédients</h2>
          <div class="ingredients">
            <ul>
              ${recipe.ingredients.map(ing => 
                `<li>${ing.quantity}${ing.unit} ${ing.name}</li>`
              ).join('')}
            </ul>
          </div>
          
          <h2>Préparation</h2>
          <div class="steps">
            <ol>
              ${recipe.steps.map(step => 
                `<li>${step.description}</li>`
              ).join('')}
            </ol>
          </div>
          
          <div class="footer">
            <p>Recette de Le Monde Sucré de Linda - ${new Date().toLocaleDateString()}</p>
          </div>
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 500);
            };
          </script>
        </body>
      </html>
    `;

    // Écrire le contenu dans la nouvelle fenêtre
    printWindow.document.write(printContent);
    printWindow.document.close();
  }, []);

  return { printRecipe };
}; 