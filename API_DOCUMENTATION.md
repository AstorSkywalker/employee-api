# API Documentation

## Authentication

### Login
- **URL**: `/login`
- **Method**: `POST`
- **Description**: Authenticates a user and returns a JWT token.
- **Request Body**:
  ```json
  {
    "email": "test@example.com",
    "password": "password"
  }
  ```
- **Response**:
  - **200 OK**:
    ```json
    {
      "token": "your_jwt_token_here"
    }
    ```
  - **401 Unauthorized**:
    ```json
    {
      "message": "Invalid credentials"
    }
    ```

## Employee Endpoints

### Get Employee by ID
- **URL**: `/employees/:id`
- **Method**: `GET`
- **Description**: Retrieves an employee's details by their ID.
- **Authorization**: Bearer token required.
- **Request Parameters**:
  - `id`: The ID of the employee.
- **Response**:
  - **200 OK**:
    ```json
    {
      "EMPLOYEE_ID": 1,
      "name": "John Doe",
      "position": "Developer"
    }
    ```
  - **404 Not Found**:
    ```json
    {
      "message": "Employee not found"
    }
    ```
  - **500 Internal Server Error**:
    ```json
    {
      "message": "Error retrieving employee"
    }
    ```
