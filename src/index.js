const inquirer = require("inquirer");
const DB = require("./db/DB");

const init = async () => {
  const db = new DB("company_db");

  await db.start();

  let inProgress = true;

  while (inProgress) {
    const question = {
      name: "action",
      type: "list",
      message: "What would you like to do?",
      choices: [
        {
          short: "Departments",
          value: "viewAllDepartments",
          name: "View All Departments",
        },
        {
          short: "Roles",
          value: "viewAllRoles",
          name: "View All Roles",
        },
        {
          short: "Employees",
          value: "viewAllEmployees",
          name: "View All Employees",
        },
        {
          short: "Employees By Department",
          value: "viewAllEmployeesByDepartment",
          name: "View All Employees By Department",
        },
        {
          short: "Employees By Role",
          value: "viewAllEmployeesByRole",
          name: "View All Employees By Role",
        },
        {
          short: "Add Employee",
          value: "addEmployee",
          name: "Add an Employee",
        },
        {
          short: "Remove Employee",
          value: "removeEmployee",
          name: "Remove an Employee",
        },
        {
          value: "updateEmployee",
          name: "Update an Employee",
        },
        {
          value: "updateEmployeeRole",
          name: "Update Employee Role",
        },
        {
          value: "updateEmployeeManager",
          name: "Update Employee Manager",
        },

        {
          value: "addRole",
          name: "Add Role",
        },
        {
          value: "removeRole",
          name: "Remove Role",
        },

        {
          value: "addDepartment",
          name: "Add Departments",
        },
        {
          value: "removeDepartment",
          name: "Remove Departments",
        },
        {
          short: "Budget",
          value: "viewBudget",
          name: "View Utilised Budget for a Department",
        },
        {
          short: "Exit",
          value: "exit",
          name: "Exit",
        },
      ],
    };

    const answers = await inquirer.prompt(question);
    if (answers.action === "exit") {
      inProgress = false;
    } else {
      if (answers.action === "viewAllDepartments") {
        const query = "SELECT * FROM department";
        const departments = await db.query(query);
        console.table(departments);
      }

      if (answers.action === "viewAllRoles") {
        const query = "SELECT * FROM role";
        const roles = await db.query(query);
        console.table(roles);
      }

      if (answers.action === "viewAllEmployees") {
        const query = `SELECT employee_role.first_name, employee_role.last_name, title, salary, name, employee_manager.first_name, employee_manager.last_name
        FROM employee employee_role 
        LEFT JOIN role 
        ON employee_role.role_id=role.id 
        LEFT JOIN department
        ON role.department_id=department.id
        LEFT JOIN employee employee_manager
        ON employee_role.manager_id=employee_manager.id`;
        const employees = await db.query(query);
        console.table(employees);
      }

      if (answers.action === "viewAllEmployeesByDepartment") {
        const departmentQuery = "SELECT * FROM department";
        const departments = await db.query(departmentQuery);

        const callback = (department) => {
          return {
            value: department.id,
            name: department.name,
          };
        };
        const choices = departments.map(callback);

        const question = {
          name: "departmentId",
          type: "list",
          message: "Select the department:",
          choices,
        };
        const { departmentId } = await inquirer.prompt(question);

        const query = `SELECT first_name, last_name, title, salary, name FROM employee LEFT JOIN role ON employee.role_id=role.id LEFT JOIN department ON role.department_id=department.id WHERE role.department_id=${departmentId}`;

        const employees = await db.query(query);
        console.table(employees);
      }
    }
  }
};

init();
