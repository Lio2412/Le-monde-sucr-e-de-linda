describe('Scénarios E2E Critique', () => {
  it('Complete un flux de cuisine complet', () => {
    cy.visit('/recipe/1')
    cy.get('[data-testid="cooking-mode-btn"]').click()
    
    cy.performCookingFlow({
      steps: 5,
      timerDurations: [120, 300],
      portionChanges: 2
    })
    
    cy.assertProgress(100)
    cy.assertLocalStorageState('recipeProgress')
  });
}); 