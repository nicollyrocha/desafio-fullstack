describe("Tasks - edição e deleção", () => {
  const email = "teste@gmail.com";
  const password = "12345678";

  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.visit("http://localhost:3000/login");
    cy.get('input[name="email"]').clear().type(email);
    cy.get('input[name="password"]').clear().type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should("include", "/dashboard");
  });

  it("Deve editar uma tarefa existente", () => {
    const title = `Tarefa para editar ${Date.now()}`;
    const updatedTitle = `${title} - editada`;

    cy.get('input[name="title"]').type(title);
    cy.get('input[name="description"]').type("Descrição original");
    cy.get('select[name="status"]').select("pending");
    cy.contains("button", "Cadastrar").click();
    cy.contains("Tarefa criada com sucesso!", { timeout: 8000 }).should(
      "exist"
    );

    cy.get("table tbody tr")
      .first()
      .within(() => {
        cy.get("button.edit-button").click({ force: true });
      });

    cy.get('input[name^="edit-title-"]', { timeout: 8000 })
      .should("exist")
      .should("be.visible")
      .clear({ force: true })
      .type(updatedTitle, { force: true });

    cy.get('input[name^="edit-description-"]', { timeout: 8000 })
      .should("exist")
      .should("be.visible")
      .clear({ force: true })
      .type("Descrição editada", { force: true });

    cy.get('select[name^="edit-status-"]', { timeout: 8000 })
      .should("exist")
      .should("be.visible")
      .select("completed", { force: true });

    cy.get("button.confirm-button").click({ force: true });

    cy.contains("Tarefa atualizada com sucesso!", { timeout: 8000 }).should(
      "exist"
    );
    cy.contains("tr", updatedTitle).should("exist");
    cy.contains("tr", updatedTitle).should("contain.text", "Concluído");
  });

  it("Deve deletar uma tarefa", () => {
    const title = `Tarefa para deletar ${Date.now()}`;

    cy.get('input[name="title"]').type(title);
    cy.get('input[name="description"]').type("Descrição para deletar");
    cy.get('select[name="status"]').select("pending");
    cy.contains("button", "Cadastrar").click();
    cy.contains("Tarefa criada com sucesso!", { timeout: 8000 }).should(
      "exist"
    );

    cy.contains("tr", title, { timeout: 10000 }).within(() => {
      cy.get("button").last().click();
    });

    cy.contains("button", "Confirmar").click();
    cy.contains("Tarefa deletada com sucesso!", { timeout: 8000 }).should(
      "exist"
    );
    cy.contains("tr", title).should("not.exist");
  });
});
