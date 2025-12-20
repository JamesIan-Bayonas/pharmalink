## PharmaLink API

> **Course:** IT 3117 – Application Development  
> **Student:** Alyssa Faith Bagunbon, Jay-An Calago, James  Ian Bayonas  
> **Semester:** 3rd Year, First Semester SY 2025-2026  

## Project Overview
**PharmaLink** is a comprehensive pharmacy inventory and sales management system built using **ASP.NET Core Web API**. It is designed to streamline interactions between pharmacy administrators and staff by managing medicine stocks, categorizing products, and processing sales transactions efficiently.

The system ensures accurate inventory tracking by automatically deducting stock upon sales and provides secure access control via **JWT-based Authentication** and **Role-Based Access Control (RBAC)**.

---

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
* **Error Handling:** Global Exception Middleware for consistent error responses.
* **Documentation:** Swagger UI integrated for API testing.

---

## Tech Stack
* **Framework:** ASP.NET Core 8.0 Web API
* **Language:** C#
* **Database:** Microsoft SQL Server
* **ORM:** Dapper
* **Auth:** JWT Bearer Authentication
* **Validation:** DataAnnotations

---

## Database Design & Scripts

### Database Entities
The database consists of 5 main entities:
1.  **Users** (1) ────< (Many) **Sales**
2.  **Sales** (1) ────< (Many) **SalesItems**
3.  **Medicines** (1) ────< (Many) **SalesItems**
4.  **Categories** (1) ────< (Many) **Medicines**

### 📜 SQL Creation Scripts
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
    Role NVARCHAR(50) NOT NULL, -- 'Admin', 'User'
    ProfileImagePath NVARCHAR(MAX) NULL
);

CREATE TABLE Categories (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL
);

CREATE TABLE Medicines (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CategoryId INT NOT NULL FOREIGN KEY REFERENCES Categories(Id),
    Description NVARCHAR(MAX) NULL,
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
    MedicineId INT NOT NULL FOREIGN KEY REFERENCES Medicines(Id),
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(18,2) NOT NULL
);
GO
```
---

Establishing your intent: You want to convert your list of API endpoints into a specific nested bullet-point structure that matches the style of your "Implemented Features" section for your `README.md` file.

## 🔌 API Endpoints

This project provides a comprehensive set of endpoints for managing the pharmacy system while also verifying who can access a certain endpoints:

## *Authentication & Account Management:*
 
* **POST** `/api/Auth/register`: Registers a new user account with a designated role(Public).
* **POST** `/api/Auth/login`: Authenticates credentials and returns a secure JWT token(Public).
* **GET** `/api/Auth/users`: Retrieves a list of all registered users (🔒 Admin Only).
* **PUT** `/api/Auth/update`: Allows logged-in users to update their own credentials.
* **DELETE** `/api/Auth/delete`: Allows users to permanently delete their own accounts.
  
## *Medicine Inventory:*

* **GET** `/api/Medicines`: Lists medicines with built-in support for **Pagination, Searching, and Sorting**(Pharmacist, Admin).
* **GET** `/api/Medicines/{id}`: Retrieves comprehensive details for a specific medicine record(Pharmacist, Admin).
* **POST** `/api/Medicines`: Adds a new medicine record to the inventory (🔒 Admin Only).
* **PATCH** `/api/Medicines/{id}`: Dedicated endpoint for manual stock level adjustments (🔒 Admin Only).
* **PATCH** `/api/Medicines/{id}/stocks`: Updates general medicine data including pricing and expiry (🔒 Admin Only).
* **DELETE** `/api/Medicines/{id}`: Removes a medicine record from the system (🔒 Admin Only).

## *Category Management:*
* 
* **GET** `/api/Categories`: Retrieves all available categories for organization.
* **POST** `/api/Categories`: Creates a new medicine category (🔒 Admin Only).
* **PUT** `/api/Categories/{id}`: Modifies the details of an existing category (🔒 Admin Only).
* **DELETE** `/api/Categories/{id}`: Permanently deletes a medicine category (🔒 Admin Only).

## *Sales & Transactions:*
  
* **POST** `/api/Sales`: Processes new sales transactions with **Automatic Stock Deduction**.
* **GET** `/api/Sales`: Retrieves the complete historical log of all processed sales(Pharmacist, Admin).
* **GET** `/api/Sales/{id}`: Fetches specific transaction details, including individual items sold(Pharmacist, Admin).
* **PUT** `/api/Sales/{id}`: Updates existing sales records for corrections (🔒 Admin Only).
* **DELETE** `/api/Sales/{id}`: Deletes a sale and automatically **restores the medicine stock**(🔒 Admin Only).

## User Profile & Media:

* **POST** `/api/Users/upload-photo`: Securely uploads a profile image (Supports JPG, JPEG, PNG up to 2MB)(Pharmacist, Admin).
  
---

## Setup Instructions
Follow these steps to set up and run the project locally.

**Prerequisites**
.NET 8.0 SDK
SQL Server (LocalDB or Express)
Visual Studio or VS Code

---

*Installation Steps*
## 1. Clone the Repository

```bash
git clone [https://github.com/jamesian-bayonas/pharmalink.git](https://github.com/jamesian-bayonas/pharmalink.git)
cd pharmalink
```
---

## 2. Database Configuration

Open **PharmaLink.API/appsettings.json**

Update the **ConnectionStrings:DefaultConnection** to match your *SQL Server* instance:

```json
"DefaultConnection": "Server=YOUR_SERVER_NAME;Database=PharmaLinkDB;Trusted_Connection=True;TrustServerCertificate=True;"
```
---

## 3. Initialize Database

1. Open SQL Server Management Studio (SSMS).
2. Copy the SQL Creation Scripts provided in the section above.
3. Execute the scripts to generate the database and required tables.
4. Run the Application

---

## 4 Run the Application
```bash
cd PharmaLink.API
dotnet restore
dotnet run
```
---

## 5. Access the API

1. The API will start at **https://localhost:5001** (or the port shown in your terminal).
2. Visit **Swagger UI** to test the endpoints: **https://localhost:5001/swagger/index.html**
