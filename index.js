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
      "View Department's budget utilization",
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
    choices: ["All Employees", "Search by Department"],
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
        app.query("SELECT * FROM employees", (err, res) => {
          if (err) throw err;
          console.table(res);
          start();
        });
        break;
      case "Search by Department":
        app.query("SELECT id, name FROM departments", (err, res) => {
          if (err) throw err;
          const departments = res.map((department) => department.name);
          inquirer
            .prompt({
              name: "department",
              message: "Please select a department: ",
              type: "list",
              choices: departments,
            })
            .then( async (data) => {
              const departmentID = await app.query(`(SELECT id FROM departments WHERE departments.name = "${data.department}")`, (err, res) => {
              }).id;
              console.log(departmentID)
              const roleID = await app.query(`(SELECT id FROM roles WHERE roles.dep_id = ${departmentID})`)
              const employees = await app.query(`(SELECT * FROM EMPLOYEES WHERE role_id = ${roleID})`)
              console.table(employees)
            });
        });
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
