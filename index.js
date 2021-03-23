const mysql = require("mysql");
const inquirer = require("inquirer");
const consTable = require("console.table");
const dotenv = require("dotenv");

const app = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "employee_db",
});

app.connect((err) => {
  if (err) throw err;
  start();
});

const mainQs = [
  {
    name: "main",
    message: "Please make a selection:",
    type: "list",
    choices: [
      "View Employees",
      "View Roles",
      "View Departments",
      "Edit Employees",
      "Edit Roles",
      "Edit Departments",
      "Exit",
    ],
  },
  {
    name: "viewE",
    message: "How would you like to view your employees?",
    type: "list",
    choices: ["All Employees", "Search by Manager"],
  },
  {
    name: "EditE",
    message: "How would you like to edit your employees?",
    type: "list",
    choices: ["Add", "Remove", "Update"],
  },
  {
    name: "EditR",
    message: "How would you like to edit your Roles?",
    type: "list",
    choices: ["Add", "Remove", "Update"],
  },
  {
    name: "EditD",
    message: "How would you like to edit your Department?",
    type: "list",
    choices: ["Add", "Remove", "Update"],
  },
];

const employeeQs = [
  {
    name: "manager",
    message: "Please select a manager: ",
  },
];

function viewEmployees() {
  inquirer.prompt(mainQs[1]).then((data) => {
    switch (data.viewE) {
      case "All Employees":
        app.query(
          `SELECT employees.id, concat(employees.first_name, " ", employees.last_name) AS name, roles.job, departments.name AS department, roles.salary FROM employees
          INNER JOIN roles ON employees.role_id = roles.id
          INNER JOIN departments ON roles.dep_id = departments.id
          ORDER BY id ASC;`,
          (err, res) => {
            if (err) throw err;
            console.log;
            console.table(res);
            start();
          }
        );
        break;
      case "Search by Manager":
        app.query(
          "SELECT id AS manager_id, CONCAT(first_name, ' ', last_name) AS name FROM employees WHERE ismanager IS TRUE;",
          async (err, res) => {
            var names = await res.map((manager) => manager.name);
            inquirer
              .prompt({
                name: "manager",
                message: "Which manager's employees would you like to view?",
                type: "list",
                choices: names,
              })
              .then((answers) => {
                let selectID;
                for (i = 0; i < res.length; i++) {
                  if (answers.manager === res[i].name) {
                    selectID = res[i].manager_id;
                  }
                }
                app.query(
                  `SELECT employees.id, concat(employees.first_name, " ", employees.last_name) AS name, roles.job, departments.name AS department, roles.salary FROM employees
                  INNER JOIN roles ON employees.role_id = roles.id
                  INNER JOIN departments ON roles.dep_id = departments.id
                  WHERE employees.manager_id = ${selectID}
                  ORDER BY id ASC;`,
                  (err, employees) => {
                    console.log(
                      `Employees under the manager: ${answers.manager}`
                    );
                    console.table(employees);
                    start();
                  }
                );
              });
          }
        );
        break;
    }
  });
}

function viewRoles() {
  app.query("SELECT * FROM roles", (err, res) => {
    if (err) throw err;
    console.table(res);
    start();
  });
}

function viewDepartments() {
  app.query("SELECT * FROM departments", (err, res) => {
    if (err) throw err;
    console.table(res);
    start();
  });
}

function start() {
  inquirer.prompt(mainQs[0]).then((data) => {
    switch (data.main) {
      case "View Employees":
        viewEmployees();
        break;
      case "View Roles":
        viewRoles();
        break;
      case "View Departments":
        viewDepartments();
        break;
    }
  });
}
