# Employee API

## Overview
The Employee API is a RESTful API for managing employee records. It allows you to create, read, update, and delete employee information. The API is built using Node.js, Express, and OracleDB.

## Features
- **Get all employees**: Retrieve a list of all employees.
- **Get employee by ID**: Retrieve details of a specific employee using their ID.
- **Update employee**: Update the details of an existing employee.
- **Delete employee**: Remove an employee from the records.

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd employee-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your database configuration:
   ```plaintext
   DB_HOST=your_db_host
   DB_PORT=your_db_port
   DB_SERVICE_NAME=your_db_service_name
   DB_USERNAME=your_db_username
   DB_PASSWORD=your_db_password
   TEST_TOKEN=your_test_token
   ```

## Usage

1. Start the server:
   ```bash
   node index.js
   ```

2. Access the API documentation:
   - Open your browser and navigate to `http://localhost:3000/api-docs`.

## Authentication Token

The Employee API requires a Bearer token for authentication on protected routes.

### Token Usage
- The token is currently hardcoded in the test functions for convenience during development and testing.
- This token is stored in the `.env` file under the variable `TEST_TOKEN`.

### Important Note
- While the hardcoded token can be used for testing purposes, it should be replaced with the token returned by the login API in a production environment.
- To obtain a valid token, you must authenticate using the login endpoint, which will return a token that can be used for subsequent API requests.

### Example
When making requests to protected routes, include the token in the Authorization header as follows:
```
Authorization: Bearer <your_token>
```

## API Endpoints

### Get All Employees
- **Endpoint**: `GET /employees`
- **Authorization**: Bearer token required.

### Get Employee by ID
- **Endpoint**: `GET /employees/{id}`
- **Authorization**: Bearer token required.

### Update Employee
- **Endpoint**: `PUT /employees/{id}`
- **Authorization**: Bearer token required.
- **Request Body**:
  ```json
  {
    "name": "Updated Name",
    "position": "Updated Position"
  }
  ```

### Delete Employee
- **Endpoint**: `DELETE /employees/{id}`
- **Authorization**: Bearer token required.

## Testing
You can use tools like Postman or Swagger UI to test the API endpoints. Make sure to include the Bearer token in the Authorization header for protected routes.

## License
This project is licensed under the MIT License.
