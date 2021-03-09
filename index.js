const mysql = require("mysql");
const inquirer = require("inquirer");
const consTable = require("console.table");
const dotenv = require("dotenv");
const { mainModule } = require("node:process");

const PORT = process.env.PORT | 3001;

const database = mysql.createConnection({
  host: "localhost",
  port: PORT,
  user: "root",
  password: "root",
  database: "employee_db",
});

database.connect((err) => {
  if (err) throw err;
  main();
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
    choices: ["All Employees", "Search by Manager", "Search by Department"],
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

    }
]

function viewEmployees() {
    inquirer.prompt(mainQs[1])
    .then((data) => {
        switch(data.viewE) {
            case "All Employees":
                database.query("SELECT * FROM employees", (err, res) => {
                    if (err) throw err;
                    console.table(res);
                    main();
                })
                break
            case "Search by Manager":
                database.query("SELECT id, CONCAT(first_name, ' ', last_name) AS manager FROM employees where ismanager IS true", (err, res) => {
                    if (err) throw err;
                    inquirer.prompt({
                        name: "manager",
                        message: "Please select a manager: ",
                        type: "list",
                        choices: res.manager,
                    })
                    .then((data) => {
                        database.query(`SELECT * FROM employees WHERE employees.manager_id = ${res.id}`, (err, res) => {
                            if (err) throw err;
                            console.table(res);
                            main();
                        })
                    })
                })
                
            case"Search by Department":
        }
    })
}

function start() {
  inquirer.prompt(mainQs[0]).then((data) => {
    switch (data.main) {
      case "View Employees":
    }
  });
}
