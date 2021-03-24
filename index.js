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
    choices: ["Add", "Remove"],
  },
  {
    name: "EditD",
    message: "How would you like to edit your Department?",
    type: "list",
    choices: ["Add", "Remove"],
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
            console.log();
            console.log(
              "---------------------------------------------------------------------------------------"
            );
            console.log("ALL EMPLOYEES");
            console.log(
              "---------------------------------------------------------------------------------------"
            );
            console.table(res);
            console.log();
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
                console.log();
                app.query(
                  `SELECT employees.id, concat(employees.first_name, " ", employees.last_name) AS name, roles.job, departments.name AS department, roles.salary FROM employees
                  INNER JOIN roles ON employees.role_id = roles.id
                  INNER JOIN departments ON roles.dep_id = departments.id
                  WHERE employees.manager_id = ${selectID}
                  ORDER BY id ASC;`,
                  (err, employees) => {
                    console.log(
                      "---------------------------------------------------------------------------------------"
                    );
                    console.log(
                      `EMPLOYEES UNDER THE MANAGER: ${answers.manager}`
                    );
                    console.log(
                      "---------------------------------------------------------------------------------------"
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
  app.query(
    `SELECT roles.id, roles.job, roles.salary, departments.name AS department
    FROM roles
    INNER JOIN departments ON roles.dep_id = departments.id
    ORDER by department ASC`,
    (err, res) => {
      if (err) throw err;
      console.log(
        "---------------------------------------------------------------------------------------"
      );
      console.log(`ALL ROLES`);
      console.log(
        "---------------------------------------------------------------------------------------"
      );
      console.table(res);
      start();
    }
  );
}

function viewDepartments() {
  app.query("SELECT * FROM departments;", async (err, res) => {
    var names = await res.map((departments) => departments.name);
    console.log();
    app.query(
      `SELECT departments.id, departments.name, IFNULL(SUM(roles.salary),0) AS budget
            FROM departments
            LEFT JOIN roles ON departments.id = roles.dep_id
            GROUP BY id
            ORDER BY id ASC;`,
      (err, dep) => {
        if (err) throw err;
        console.log(
          "---------------------------------------------------------------------------------------"
        );
        console.log(`DEPARTMENTS`);
        console.log(
          "---------------------------------------------------------------------------------------"
        );
        console.table(dep);
        start();
      }
    );
  });
}

function editEmployees() {
  inquirer.prompt(mainQs[2]).then((data) => {
    switch (data.EditE) {
      case "Update":
        app.query(
          `SELECT employees.id, concat(employees.first_name, " ", employees.last_name) AS name, roles.job, departments.name AS department, roles.salary FROM employees
          INNER JOIN roles ON employees.role_id = roles.id
          INNER JOIN departments ON roles.dep_id = departments.id
          ORDER BY id ASC;`,
          async (err, res) => {
            if (err) throw err;
            var names = await res.map((employee) => employee.name);
            inquirer
              .prompt({
                name: "employee",
                message: "Which employee would you like to change?",
                type: "list",
                choices: names,
              })
              .then((answers) => {
                let selectID;
                for (i = 0; i < res.length; i++) {
                  if (answers.employee === res[i].name) {
                    selectID = res[i].id;
                  }
                }
                console.log(`Select a new role for ${answers.employee}`);
                app.query(`SELECT * FROM roles;`, async (err, roles) => {
                  var roleList = await roles.map((role) => role.job);
                  // console.log(roles)
                  inquirer
                    .prompt({
                      name: "roleChoice",
                      message:
                        "What role would you like to give your employee?",
                      type: "list",
                      choices: roleList,
                    })
                    .then((jobs) => {
                      let roleID;
                      for (i = 0; i < roles.length; i++) {
                        if (jobs.roleChoice === roles[i].job) {
                          roleID = roles[i].id;
                        }
                      }
                      app.query(
                        `UPDATE employees
                      SET role_id = ${roleID}
                      WHERE id = ${selectID};`,
                        (err) => {
                          if (err) throw err;
                          console.log(
                            `${answers.employee} has been moved to the role : ${jobs.roleChoice}`
                          );
                          start();
                        }
                      );
                    });
                });
              });
          }
        );
        break;
      case "Add":
        app.query(
          `SELECT id, job, dep_id
            FROM roles`,
          async (err, res) => {
            var roleList = await res.map((role) => role.job);
            inquirer
              .prompt([
                {
                  name: "first",
                  message: "Employee's first name: ",
                  type: "input",
                },
                {
                  name: "last",
                  message: "Employee's last name: ",
                  type: "input",
                },
                {
                  name: "role",
                  message: "Employee's first name: ",
                  type: "list",
                  choices: roleList,
                },
                {
                  name: "managerBool",
                  message: "Is this employee a manager? ",
                  type: "confirm",
                },
              ])
              .then((employee) => {
                let roleID;
                for (i = 0; i < res.length; i++) {
                  if (employee.role === res[i].job) {
                    roleID = res[i].id;
                  }
                }
                let isManager;
                if (employee.managerBool) {
                  isManager = 1;
                } else {
                  isManager = 0;
                }
                app.query(
                  `INSERT INTO employees (first_name, last_name, role_id, ismanager)
                  VALUES ('${employee.first}','${employee.last}',${roleID},${isManager});`,
                  (result) => {
                    console.log(`Employee added!`);
                    start();
                  }
                );
              });
          }
        );
        break;
      case "Remove":
        app.query(
          `SELECT id, concat(employees.first_name, " ", employees.last_name) AS name FROM employees;`,
          async (err, res) => {
            var employeeList = await res.map((role) => role.name);
            inquirer
              .prompt({
                name: "employee",
                message: "Pick an employee to delete:",
                type: "list",
                choices: employeeList,
              })
              .then((remove) => {
                let removeID;
                for (i = 0; i < res.length; i++) {
                  if (remove.employee === res[i].name) {
                    removeID = res[i].id;
                  }
                }
                app.query(
                  `DELETE FROM employees WHERE id = ${removeID}`,
                  (err) => {
                    if (err) throw err;
                    console.log(`${remove.employee} has been removed!`);
                    start();
                  }
                );
              });
          }
        );
    }
  });
}

function editRoles() {
  inquirer.prompt(mainQs[3]).then((data) => {
    switch (data.EditR) {
      case "Add":
        app.query(`SELECT * FROM departments;`, async (err, res) => {
          if (err) throw err;
          var depList = await res.map((dep) => dep.name);
          inquirer
            .prompt([
              {
                name: "job",
                message: "Name of new job: ",
                type: "input",
              },
              {
                name: "salary",
                message: "Input salary of new job: ",
                type: "input",
              },
              {
                name: "dep",
                message: "Select department: ",
                type: "list",
                choices: depList,
              },
            ])
            .then((role) => {
              let depID;
              for (i = 0; i < res.length; i++) {
                if (role.dep === res[i].name) {
                  depID = res[i].id;
                }
              }
              app.query(
                `INSERT INTO roles (job, salary, dep_id)
                VALUES ('${role.job}','${role.salary}',${depID});`,
                (err) => {
                  if (err) throw err;
                  console.log(`${role.job} has been added to ${role.dep}`);
                  start();
                }
              );
            });
        });
        break;
      case "Remove":
        app.query(`SELECT * FROM roles;`, async (err, res) => {
          var roleList = await res.map((role) => role.job);
          inquirer
            .prompt({
              name: "role",
              message: "Select a role to delete: ",
              type: "list",
              choices: roleList,
            })
            .then((remove) => {
              let roleID;
              for (i = 0; i < res.length; i++) {
                if (remove.role === res[i].job) {
                  roleID = res[i].id;
                }
              }
              app.query(
                `DELETE FROM roles
                  WHERE id = ${roleID}`,
                (err) => {
                  if (err) throw err;
                  console.log(`${remove.role} removed!`);
                  start();
                }
              );
            });
        });
        break;
    }
  });
}

function editDepartments() {
  inquirer
    .prompt({
      name: "Edit",
      message: "How would you like to edit your Department?",
      type: "list",
      choices: ["Add", "Remove"],
    })
    .then((data) => {
      switch (data.Edit) {
        case "Add":
          console.log(data.Edit);
          inquirer
            .prompt([
              {
                name: "dep",
                message: "Enter new departments name: ",
                type: "input",
              },
            ])
            .then((dep) => {
              console.log(dep);
              app.query(
                `INSERT INTO departments (name)
                  VALUES ('${dep.dep}');`,
                (err) => {
                  if (err) throw err;
                  console.log(`${dep.dep} has been added!`);
                  start();
                }
              );
            });
          break;
        case "Remove":
          app.query(`SELECT * FROM departments;`, async (err, res) => {
            var depList = await res.map((dep) => dep.name);
            console.log(depList);
            inquirer
              .prompt({
                name: "dep",
                message: "Select a department to delete: ",
                type: "list",
                choices: depList,
              })
              .then((remove) => {
                let depID;
                for (i = 0; i < res.length; i++) {
                  if (remove.dep === res[i].name) {
                    depID = res[i].id;
                  }
                }
                app.query(
                  `DELETE FROM departments
                  WHERE id = ${depID};`,
                  (err) => {
                    if (err) throw err;
                    console.log(`${remove.dep} removed!`);
                    start();
                  }
                );
              });
          });
      }
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
      case "Edit Employees":
        editEmployees();
        break;
      case "Edit Roles":
        editRoles();
        break;
      case "Edit Departments":
        editDepartments();
        break;
    }
  });
}
