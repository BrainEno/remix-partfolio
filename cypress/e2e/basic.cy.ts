describe('empty spec', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it("should allow you to login", () => {
    const loginForm = {
      email: 'test@example.com',
      password: 'test1234!',
    };
    cy.findByRole("link", { name: /sign in/i }).click();
    cy.findByRole("textbox", { name: /email/i }).type(loginForm.email);
    cy.findByLabelText(/password/i).type(loginForm.password);
  })
}) 