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
        const query = `SELECT employee_role.first_name as "First Name", employee_role.last_name as "Last Name", name as "Department", title as "Role", salary as "Salary",  CONCAT (employee_manager.first_name, " ", employee_manager.last_name) as "Manager Name"
        FROM employee employee_role
        LEFT JOIN role ON employee_role.role_id = role.id
        LEFT JOIN department ON role.department_id = department.id
        LEFT JOIN employee employee_manager ON employee_role.manager_id = employee_manager.id`;
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

      if (answers.action === "addEmployee") {
        const roleQuery = "SELECT * FROM role";
        const roles = await db.query(roleQuery);

        const callback = (role) => {
          return {
            value: role.id,
            name: role.title,
          };
        };
        const choices = roles.map(callback);

        const employeeQuery = "SELECT * FROM employee";
        const employees = await db.query(employeeQuery);

        const employeeCallback = (employee) => {
          return {
            value: employee.id,
            name: `${employee.first_name} ${employee.last_name}`,
          };
        };
        const employeeChoices = employees.map(employeeCallback);

        const employeeQuestions = [
          {
            name: "first_name",
            type: "input",
            message:
              "What is the first name of the employee you would like to add?",
          },

          {
            name: "last_name",
            type: "input",
            message:
              "What is the last name of the employee you would like to add?",
          },
          {
            name: "role_id",
            type: "list",
            choices,
            message: "What is the role of the employee you would like to add?",
          },

          {
            name: "managerConfirm",
            type: "confirm",
            message: "Does the employee you want to add have a manager?",
          },

          {
            name: "manager_id",
            type: "list",
            choices: employeeChoices,
            message: "What is the name of the employee's manager?",
            when: (answers) => {
              return answers.managerConfirm;
            },
          },
        ];
        const { first_name, last_name, role_id, manager_id } =
          await inquirer.prompt(employeeQuestions);

        await db.parameterisedQuery(`INSERT INTO ?? SET ?`, [
          "employee",
          {
            first_name,
            last_name,
            role_id,
            manager_id,
          },
        ]);
      }
    }
  }
};
init();
