describe("Login", () => {
  it("Can sign in", () => {
    cy.visit("/");
    cy.findByText("Sign in").click();
    cy.findByRole("textbox", { name: /Email/ }).type("jonjongrim@gmail.com");
    cy.findByRole("textbox", { name: /Password/ }).type(process.env.PLAYABL_PW);
    cy.url().should("eq", "http://localhost:3000/profile");
  });
});
