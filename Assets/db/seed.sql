INSERT INTO departments (name)
VALUES ("Legal"), ("Sales"), ("Engineering"), ("Finance"), ("Management");

INSERT INTO roles (job, salary, dep_id)
VALUES ("Lawyer", 95000, 1), ("Salesman", 70000, 2), ("Engineer", 100000, 3), ("Financial Advisor", 84000, 4),
("Chief Legal Officer", 150000, 1), ("Chief Sales Officer", 95000, 2), ("Chief Information Officer", 170000, 3), 
("Chief Financial Officer", 130000, 4), ("Chief Executive Officer", 200000, 5);

INSERT INTO employees (first_name, last_name, role_id, manager_id, ismanager)
VALUES ("Travis", "Guy", 9, null, true),
("law", "guy", 5, 1, true),
("sales", "guy", 6, 1, true),
("tech", "guy", 7, 1, true),
("finance", "guy", 8, 1, true),
("Running", "OutofNames", 1, 2, false),
("Johm", "Doe", 2, 3, false),
("Hans", "Idk", 3, 4, false),
("Toby", "McGuire", 4, 5, false),
("Clark", "Kent", 3, 4, false);