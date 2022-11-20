// List of dependencies
const mysql2 = require('mysql2');
const inquirer = require("inquirer");
require("console.table");
require('dotenv').config();

// Create mysql connection
const connection = mysql2.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

connection.connect(err => {
    if (err) throw err;
    startPrompt();
})

// List of promptMessages for answers
const promptMessages = {
    viewAllDepts: "View all departments",
    viewAllRoles: "View all roles",
    viewAllEmps: "View all employees",
    addDept: "Add a department",
    addRole: "Add a role",
    addEmp: "Add an employee",
    updateEmpRole: "Update an employee's role",
    exit: "Exit"
}

function startPrompt() {

    inquirer
        .prompt({
            type: 'list',
            name: 'selection',
            message: 'What would you like to do?',
            choices: [
                promptMessages.viewAllDepts,
                promptMessages.addDept,
                promptMessages.viewAllRoles,
                promptMessages.addRole,
                promptMessages.viewAllEmps,
                promptMessages.addEmp,
                promptMessages.updateEmpRole,
                promptMessages.exit
            ]
        }).then(answer => {
            switch (answer.selection) {
                case promptMessages.viewAllDepts:
                    viewAllDepts();
                    break;

                // Add a new dept
                case promptMessages.addDept:
                    inquirer
                        .prompt([{
                            type: 'input',
                            name: 'deptName',
                            message: 'Type department name: '
                        }]).then((answer) => {
                            addDept(answer.deptName);
                        })
                    break;

                case promptMessages.viewAllRoles:
                    viewAllRoles();
                    break;

                // Add a new role
                case promptMessages.addRole:
                    inquirer
                        .prompt([{
                            type: 'input',
                            name: 'roleName',
                            message: 'Type role name: '
                        },
                        {
                            type: 'input',
                            name: 'salary',
                            message: 'Type salary for the role: '
                        },
                        {
                            type: 'input',
                            name: 'deptId',
                            message: 'Department ID: '
                        }]).then((answer) => {
                            addRole(answer.roleName, answer.salary, answer.deptId);
                        })
                    break;

                case promptMessages.viewAllEmps:
                    viewAllEmps();
                    break;

                case promptMessages.addEmp:
                    addEmp();
                    break;

                case promptMessages.updateEmpRole:
                    updateEmpRole();
                    break;

                case promptMessages.exit:
                    connection.end();
                    break;
            }
        });
};

// View all depts
const viewAllDepts = async () => {
    console.log("All current departments:");
    const allDeps = await connection
        .promise()
        .query(
            "SELECT * FROM department;"
        );
    console.table(allDeps[0]);
    startPrompt();
};

// Add a new dept
function addDept(deptName) {
    const mysql2 = `INSERT INTO department (name) VALUES ("${deptName}")`;
    connection.query(mysql2, deptName, (err, rows) => {
        if (err) throw err;
        console.log("Department successfully added to the table")
        startPrompt();
    });
};

// View all roles
const viewAllRoles = async () => {
    console.log("All current roles:");
    const allRoles = await connection
        .promise()
        .query(
            "SELECT role.id, role.title, department.name AS department, role.salary FROM role LEFT JOIN department on role.department_id = department.id;"
        );
    console.table(allRoles[0]);
    startPrompt();
};

// Add a new role
function addRole(roleName, salary, deptId) {
    const mysql2 = `INSERT INTO role (title, salary, department_id) VALUES ("${roleName}", "${salary}", "${deptId}")`;
    connection.query(mysql2, (err, rows) => {
        if (err) throw err;
        console.log("New role successfully added to the table")
        startPrompt();
    });
};

const viewAllEmps = async () => {
    console.log("All current employees:");
    const allEmps = await connection
        .promise()
        .query(
            "SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, manager_id AS manager ID FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id LEFT OUTER JOIN employee mgr ON employee.manager_id = mgr.id;"
        );
    console.log(allEmps[0]);
    startPrompt();
};




