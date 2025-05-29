# Backend Engineering Assessment

### **Objective:**

Build a simple RESTful API for a **car dealership** to manage cars, categories, and customers.

### Requirements

- Use **NodeJS**, **Express**, **TypeScript**, and **MongoDB**
- Implement **token-based authentication** (e.g., JWT)
- Document all endpoints using **Postman**
- Write **unit tests** for key functionalities
- Include at least 4 endpoints related to the main models (Cars & Managers), demonstrating CRUD operations
- Include a `GET /cars` endpoint with support for pagination and multiple **filters,** such as:
    - brand
    - model
    - price range
    - availability
    - etc…

### 🔍 What We're Looking For

- **Relational Thinking**
    
    Design interconnected models — e.g., cars belong to categories, customers can purchase cars, etc.
    
- **Query Design**
    
    Write efficient and readable queries that demonstrate filter usage and thoughtful data access patterns
    
- **Authentication & Security**
    
    Use JWT or similar for authentication, apply proper input validation and sanitization
    
- **Error Handling**
    
    Use appropriate HTTP status codes and return informative error messages
    
- **Code Quality**
    
    Clean, modular, well-documented, and maintainable code using TypeScript best practices
    
- **Testing**
    
    Unit tests covering critical paths
    

### 📤 Submission Instructions

When you're done, send an email to dev@vobb.io with:

1. 🔗 **GitHub repository** (include setup instructions in the README)
2. 🔗 **Live API link** (hosted on Render, Railway, or similar)
3. 🔗 **Postman documentation link**