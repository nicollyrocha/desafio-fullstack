describe("Tasks API Tests", () => {
  const baseUrl = "http://localhost:3000/api/tasks";
  const authUrl = "http://localhost:3000/api/auth";
  let authToken: string;
  let userId: number;

  before(() => {
    cy.task("db:reset");
    // Registra e faz login para obter token
    const testEmail = `tasks-test-${Date.now()}@example.com`;
    const testPassword = "password123";

    cy.request({
      method: "POST",
      url: `${authUrl}/register`,
      body: {
        name: "Tasks Test User",
        email: testEmail,
        password: testPassword,
      },
    });

    cy.request({
      method: "POST",
      url: `${authUrl}/login`,
      body: {
        email: testEmail,
        password: testPassword,
      },
    }).then((response) => {
      authToken = response.body.token;
      userId = response.body.userId;
      Cypress.env("authToken", authToken);
      Cypress.env("userId", userId);
    });
  });

  describe("GET /api/tasks", () => {
    it("Deve retornar lista de tarefas do usuário autenticado", () => {
      cy.request({
        method: "GET",
        url: baseUrl,
        headers: {
          Authorization: `Bearer ${Cypress.env("authToken")}`,
        },
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an("array");
      });
    });

    it("Não deve retornar tarefas sem autenticação", () => {
      cy.request({
        method: "GET",
        url: baseUrl,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(401);
      });
    });

    it("Não deve retornar tarefas com token inválido", () => {
      cy.request({
        method: "GET",
        url: baseUrl,
        headers: {
          Authorization: "Bearer invalid-token",
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(401);
      });
    });
  });

  describe("POST /api/tasks", () => {
    it("Deve criar uma nova tarefa com autenticação", () => {
      const taskTitle = `Test Task ${Date.now()}`;
      cy.request({
        method: "POST",
        url: baseUrl,
        headers: {
          Authorization: `Bearer ${Cypress.env("authToken")}`,
        },
        body: {
          title: taskTitle,
          description: "Test description",
          status: "pending",
        },
      }).then((response) => {
        expect(response.status).to.equal(201);
        expect(response.body.title).to.equal(taskTitle);
        expect(response.body.status).to.equal("pending");
        expect(response.body.user_id).to.equal(Cypress.env("userId"));
      });
    });

    it("Não deve criar tarefa sem titulo", () => {
      cy.request({
        method: "POST",
        url: baseUrl,
        headers: {
          Authorization: `Bearer ${Cypress.env("authToken")}`,
        },
        body: {
          description: "Test description",
          status: "pending",
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400);
        expect(response.body.message).to.include("Título é obrigatório");
      });
    });

    it("Não deve criar tarefa sem autenticação", () => {
      cy.request({
        method: "POST",
        url: baseUrl,
        body: {
          title: "Test Task",
          description: "Test description",
          status: "pending",
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(401);
      });
    });

    it("Deve criar tarefa com titulo vazio após trim", () => {
      cy.request({
        method: "POST",
        url: baseUrl,
        headers: {
          Authorization: `Bearer ${Cypress.env("authToken")}`,
        },
        body: {
          title: "   ",
          description: "Test description",
          status: "pending",
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400);
      });
    });

    it("Deve criar tarefa com description opcional", () => {
      const taskTitle = `Test Task ${Date.now()}`;
      cy.request({
        method: "POST",
        url: baseUrl,
        headers: {
          Authorization: `Bearer ${Cypress.env("authToken")}`,
        },
        body: {
          title: taskTitle,
          status: "pending",
        },
      }).then((response) => {
        expect(response.status).to.equal(201);
        expect(response.body.title).to.equal(taskTitle);
      });
    });
  });

  describe("PUT /api/tasks/[id]", () => {
    let taskId: number;

    before(() => {
      // Cria uma tarefa para atualizar
      cy.request({
        method: "POST",
        url: baseUrl,
        headers: {
          Authorization: `Bearer ${Cypress.env("authToken")}`,
        },
        body: {
          title: "Task to Update",
          description: "Original description",
          status: "pending",
        },
      }).then((response) => {
        taskId = response.body.id;
      });
    });

    it("Deve atualizar uma tarefa existente", () => {
      const updatedTitle = `Updated Task ${Date.now()}`;
      cy.request({
        method: "PUT",
        url: `${baseUrl}/${taskId}`,
        headers: {
          Authorization: `Bearer ${Cypress.env("authToken")}`,
        },
        body: {
          title: updatedTitle,
          description: "Updated description",
          status: "completed",
        },
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.title).to.equal(updatedTitle);
        expect(response.body.status).to.equal("completed");
      });
    });

    it("Não deve atualizar tarefa sem autenticação", () => {
      cy.request({
        method: "PUT",
        url: `${baseUrl}/${taskId}`,
        body: {
          title: "Updated title",
          status: "completed",
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(401);
      });
    });

    it("Não deve atualizar tarefa com ID inválido", () => {
      cy.request({
        method: "PUT",
        url: `${baseUrl}/99999`,
        headers: {
          Authorization: `Bearer ${Cypress.env("authToken")}`,
        },
        body: {
          title: "Updated title",
          status: "completed",
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(404);
      });
    });
  });

  describe("DELETE /api/tasks/[id]", () => {
    let taskIdToDelete: number;

    before(() => {
      // Cria uma tarefa para deletar
      cy.request({
        method: "POST",
        url: baseUrl,
        headers: {
          Authorization: `Bearer ${Cypress.env("authToken")}`,
        },
        body: {
          title: "Task to Delete",
          description: "This will be deleted",
          status: "pending",
        },
      }).then((response) => {
        taskIdToDelete = response.body.id;
      });
    });

    it("Deve deletar uma tarefa existente", () => {
      cy.request({
        method: "DELETE",
        url: `${baseUrl}/${taskIdToDelete}`,
        headers: {
          Authorization: `Bearer ${Cypress.env("authToken")}`,
        },
      }).then((response) => {
        expect(response.status).to.equal(200);
      });
    });

    it("Não deve deletar tarefa sem autenticação", () => {
      // Cria outra tarefa
      cy.request({
        method: "POST",
        url: baseUrl,
        headers: {
          Authorization: `Bearer ${Cypress.env("authToken")}`,
        },
        body: {
          title: "Another Task",
          status: "pending",
        },
      }).then((createResponse) => {
        const newTaskId = createResponse.body.id;

        // Tenta deletar sem autenticação
        cy.request({
          method: "DELETE",
          url: `${baseUrl}/${newTaskId}`,
          failOnStatusCode: false,
        }).then((response) => {
          expect(response.status).to.equal(401);
        });
      });
    });

    it("Não deve deletar tarefa com ID inválido", () => {
      cy.request({
        method: "DELETE",
        url: `${baseUrl}/99999`,
        headers: {
          Authorization: `Bearer ${Cypress.env("authToken")}`,
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(404);
      });
    });

    it("Não deve acessar/deletar tarefa de outro usuário", () => {
      // user A cria tarefa
      const userAEmail = `owner-${Date.now()}@example.com`;
      const userAPassword = "password123";
      cy.request({
        method: "POST",
        url: `${authUrl}/register`,
        body: { name: "Owner", email: userAEmail, password: userAPassword },
      });
      cy.request({
        method: "POST",
        url: `${authUrl}/login`,
        body: { email: userAEmail, password: userAPassword },
      })
        .then((loginA) => {
          const tokenA = loginA.body.token;
          return cy
            .request({
              method: "POST",
              url: baseUrl,
              headers: { Authorization: `Bearer ${tokenA}` },
              body: { title: "Task A", status: "pending" },
            })
            .then((taskRes) => taskRes.body.id);
        })
        .then((taskId) => {
          // user B tenta deletar task de A
          const userBEmail = `intruder-${Date.now()}@example.com`;
          const userBPassword = "password123";
          cy.request({
            method: "POST",
            url: `${authUrl}/register`,
            body: {
              name: "Intruder",
              email: userBEmail,
              password: userBPassword,
            },
          });
          cy.request({
            method: "POST",
            url: `${authUrl}/login`,
            body: { email: userBEmail, password: userBPassword },
          }).then((loginB) => {
            const tokenB = loginB.body.token;
            cy.request({
              method: "DELETE",
              url: `${baseUrl}/${taskId}`,
              headers: { Authorization: `Bearer ${tokenB}` },
              failOnStatusCode: false,
            }).then((deleteRes) => {
              expect(deleteRes.status).to.equal(404);
            });
          });
        });
    });
  });
});
