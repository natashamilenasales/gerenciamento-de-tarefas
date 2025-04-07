document.addEventListener("DOMContentLoaded", function () {
    // Configuração do AWS SDK
    AWS.config.region = 'us-east-1';  // Região da sua conta AWS
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'us-east-1:4fca3e8b-f3a8-4e8a-8c96-1ec150600583' // Seu IdentityPoolId
    });

    const docClient = new AWS.DynamoDB.DocumentClient();
    const tableName = "ToDoList"; // Nome da sua tabela DynamoDB

    // Função para mostrar todos os projetos
    function showProjects() {
        const projectTableBody = document.getElementById("projectTableBody");
        projectTableBody.innerHTML = ""; // Limpar antes de exibir

        const params = { TableName: tableName };

        docClient.scan(params, function (err, data) {
            if (err) {
                console.error("Erro ao recuperar projetos", err);
            } else {
                data.Items.forEach(proj => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${proj.projectName}</td>
                        <td>${proj.projectDescription}</td>
                        <td>${proj.projectResponsible}</td>
                        <td>${proj.projectDueDate}</td>
                        <td><button class="deleteBtn" data-taskid="${proj.taskId}">Excluir</button></td> <!-- Botão de Excluir -->
                    `;
                    projectTableBody.appendChild(row);
                });

                // Adicionar eventos de clique nos botões de excluir
                const deleteButtons = document.querySelectorAll(".deleteBtn");
                deleteButtons.forEach(button => {
                    button.addEventListener("click", function () {
                        const taskId = button.getAttribute("data-taskid");
                        deleteProject(taskId);
                    });
                });
            }
        });
    }

    // Função para criar um novo projeto
    function createProject(project) {
        const params = {
            TableName: tableName,
            Item: {
                taskId: uuid.v4(),
                projectName: project.projectName,
                projectDescription: project.projectDescription,
                projectResponsible: project.projectResponsible,
                projectDueDate: project.projectDueDate
            }
        };

        docClient.put(params, function (err, data) {
            if (err) {
                console.error("Erro ao criar projeto", err);
            } else {
                console.log("Projeto criado com sucesso", data);
                showProjects();  // Atualiza a lista de projetos
            }
        });
    }

    // Função para excluir um projeto
    function deleteProject(taskId) {
        const params = {
            TableName: tableName,
            Key: {
                taskId: taskId  // Chave primária que é o taskId
            }
        };

        docClient.delete(params, function (err, data) {
            if (err) {
                console.error("Erro ao excluir projeto", err);
            } else {
                console.log("Projeto excluído com sucesso", data);
                showProjects();  // Atualiza a lista após exclusão
            }
        });
    }

    // Event listener para criar projeto
    document.getElementById("createProjectForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const project = {
            projectName: document.getElementById("projectName").value,
            projectDescription: document.getElementById("projectDescription").value,
            projectResponsible: document.getElementById("projectResponsible").value,
            projectDueDate: document.getElementById("projectDueDate").value
        };

        createProject(project);
    });

    // Event listener para exibir os projetos
    document.getElementById("viewProjectsButton").addEventListener("click", showProjects);
});
