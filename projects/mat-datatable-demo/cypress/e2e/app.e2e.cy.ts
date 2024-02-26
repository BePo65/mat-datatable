describe('Test demo page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('contains the main components', () => {
    cy.get('.page-title')
      .should('have.text', 'Mat-Datatable-Demo');

    cy.get('#mat-mdc-slide-toggle-1-button')
      .should('be.visible')
      .should('have.class', 'mdc-switch--selected');

    cy.get('#mat-mdc-slide-toggle-1-button')
      .invoke('attr', 'aria-checked')
      .should('eq', 'true');

    cy.get('.content-table')
      .should('be.visible');

    cy.get('.content-table .mat-mdc-footer-cell').should($elements => {
      expect($elements).to.have.length(3);
      expect($elements.eq(0)).to.contain('filtered 103 / total 103');
    });

    cy.get('#test-buttons')
      .should('be.visible');

    cy.get('.toggle-buttons-pane-button')
      .should('be.visible');
  });

  it('should hide the buttons pane on click to hide-button', () => {
    cy.get('#test-buttons')
      .should('be.visible');

    cy.get('.toggle-buttons-pane-button')
      .click();

    cy.get('#test-buttons')
      .should('be.not.visible');
  });
});
