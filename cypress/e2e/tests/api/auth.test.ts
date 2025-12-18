describe("Auth API Tests", () => {
  const baseUrl = "http://localhost:3000/api/auth";
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = "password123";

  before(() => {
    cy.task("db:reset");
  });

  describe("POST /api/auth/register", () => {
    it("Deve registrar um novo usuário com sucesso", () => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/register`,
        body: {
          name: "Test User",
          email: testEmail,
          password: testPassword,
        },
      }).then((response) => {
        expect(response.status).to.equal(201);
        expect(response.body.message).to.include("Usuário criado com sucesso");
      });
    });

    it("Não deve registrar usuário sem email", () => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/register`,
        body: {
          name: "Test User",
          password: testPassword,
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 500]);
      });
    });

    it("Não deve registrar usuário sem senha", () => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/register`,
        body: {
          name: "Test User",
          email: `test-${Date.now()}@example.com`,
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 500]);
      });
    });

    it("Não deve registrar usuário com email duplicado", () => {
      const duplicateEmail = `duplicate-${Date.now()}@example.com`;

      // Primeiro registro
      cy.request({
        method: "POST",
        url: `${baseUrl}/register`,
        body: {
          name: "First User",
          email: duplicateEmail,
          password: testPassword,
        },
      });

      // Tentativa de registro duplicado
      cy.request({
        method: "POST",
        url: `${baseUrl}/register`,
        body: {
          name: "Second User",
          email: duplicateEmail,
          password: testPassword,
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(409);
        expect(response.body.message).to.include("já existe");
      });
    });
  });

  describe("POST /api/auth/login", () => {
    const loginEmail = `login-test-${Date.now()}@example.com`;

    before(() => {
      // Registra um usuário para fazer login
      cy.request({
        method: "POST",
        url: `${baseUrl}/register`,
        body: {
          name: "Login Test User",
          email: loginEmail,
          password: testPassword,
        },
      });
    });

    it("Deve fazer login com credenciais válidas", () => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/login`,
        body: {
          email: loginEmail,
          password: testPassword,
        },
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.message).to.include("Login realizado com sucesso");
        expect(response.body.token).to.exist;
        expect(response.body.userId).to.exist;
      });
    });

    it("Não deve fazer login com senha incorreta", () => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/login`,
        body: {
          email: loginEmail,
          password: "wrongpassword",
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(401);
        expect(response.body.message).to.include("Senha incorreta");
      });
    });

    it("Não deve fazer login com email não registrado", () => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/login`,
        body: {
          email: "nonexistent@example.com",
          password: testPassword,
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(404);
        expect(response.body.message).to.include("Usuário não encontrado");
      });
    });

    it("Deve retornar token e cookies no login bem-sucedido", () => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/login`,
        body: {
          email: loginEmail,
          password: testPassword,
        },
      }).then((response) => {
        expect(response.headers["set-cookie"]).to.exist;
        expect(response.body.token).to.match(/^eyJ/); // JWT pattern
      });
    });

    it("Não deve fazer login sem email", () => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/login`,
        body: {
          password: testPassword,
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 500]);
      });
    });

    it("Não deve fazer login sem senha", () => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/login`,
        body: {
          email: loginEmail,
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 500]);
      });
    });
  });
});
