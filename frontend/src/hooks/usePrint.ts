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
          <div class="recipe-meta">
            <div class="recipe-meta-item">
              <span>⏱️ Préparation: ${recipe.prepTime}min</span>
              <span>⏱️ Cuisson: ${recipe.cookTime}min</span>
              <span>👥 Portions: ${recipe.servings}</span>
              <span>📊 Difficulté: ${recipe.difficulty}</span>
            </div>
          </div>
          <p>${recipe.description}</p>
          
          <div class="ingredients">
            <h2>Ingrédients</h2>
            <ul>
              ${recipe.ingredients.map(ing => {
                // Vérifier si l'ingrédient est un objet ou une chaîne
                if (typeof ing === 'string') {
                  return `<li>${ing}</li>`;
                } else if (typeof ing === 'object' && ing !== null) {
                  // Supposer que l'ingrédient est un objet avec les propriétés name, quantity et unit
                  return `<li>${ing.quantity || ''}${ing.unit || ''} ${ing.name || ''}</li>`;
                }
                return `<li>${ing}</li>`;
              }).join('')}
            </ul>
          </div>
          
          <div class="instructions">
            <h2>Instructions</h2>
            <ol>
              ${recipe.instructions.map((instruction, index) => {
                if (typeof instruction === 'string') {
                  return `<li>${instruction}</li>`;
                } else if (typeof instruction === 'object' && instruction !== null && 'description' in instruction) {
                  return `<li>${instruction.description}</li>`;
                }
                return `<li>${instruction}</li>`;
              }).join('')}
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