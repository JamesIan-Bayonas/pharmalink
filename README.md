# PharmaLink

> **Executive Summary:** PharmaLink is a high-availability clinical inventory and Point-of-Sale (POS) management system designed to enforce strict operational workflows for pharmacy staff. Engineered with an ASP.NET Core Web API, a React/TypeScript frontend, and a PostgreSQL database, it guarantees atomic transactional integrity for all dispensed medications while enforcing role-based access controls.

[Live Demo](https://pharmalink-web-wine.vercel.app/dashboard)

---

![PharmaLink Dashboard Preview](./dashboard-preview.png)

## Overview & Architectural Deep Dive

### Core Business Problem & Purpose

Pharmacies operate under strict regulatory and operational constraints where inventory desynchronization or dispensing expired medications poses severe liabilities. PharmaLink solves this by providing a unified, real-time dashboard that synchronizes POS transactions directly with backend inventory. It features automatic stock deduction, expiry threshold monitoring, and strict segregation of duties between operational Pharmacists and system Administrators, ensuring compliance and data integrity at the point of sale.

### Technical Challenges & Engineering Trade-offs

* **The Challenge:** Handling complex, multi-table POS transactions (creating a sale record, inserting multiple line items, and deducting inventory stock) securely. A failure mid-transaction could lead to ghost inventory and financial desynchronization.
* **The Solution:** Bypassed heavy ORMs (like Entity Framework) in favor of **Dapper (Micro-ORM)** combined with raw PostgreSQL queries and explicit `NpgsqlTransaction` blocks in the `SaleRepository`.
* **The Trade-off:** We traded the rapid development speed and automated change-tracking of a full ORM for raw execution speed and absolute control over the SQL execution plan. This guarantees atomic, ACID-compliant checkouts, completely eliminating the risk of partial database writes at the cost of writing manual SQL statements.

---

## Tech Stack & Architecture Matrix

| Layer | Technology | Primary Package / Driver | Architectural Role |
| --- | --- | --- | --- |
| **Frontend** | React 19 (TypeScript) | `vite`, `react-router-dom`, `recharts` | SPA delivering a responsive, role-guarded user interface with real-time charting. |
| **Backend** | ASP.NET Core 8.0 | `Microsoft.AspNetCore.Mvc` | RESTful API adhering to a Service-Repository pattern for decoupled business logic. |
| **Database** | PostgreSQL | `Dapper`, `Npgsql` | Primary relational data store utilizing Micro-ORM for high-performance querying. |
| **DevOps & Infra** | Docker / Vercel | `Dockerfile`, `vercel.json` | Containerized backend deployment with serverless routing rules for the frontend. |

---

## Key Features & Engineering Capabilities

* **Atomic POS Transactions:** Implements multi-table SQL transaction blocks via Dapper (`SaleRepository.cs`) → **Impact:** Ensures 100% database consistency during checkouts and voids; if a stock deduction fails, the entire sale rolls back automatically.
* **Custom Role-Based Access Control (RBAC):** Integrates JWT claims with a custom `[AdminGuard]` C# attribute and React `RoleRoute` components → **Impact:** Enforces strict segregation of duties, entirely locking Pharmacists out of administrative inventory/user endpoints at both the UI and API routing layers.
* **Optimized Analytics Aggregation:** Consolidates daily revenue, transaction counts, low-stock alerts, and expiring items into a single, highly optimized PostgreSQL query (`DashboardRepository.cs`) → **Impact:** Eliminates N+1 query bottlenecks, allowing the administrative dashboard to load instantly regardless of inventory scale.

---

## Project Structure

```text
.
├── PharmaLink.API/                 # Backend Workspace (.NET 8)
│   ├── Attributes/                 # Custom routing attributes (e.g., AdminGuard)
│   ├── Controllers/                # REST API endpoints
│   ├── DTOs/                       # Data Transfer Objects for payload validation
│   ├── Entities/                   # Domain models mapping to DB tables
│   ├── Interfaces/                 # Contracts for Services and Repositories
│   ├── Repositories/               # Dapper data access layer (PostgreSQL)
│   ├── Services/                   # Core business logic and Auth validation
│   ├── Utilities/                  # AutoMapper profiles and DB Seeders
│   ├── Dockerfile                  # Multi-stage build definition for backend
│   └── Program.cs                  # API entry point & DI container configuration
├── src/                            # Frontend Workspace (React / Vite)
│   ├── components/                 # Reusable UI elements (Skeletons, Modals)
│   ├── context/                    # React Context (AuthContext for JWT session)
│   ├── features/                   # Domain-driven feature modules (Auth, POS, Inventory)
│   ├── layouts/                    # Global wrappers (Sidebar, Nav)
│   ├── services/                   # Axios interceptors and API communication
│   └── App.tsx                     # React Router configuration
├── package.json                    # Frontend dependencies and scripts
└── vite.config.ts                  # Vite & Tailwind bundler configuration

```

---

## Environment Configuration

The application requires specific environment variables for both backend and frontend execution. Create `.env` files based on these requirements.

| Variable | Description | Required | Default / Example |
| --- | --- | --- | --- |
| **Backend (`appsettings.json`)** |  |  |  |
| `ConnectionStrings:DefaultConnection` | PostgreSQL connection string | Yes | `Host=localhost;Database=postgres;...` |
| `JwtSettings:Key` | 256-bit secret key for signing JWTs | Yes | `super_secret_jwt_key_min_32_chars` |
| **Frontend (`.env`)** |  |  |  |
| `VITE_API_URL` | Base URL targeting the .NET API | Yes | `http://localhost:5297` |

---

## Getting Started & Local Setup

### Prerequisites

* **Runtime:** Node.js >= 18.x, .NET 8.0 SDK, PostgreSQL Server
* **Package Manager / CLI:** `npm`, `dotnet CLI`

### Installation & Execution

#### 1. Backend Setup (.NET API)

1. **Navigate to the Backend Directory:**

```bash
cd PharmaLink.API

```

2. **Restore Dependencies:**

```bash
dotnet restore

```

3. **Configure Database:**
Update `appsettings.Development.json` (or `appsettings.json`) with your active PostgreSQL connection string. The application utilizes a programmatic seeder (`DbSeeder.cs`) to generate default Admin and Pharmacist accounts on startup.

*(Note: Legacy T-SQL scripts exist in `/database` for SQL Server environments, but the core repositories are optimized for Npgsql).*

4. **Start the API:**

```bash
dotnet run

```

*The API will typically start on `http://localhost:5297`. Swagger UI is available at `/swagger/index.html`.*

#### 2. Frontend Setup (React/Vite)

1. **Open a new terminal and navigate to the root directory:**

```bash
cd ..

```

2. **Install Dependencies:**

```bash
npm install

```

3. **Configure Environment:**
Create a `.env` file in the root directory mapping to your running API.

```bash
echo "VITE_API_URL=http://localhost:5297" > .env

```

4. **Start the Development Server:**

```bash
npm run dev

```

*Access the application at `http://localhost:5173`.*

---

## Verification & Testing

The frontend is configured with strict ESLint and TypeScript compilation rules.

```bash
# Run TypeScript compilation check and Vite build
npm run build

# Run Code Linter
npm run lint

```

For the backend, verify DI container integrity and compilation:

```bash
cd PharmaLink.API
dotnet build

```

---

## Security & Operational Readiness

* **Authentication & Authorization:** Implements stateless JWT Bearer token authentication. Tokens encode user IDs and roles. Frontend routes are guarded via `<ProtectedRoute>` and `<RoleRoute>`, while backend endpoints are secured via `[Authorize]` and custom `[AdminGuard]` attributes.
* **Data Protection & Sanitization:** Uses `BCrypt.Net` for cryptographic password hashing. Dapper utilizes fully parameterized queries across all repositories, inherently neutralizing SQL injection vulnerabilities. File uploads (profile photos) are strictly validated for MIME types (JPG/PNG) and size constraints (2MB limit).

---

## License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/JamesIan-Bayonas/pharmalink/tree/main?tab=MIT-1-ov-file) file for full details.
