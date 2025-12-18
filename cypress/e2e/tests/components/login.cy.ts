describe("Ir para pagina de registro", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000/login");
  });

  it("Deve ir para a pagina de registro", () => {
    cy.contains("Cadastrar").click();
    cy.url().should("include", "/register");
  });
});

describe("Pagina de cadastro", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000/register");
  });

  it("Deve fazer cadastro com sucesso", () => {
    cy.get('input[name="name"]').type("Nicolly RCS");
    cy.get('input[name="email"]').type("teste@gmail.com");
    cy.get('input[name="password"]').type("12345678");
    cy.get('button[type="submit"]').click();
    if (cy.contains("Usuário já existe")) {
      cy.contains("Já tem uma conta?").click();
    }
    cy.url().should("include", "/login");
  });
});

describe("Pagina de login", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000/login");
  });

  it("Deve fazer login com sucesso", () => {
    cy.get('input[name="email"]').type("teste@gmail.com");
    cy.get('input[name="password"]').type("12345678");
    cy.get('button[type="submit"]').click();
    cy.url().should("include", "/dashboard");
  });
});
