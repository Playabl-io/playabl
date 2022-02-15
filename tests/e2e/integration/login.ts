describe("Login", () => {
  it("Can sign in", () => {
    cy.visit("/");
    cy.findByText("Sign in").click();
    cy.findByRole("textbox", { name: /Email/ }).type("jonjongrim@gmail.com");
    cy.findByLabelText("Password").type(Cypress.env("PLAYABL_PW"));
    cy.findByRole("button", { name: "Sign in" }).click();
    cy.url().should("eq", "http://localhost:3000/profile");
  });
});
