DROP DATABASE IF EXISTS employee_db;

CREATE DATABASE employee_db;

USE employee_trackerDB;

CREATE TABLE role (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    job VARCHAR(100),
    salary INTEGER NOT NULL,
    dep_id INTEGER FOREIGN KEY REFERENCES department(id),
);

CREATE TABLE department (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100)
);
CREATE TABLE employee (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role_id INTEGER FOREIGN KEY REFERENCES role(id),
    manager_id INTEGER FOREIGN KEY REFERENCES employee(id)
    ismanager BOOLEAN,
);
