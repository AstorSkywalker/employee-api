const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const oracledb = require('oracledb');
const axios = require('axios');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

dotenv.config();

const dbConfig = {
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SERVICE_NAME}`
};

const app = express();
app.use(express.json());

// Swagger configuration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Employee API',
      version: '1.0.0',
      description: 'API for managing employees',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization',
          description: 'Enter your token in the following format: Bearer {token}',
        },
      },
    },
  },
  apis: ['./index.js'], // Path to the API docs
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Authenticate a user
 *     description: Returns a JWT token upon successful authentication.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@example.com
 *               password:
 *                 type: string
 *                 example: password
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: your_jwt_token_here
 *       401:
 *         description: Invalid credentials
 */

// Login API
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  // Here you would normally check the credentials against a database
  if (email === 'test@example.com' && password === 'password') {
    const token = jwt.sign({ email }, 'secretKey', { expiresIn: '1h' });
    return res.json({ token });
  }
  return res.status(401).json({ message: 'Invalid credentials' });
});

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(403).send('A token is required for authentication');

  jwt.verify(token, 'secretKey', (err, decoded) => {
    if (err) return res.status(401).send('Invalid Token');
    req.user = decoded;
    next();
  });
};

/**
 * @swagger
 * /employees/{id}:
 *   get:
 *     summary: Retrieve an employee by ID
 *     description: Returns employee details for a given ID. Requires a Bearer token for authentication.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the employee
 *         schema:
 *           type: integer
 *           example: 1
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employee found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 EMPLOYEE_ID:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: John Doe
 *                 position:
 *                   type: string
 *                   example: Developer
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Error retrieving employee
 */

/**
 * @swagger
 * /employees/{id}:
 *   put:
 *     summary: Update an employee
 *     description: Updates employee details for a given ID. Requires a Bearer token for authentication.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the employee
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: body
 *         name: employee
 *         required: true
 *         description: The employee details to update
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               example: John Doe
 *             position:
 *               type: string
 *               example: Developer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employee updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Employee updated successfully
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Error updating employee
 */

/**
 * @swagger
 * /employees/{id}:
 *   delete:
 *     summary: Delete an employee
 *     description: Deletes an employee by ID. Requires a Bearer token for authentication.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the employee
 *         schema:
 *           type: integer
 *           example: 1
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employee deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Employee deleted successfully
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Error deleting employee
 */

/**
 * @swagger
 * /employees:
 *   get:
 *     summary: Retrieve all employees
 *     description: Returns a list of all employees. Requires a Bearer token for authentication.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employees found
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   EMPLOYEE_ID:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: John Doe
 *                   position:
 *                     type: string
 *                     example: Developer
 *       500:
 *         description: Error retrieving employees
 */

// Get Employee by ID
app.get('/employees/:id', verifyToken, async (req, res) => {
  const employeeId = req.params.id;
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `SELECT * FROM employees WHERE EMPLOYEE_ID = :id`,
      [employeeId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Database error:', err.message); // Log the error message
    console.error('Full error stack:', err.stack); // Log the full error stack for more details
    if (connection) {
      try {
        await connection.close(); // Ensure the connection is closed
      } catch (closeError) {
        console.error('Error closing connection:', closeError.message);
      }
    }
    res.status(500).send('Error retrieving employee');
  }
});

// Update Employee
app.put('/employees/:id', verifyToken, async (req, res) => {
  const employeeId = req.params.id;
  const { name, position } = req.body;
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `UPDATE employees SET name = :name, position = :position WHERE EMPLOYEE_ID = :id`,
      { name, position, id: employeeId },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ message: 'Employee updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating employee', error });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});

// Delete Employee
app.delete('/employees/:id', verifyToken, async (req, res) => {
  const employeeId = req.params.id;
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `DELETE FROM employees WHERE EMPLOYEE_ID = :id`,
      { id: employeeId },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting employee', error });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});

// Get All Employees
app.get('/employees', verifyToken, async (req, res) => {
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(`SELECT * FROM employees`);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving employees', error });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});

async function testLogin() {
  try {
    const response = await axios.post('http://localhost:3000/login', {
      email: 'test@example.com',
      password: 'password'
    });

    console.log('Login successful:', response.data);
  } catch (error) {
    if (error.response) {
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

async function testGetEmployeeById(employeeId) {
  const token = process.env.TEST_TOKEN; // Read the token from .env

  try {
    const response = await axios.get(`http://localhost:3000/employees/${employeeId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Employee data:', response.data);
  } catch (error) {
    if (error.response) {
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

async function testUpdateEmployee(employeeId) {
  const token = process.env.TEST_TOKEN; // Read the token from .env

  try {
    const response = await axios.put(`http://localhost:3000/employees/${employeeId}`, {
      name: 'Updated Name',
      position: 'Updated Position'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(response.data);
  } catch (error) {
    if (error.response) {
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

async function testDeleteEmployee(employeeId) {
  const token = process.env.TEST_TOKEN; // Read the token from .env

  try {
    const response = await axios.delete(`http://localhost:3000/employees/${employeeId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(response.data);
  } catch (error) {
    if (error.response) {
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

async function testGetAllEmployees() {
  const token = process.env.TEST_TOKEN; // Read the token from .env

  try {
    const response = await axios.get(`http://localhost:3000/employees`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(response.data);
  } catch (error) {
    if (error.response) {
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Call the test functions
testLogin();
testGetEmployeeById('1'); // Replace '1' with the actual employee ID you want to retrieve
testUpdateEmployee('1'); // Replace '1' with the actual employee ID you want to update
testDeleteEmployee('1'); // Replace '1' with the actual employee ID you want to delete
testGetAllEmployees();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});