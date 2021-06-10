const inquirer = require("inquirer");
const DB = require("./db/DB");

// initiate init function when database is started
const init = async () => {
  const db = new DB("company_db");

  await db.start();

  // let variable inprogress be true, but for when it is false it will run the loop below
  let inProgress = true;
  // while loop created to repeat same code multiple times as a repeating if statement
  while (inProgress) {
    // questions with inputs and choices array for what user would like to do
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
    // use inquirer to store answers in variable when use answers prompted questions
    const answers = await inquirer.prompt(question);
    // if the answers action is exit then initial let loop for inprogress will be false which allows user to exit
    if (answers.action === "exit") {
      inProgress = false;
      // if the answer is not to exit, then continue with answers from questions based on user input
    } else {
      // if user chooses to view all departments, select all departments from database and present in a table
      if (answers.action === "viewAllDepartments") {
        const query = "SELECT * FROM department";
        const departments = await db.query(query);
        console.table(departments);
      }
      // if user chooses to view all roles, select all roles from database and present in a table
      if (answers.action === "viewAllRoles") {
        const query = "SELECT * FROM role";
        const roles = await db.query(query);
        console.table(roles);
      }
      // if user chooses to view all employees, select all employees from database and present in a table
      if (answers.action === "viewAllEmployees") {
        const query = `SELECT employee_role.first_name as "First Name", employee_role.last_name as "Last Name", name as "Department", title as "Role", salary as "Salary",  CONCAT (employee_manager.first_name, " ", employee_manager.last_name) as "Manager Name"
        FROM employee employee_role
        LEFT JOIN role ON employee_role.role_id = role.id
        LEFT JOIN department ON role.department_id = department.id
        LEFT JOIN employee employee_manager ON employee_role.manager_id = employee_manager.id`;
        const employees = await db.query(query);
        console.table(employees);
      }
      // if user chooses to view all employees by departments, select all departments from database and present in a table
      if (answers.action === "viewAllEmployeesByDepartment") {
        const departmentQuery = "SELECT * FROM department";
        const departments = await db.query(departmentQuery);

        // callback function to return department id and name from department table
        const callback = (department) => {
          return {
            value: department.id,
            name: department.name,
          };
        };
        // for each department, it will be stored in the choices variable and create a new array by calling the function on each role
        const choices = departments.map(callback);
        // ask user to select department from the list of departments retrieved from the choices/callback
        const question = {
          name: "departmentId",
          type: "list",
          message: "Select the department:",
          choices,
        };
        // deconstruct departmentId to map object onto many variables
        const { departmentId } = await inquirer.prompt(question);
        // obtain employee details from database and join department id and name from the users input
        const query = `SELECT first_name, last_name, title, salary, name FROM employee LEFT JOIN role ON employee.role_id=role.id LEFT JOIN department ON role.department_id=department.id WHERE role.department_id=${departmentId}`;

        const employees = await db.query(query);
        console.table(employees);
      }
      // add employee by retrieving role database
      if (answers.action === "addEmployee") {
        const roleQuery = "SELECT * FROM role";
        const roles = await db.query(roleQuery);
        // from role database, retrieve the id and title and map it and store in choices variable
        const callback = (role) => {
          return {
            value: role.id,
            name: role.title,
          };
        };
        // create a new array by calling the function on each role
        const choices = roles.map(callback);
        // obtain employee details from employee database
        const employeeQuery = "SELECT * FROM employee";
        const employees = await db.query(employeeQuery);

        const employeeCallback = (employee) => {
          return {
            value: employee.id,
            name: `${employee.first_name} ${employee.last_name}`,
          };
        };
        // create a new array by calling the function on each employee
        const employeeChoices = employees.map(employeeCallback);
        // employee questions created for employee details
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
          // create choices from employee choices variable and create function for when user answers for managerConfirm is yes
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
        // return first name, last name, role id and manager id from questions
        const { first_name, last_name, role_id, manager_id } =
          await inquirer.prompt(employeeQuestions);
        // store returned answers and push back into the employee database
        await db.parameterisedQuery(`INSERT INTO ?? SET ?`, [
          "employee",
          {
            first_name,
            last_name,
            role_id,
            manager_id,
          },
        ]);
        console.log("employee added successfully");
      }
      // is user chooses to add role, show department database in table
      if (answers.action === "addRole") {
        const departmentQuery = "SELECT * FROM department";
        const departments = await db.query(departmentQuery);
        // return department id and name from department table 
        const callback = (department) => {
          return {
            value: department.id,
            name: department.name,
          };
        };
        // create a new array by calling the function on each department
        const choices = departments.map(callback);
        // create role questions
        const roleQuestions = [
          {
            name: "department_id",
            type: "list",
            choices,
            message:
              "What is the department of the role you would like to add?",
          },

          {
            name: "title",
            type: "input",
            message: "What is the role title you would like to add?",
          },

          {
            name: "salary",
            type: "number",
            message: "What is the salary of the role you would like to add?",
          },
        ];
        // return the department id, title and salary from role questions and push new input back into the role database
        const { department_id, title, salary } = await inquirer.prompt(
          roleQuestions
        );

        await db.parameterisedQuery(`INSERT INTO ?? SET ?`, [
          "role",
          {
            department_id,
            title,
            salary,
          },
        ]);
        console.log("role added successfully");
      }
      // if user chooses to add department, create department questions
      if (answers.action === "addDepartment") {
        const departmentQuestions = [
          {
            name: "name",
            type: "input",
            message: "What is the department you would like to add?",
          },
        ];
        const { name } = await inquirer.prompt(departmentQuestions);
        // store department name chosen by user input back into department table
        await db.query(`INSERT INTO department (name) VALUES ("${name}");`);
        console.log("department added successfully");
      }
      // if user views all employees by role, create query to show all roles from role database
      if (answers.action === "viewAllEmployeesByRole") {
        const roleQuery = "SELECT * FROM role";
        const roles = await db.query(roleQuery);
        // return role id and title for each role
        const callback = (role) => {
          return {
            value: role.id,
            name: role.title,
          };
        };
        // create a new array by calling the function on each role
        const roleChoices = roles.map(callback);
        // create role questions
        const roleQuestions = {
          name: "roleId",
          type: "list",
          choices: roleChoices,
          message: "What is the role you would like to view?",
        };
        // update employee table from answers given by user input
        const answers = await inquirer.prompt(roleQuestions);

        const employeeQuery = `SELECT * FROM employee WHERE role_id = ${answers.roleId} `;
        const employeeByrole = await db.query(employeeQuery);
        console.table(employeeByrole);
      }
      // if user chooses to update employee role, create query showing all employees from table
      if (answers.action === "updateEmployeeRole") {
        const employeeQuery = `SELECT * FROM employee`;
        const allEmployees = await db.query(employeeQuery);
        // return employee id and chosen employee first name and last name
        const callback = (employee) => {
          return {
            value: employee.id,
            name: `${employee.first_name} ${employee.last_name}`,
          };
        };
        // create a new array by calling the function on all employees
        const employeeChoices = allEmployees.map(callback);
        //create query sowing role table
        const roleQuery = "SELECT * FROM role";
        const roles = await db.query(roleQuery);
        // return role id and title
        const roleCallback = (role) => {
          return {
            value: role.id,
            name: role.title,
          };
        };
        // create a new array by calling the function on each role
        const roleChoices = roles.map(roleCallback);
        // create questions for updating role including arrays created in associated choices for questions
        const updateQuestions = [
          {
            name: "employeeId",
            type: "list",
            choices: employeeChoices,
            message: "Which employee would you like to update?",
          },
          {
            name: "roleId",
            type: "list",
            choices: roleChoices,
            message:
              "What is the role you would like to update for this employee?",
          },
        ];
        // update users answers back into employee table when role id matches user input
        const answers = await inquirer.prompt(updateQuestions);
        const updateQuery = `UPDATE employee SET role_id = ${answers.roleId} WHERE id = ${answers.employeeId}`;
        const updatedEmployee = await db.query(updateQuery);
        console.log("employee updated successfully");
      }
      // if user removed department, create query showing all departments from table
      if (answers.action === "removeDepartment") {
        const departmentQuery = "SELECT * FROM department";
        const departments = await db.query(departmentQuery);
        // return department id and title
        const callback = (department) => {
          return {
            value: department.id,
            name: department.name,
          };
        };
        // create a new array by calling the function on each department
        const choices = departments.map(callback);
        // create questions for choosing department user wants to delete
        const question = {
          name: "departmentId",
          type: "list",
          message: "Select the department:",
          choices,
        };
        // users answers from question used to create query when the department matching user input for department id is removed
        const { departmentId } = await inquirer.prompt(question);

        const removeQuery = `DELETE FROM department WHERE id = ${departmentId} `;
        const updatedDepartment = await db.query(removeQuery);
        console.log("department deleted successfully");
      }
      // if use wants to view budget, create query to show all departments from table
      if (answers.action === "viewBudget") {
        const departmentQuery = "SELECT * FROM department";
        const departments = await db.query(departmentQuery);
        // return department id and name
        const callback = (department) => {
          return {
            value: department.id,
            name: department.name,
          };
        };

        //create a new array by calling the function on each department
        const choices = departments.map(callback);

        const question = {
          name: "departmentId",
          type: "list",
          message: "Select the department:",
          choices,
        };
        const { departmentId } = await inquirer.prompt(question);
        // create query to select sum of salary from role when department id matches user input
        const budgetQuery = `SELECT SUM (salary) FROM role WHERE department_id = ${departmentId}`;
        const budget = await db.query(budgetQuery);
        //console log the budget from array of chosen input to generate sum of salary
        console.log(`budget: ${budget[0]["SUM (salary)"]}`);
      }
    }
  }
};
init();
