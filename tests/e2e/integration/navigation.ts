// skipped during beta
describe("Navbar", () => {
  it("Has a link to community", () => {
    cy.visit("/");
    cy.findByRole("link", { name: /Communities/ }).click();
    cy.findByRole("heading", { name: /Grimlin Games/i });
  });

  it("Has a link to games", () => {
    cy.visit("/");
    cy.findByRole("link", { name: /Games/ }).click();
    cy.url().should("eq", "http://localhost:3000/games/browse");
  });
});
