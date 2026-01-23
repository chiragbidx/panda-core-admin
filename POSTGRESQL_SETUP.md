# PostgreSQL Integration Setup Guide

This guide explains how to set up and use the PostgreSQL integration with dynamic table management in your Refine application.

## Overview

The application now supports:
- ✅ Dynamic PostgreSQL database connection
- ✅ Automatic table discovery
- ✅ Dynamic CRUD operations for any table
- ✅ Automatic form generation based on table schema

## Architecture

The frontend communicates with a backend API that handles the actual PostgreSQL connection. The backend API requirements are documented in `BACKEND_API.md`.

## Setup Steps

### 1. Backend API Setup

First, you need to set up a backend API that connects to PostgreSQL. See `BACKEND_API.md` for detailed API endpoint specifications and example implementations.

**Quick Start with Node.js/Express:**

```bash
# Install dependencies
npm install express pg cors

# Create a server.js file (see BACKEND_API.md for full example)
# Start the server
node server.js
```

### 2. Frontend Configuration

1. **Set API URL** (optional - defaults to `http://localhost:3000/api`):
   Create a `.env` file in the root directory:
   ```
   VITE_API_URL=http://localhost:3000/api
   ```

2. **Install dependencies** (if not already installed):
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

### 3. Connect to Database

1. Navigate to `/database/connection` in your browser
2. Enter your PostgreSQL database URL (e.g., `postgresql://user:password@localhost:5432/database?sslmode=disable`).
3. Click "Test Connection" to verify
4. Click "Save Configuration" to store settings

### 4. Browse Tables

1. Navigate to `/tables` to see all available tables
2. Click on any table to view its data
3. Use the CRUD operations:
   - **List**: View all records in a table
   - **Create**: Add new records
   - **Edit**: Modify existing records
   - **Delete**: Remove records

## Features

### Dynamic Table Discovery
- Automatically fetches all tables from your PostgreSQL database
- Shows table names and schemas
- Refreshes table list on demand

### Dynamic CRUD Operations
- **List View**: 
  - Data grid with automatic column detection
  - Pagination support
  - Sorting capabilities
  - Edit and Delete actions

- **Create Form**:
  - Automatically generated based on table schema
  - Field types inferred from column data types
  - Validation based on column constraints
  - Excludes auto-generated columns (like auto-increment IDs)

- **Edit Form**:
  - Pre-populated with existing data
  - Same dynamic generation as create form
  - Updates existing records

### Data Type Support
The system automatically handles:
- **Text**: Text fields with length constraints
- **Numbers**: Integer, bigint, numeric, decimal
- **Booleans**: Dropdown with True/False options
- **Dates**: Text input (can be enhanced for date pickers)
- **JSON**: Text area for JSON data

## File Structure

```
src/
├── providers/
│   └── postgresql-data-provider.ts  # Custom data provider for PostgreSQL API
├── utils/
│   └── database.ts                   # Database utility functions
├── pages/
│   └── tables/
│       ├── index.tsx                 # Exports
│       ├── connection.tsx           # Database connection page
│       ├── list.tsx                 # Tables list page
│       ├── dynamic-list.tsx         # Dynamic table data list
│       ├── dynamic-create.tsx       # Dynamic create form
│       └── dynamic-edit.tsx         # Dynamic edit form
└── App.tsx                           # Main app with routes
```

## API Endpoints Required

Your backend must implement these endpoints:

- `POST /api/database/connect` - Test database connection
- `GET /api/tables` - Get all tables
- `GET /api/tables/:tableName/columns` - Get table columns
- `GET /api/:tableName` - List records (with pagination)
- `GET /api/:tableName/:id` - Get single record
- `POST /api/:tableName` - Create record
- `PUT /api/:tableName/:id` - Update record
- `DELETE /api/:tableName/:id` - Delete record

See `BACKEND_API.md` for detailed specifications.

## Security Notes

⚠️ **Important**: The database connection form stores credentials in localStorage. This is suitable for development but **NOT for production**.

For production:
- Store database credentials server-side only
- Implement proper authentication (JWT, sessions)
- Use environment variables for sensitive data
- Add input validation and SQL injection prevention
- Implement rate limiting
- Enable proper CORS configuration

## Troubleshooting

### Connection Issues
- Verify PostgreSQL is running
- Check firewall settings
- Ensure database credentials are correct
- Verify SSL settings if required

### Table Not Showing
- Check backend API is running
- Verify database connection is configured
- Check browser console for errors
- Ensure tables exist in the database

### CRUD Operations Failing
- Verify backend API endpoints are implemented
- Check API response format matches expected structure
- Verify table has proper primary key (usually `id`)
- Check browser console and network tab for errors

## Next Steps

- Add authentication to backend API
- Implement row-level security
- Add data validation rules
- Enhance form fields (date pickers, file uploads, etc.)
- Add export functionality
- Implement search and filtering
- Add table relationships support
