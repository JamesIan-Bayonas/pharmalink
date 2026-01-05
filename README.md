## PharmaLink API

> **Course:** IT 3117 – Application Development  
> **Student:** Alyssa Faith Bagunbon, Jay-An Calago, James  Ian Bayonas  
> **Semester:** 3rd Year, First Semester SY 2025-2026  

## Project Overview
**PharmaLink** is a comprehensive pharmacy inventory and sales management system built using **ASP.NET Core Web API**. It is designed to streamline interactions between pharmacy administrators and staff by managing medicine stocks, categorizing products, and processing sales transactions efficiently.

The system ensures accurate inventory tracking by automatically deducting stock upon sales and provides secure access control via **JWT-based Authentication** and **Role-Based Access Control (RBAC)**.

## Implemented Features
This project implements all requirements specified in the Final Project guidelines:

* **Architecture:** Layered structure using **Controllers**, **Services**, **Repositories**, and **DTOs**.
* **Authentication:** Secure **JWT** (JSON Web Token) login and registration.
* **Data Access:** High-performance data manipulation using **Dapper** (Micro-ORM).
* **Database:** **SQL Server** relational database with complex relationships.
* **Inventory Management:**
    * CRUD operations for Medicines and Categories.
    * **Pagination, Filtering, and Sorting** for medicine lists.
* **Sales System:**
    * **Transactional Integrity:** Sales are processed atomically; if any part fails, the entire transaction rolls back.
    * **Automatic Stock Deduction:** Selling an item immediately reduces inventory.
* **Error Handling:** Global Exception M    iddleware for consistent error responses.
* **Documentation:** Swagger UI integrated for API testing.

## Tech Stack
* **Framework:** ASP.NET Core 8.0 Web API
* **Language:** C#
* **Database:** Microsoft SQL Server
* **ORM:** Dapper
* **Auth:** JWT Bearer Authentication
* **Validation:** DataAnnotations

## Database Design & Scripts

### Database Entities
The database consists of 5 main entities:
1.  **Users** (1) ────< (Many) **Sales**
2.  **Sales** (1) ────< (Many) **SalesItems**
3.  **Medicines** (1) ────< (Many) **SalesItems**
4.  **Categories** (1) ────< (Many) **Medicines**

### SQL Creation Scripts
*Run these scripts in SQL Server Management Studio (SSMS) to set up the database.*

```sql
CREATE DATABASE PharmaLinkDB;
GO
USE PharmaLinkDB;
GO

CREATE TABLE Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserName NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(MAX) NOT NULL,
    Role NVARCHAR(50) NOT NULL, -- 'Admin', 'Pharmacist'
    ProfileImagePath NVARCHAR(MAX) NULL,
    CreatedAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE Categories (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL
);

CREATE TABLE Medicines (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CategoryId INT NOT NULL FOREIGN KEY REFERENCES Categories(Id),
    Description NVARCHAR(500) NULL,
    Name NVARCHAR(200) NOT NULL,
    StockQuantity INT NOT NULL DEFAULT 0,
    Price DECIMAL(18,2) NOT NULL,
    ExpiryDate DATETIME NOT NULL
);

CREATE TABLE Sales (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL FOREIGN KEY REFERENCES Users(Id),
    TotalAmount DECIMAL(18,2) NOT NULL,
    TransactionDate DATETIME NOT NULL DEFAULT GETDATE()
);

CREATE TABLE SalesItems (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    SaleId INT NOT NULL FOREIGN KEY REFERENCES Sales(Id) ON DELETE CASCADE,
    MedicineId INT NOT NULL FOREIGN KEY REFERENCES Medicines(Id) ON DELETE CASCADE,
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(18,2) NOT NULL
);
GO

SET IDENTITY_INSERT Categories ON;
INSERT INTO Categories (Id, Name) VALUES 
(1, 'Antibiotics'), (2, 'Analgesics'), (3, 'Antihistamines'), 
(4, 'Vitamins'), (5, 'Antacids'), (6, 'Category 6');
SET IDENTITY_INSERT Categories OFF;
```

Establishing your intent: You want to convert your list of API endpoints into a specific nested bullet-point structure that matches the style of your "Implemented Features" section for your `README.md` file.

## API Endpoints

This project provides a comprehensive set of endpoints for managing the pharmacy system while also verifying who can access a certain endpoints:

## API Endpoints

The API is secured using JWT Authentication. Below is a summary of available endpoints, their access levels, and descriptions.

### **Authentication & Accounts**
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/Auth/register` | Public | Register a new user account (Admin or Pharmacist). |
| `POST` | `/api/Auth/login` | Public | Authenticate and receive a JWT token. |
| `GET` | `/api/Auth/users` | Admin | Retrieve a list of all registered users. |
| `PUT` | `/api/Auth/update` | Any Logged-in User | Update own credentials (username/password). |
| `DELETE` | `/api/Auth/delete/{id}` | Admin | Permanently delete a user account. |

### **Medicine Inventory**
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/Medicines` | Pharmacist, Admin | List all medicines (Supports Pagination, Search, Sort). |
| `GET` | `/api/Medicines/{id}` | Pharmacist, Admin | Get details of a specific medicine. |
| `POST` | `/api/Medicines` | Admin | Add a new medicine to inventory. |
| `PUT` | `/api/Medicines/{id}` | Admin | Update general medicine details (Price, Name, etc.). |
| `PATCH` | `/api/Medicines/{id}/stock` | Admin | Quickly update stock quantity only. |
| `DELETE` | `/api/Medicines/{id}` | Admin | Remove a medicine from the system. |

### **Sales & Transactions**
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/Sales` | Pharmacist, Admin | Process a new sale (triggers auto-stock deduction). |
| `GET` | `/api/Sales` | Pharmacist, Admin | View sales history (Supports Pagination). |
| `GET` | `/api/Sales/{id}` | Pharmacist, Admin | View specific transaction details and items. |
| `PUT` | `/api/Sales/{id}` | Admin | Update an existing sale record (Restores & Re-deducts stock). |
| `DELETE` | `/api/Sales/{id}` | Admin | Void/Delete a sale (Automatically restores stock). |

### **Categories**
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/Categories` | Pharmacist, Admin | List all medicine categories. |
| `POST` | `/api/Categories` | Admin | Create a new category. |
| `PUT` | `/api/Categories/{id}` | Admin | Update an existing category. |
| `DELETE` | `/api/Categories/{id}` | Admin | Delete a category. |

### **Profile**
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/Users/upload-photo` | Any Logged-in User | Upload a profile picture (Max 2MB, Images only). |

## Setup Instructions
Follow these steps to set up and run the project locally.

**Prerequisites**
.NET 8.0 SDK
SQL Server (LocalDB or Express)
Visual Studio or VS Code

*Installation Steps*
## 1. Clone the Repository

```bash
git clone [https://github.com/jamesian-bayonas/pharmalink.git](https://github.com/jamesian-bayonas/pharmalink.git)
cd pharmalink
```

## 2. Database Configuration

Open **PharmaLink.API/appsettings.json**

Update the **ConnectionStrings:DefaultConnection** to match your *SQL Server* instance:

```json
"DefaultConnection": "Server=YOUR_SERVER_NAME;Database=PharmaLinkDB;Trusted_Connection=True;TrustServerCertificate=True;"
```

## 3. Initialize Database
1. Open SQL Server Management Studio (SSMS).
2. Copy the SQL Creation Scripts provided in the section above.
3. Execute the scripts to generate the database and required tables.
4. Run the Application

## 4 Run the Application

```bash

cd PharmaLink.API
dotnet restore
dotnet run

```

## 5. Access the API

```bash
1. The API will start at https://localhost:5001 (or the port shown in your terminal).
2. Visit Swagger UI to test the endpoints: https://localhost:5001/swagger/index.html
```
