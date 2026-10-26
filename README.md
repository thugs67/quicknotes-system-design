# QuickNotes — Full-Stack Note Management API & Client

## Project Description

**QuickNotes** is a modern, lightweight note-taking application designed for efficient note creation, tagging, and management. The project features a responsive JavaScript single-page frontend linked to a robust RESTful API backend backed by a relational database schema. Built with high performance and clean architecture in mind, QuickNotes supports complete CRUD operations, real-time client validation, safe DOM updates, and scalable system design principles.

---

## Documentation & Resources

For detailed architectural, database, and API specifications, refer to the following project documents:

* 📄 [Database Schema & ER Specifications](./docs/database-schema.md) — Includes table definitions, primary/foreign key mappings, indexing strategies, and relational join logic.
* 📄 [REST API Specification](./docs/api-specification.md) — Details all supported HTTP endpoints, request/response JSON schemas, header configurations, and standard error handling responses.
* 📄 [System Architecture & Scaling Plan](./docs/system-architecture.md) — Outlines load estimations, read/write throughput calculations, system trade-offs, and high-availability component designs.

---

## How to Run the API Client

Follow these steps to set up and run the frontend client locally:

### Prerequisites
* A modern web browser (Chrome, Firefox, Edge, Safari).
* A local static web server (such as VS Code's **Live Server** extension, Python `http.server`, or `npx serve`).

### Step-by-Step Setup

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/thugs67/quicknotes-system-design.git
   cd quicknotes