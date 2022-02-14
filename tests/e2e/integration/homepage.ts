describe("Homepage", () => {
  it("Shows the app title", () => {
    cy.visit("/");
    cy.findByRole("heading", { name: /Playabl/ });
  });
});
