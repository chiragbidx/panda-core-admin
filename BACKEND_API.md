# Backend API Requirements

This frontend application requires a backend API that connects to PostgreSQL. The backend should implement the following endpoints:

## Base URL
The API base URL is configured via the `VITE_API_URL` environment variable (default: `http://localhost:3000/api`).

## Required Endpoints

### 1. Database Connection
```
POST /api/database/connect
Body: {
  databaseUrl: string
}
Response: {
  success: boolean
}
```

**All endpoints include a `databaseUrl` query parameter in requests from the frontend so the gateway can route to the correct database connection.**

### 2. Get All Tables
```
GET /api/tables?databaseUrl=postgresql://...
Response: {
  data: Array<{
    table_name: string,
    table_schema?: string
  }>
}
```

### 3. Get Table Columns
```
GET /api/tables/:tableName/columns
Response: {
  data: Array<{
    column_name: string,
    data_type: string,
    is_nullable: string,
    column_default: string | null,
    character_maximum_length: number | null
  }>
}
```

### 4. CRUD Operations for Tables

#### List Records
```
GET /api/:tableName?_page=1&_limit=10&_sort=id&_order=asc
Headers: {
  x-total-count: number (total count of records)
}
Response: Array<Record> | { data: Array<Record> }
```

#### Get Single Record
```
GET /api/:tableName/:id
Response: Record | { data: Record }
```

#### Create Record
```
POST /api/:tableName
Body: Record (object with table columns)
Response: Record | { data: Record }
```

#### Update Record
```
PUT /api/:tableName/:id
Body: Record (object with table columns)
Response: Record | { data: Record }
```

#### Delete Record
```
DELETE /api/:tableName/:id
Response: Record | { data: Record }
```

## Example Backend Implementation

You can use any backend framework (Node.js/Express, Python/Flask, etc.). Here's a basic structure:

### Node.js/Express Example

```javascript
const express = require('express');
const { Pool } = require('pg');
const app = express();

app.use(express.json());

let pool = null;

// Connect to database
app.post('/api/database/connect', async (req, res) => {
  const { databaseUrl } = req.body;
  
  try {
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes('sslmode=require'),
    });
    
    await pool.query('SELECT NOW()');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all tables
app.get('/api/tables', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT table_name, table_schema 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    res.json({ data: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get table columns
app.get('/api/tables/:tableName/columns', async (req, res) => {
  const { tableName } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length
      FROM information_schema.columns
      WHERE table_name = $1
      ORDER BY ordinal_position
    `, [tableName]);
    res.json({ data: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dynamic CRUD operations
app.get('/api/:tableName', async (req, res) => {
  const { tableName } = req.params;
  const { _page = 1, _limit = 10, _sort, _order = 'asc' } = req.query;
  
  try {
    let query = `SELECT * FROM "${tableName}"`;
    
    if (_sort) {
      query += ` ORDER BY "${_sort}" ${_order.toUpperCase()}`;
    }
    
    const offset = (_page - 1) * _limit;
    query += ` LIMIT ${_limit} OFFSET ${offset}`;
    
    const result = await pool.query(query);
    const countResult = await pool.query(`SELECT COUNT(*) FROM "${tableName}"`);
    
    res.set('x-total-count', countResult.rows[0].count);
    res.json({ data: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/:tableName/:id', async (req, res) => {
  const { tableName, id } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM "${tableName}" WHERE id = $1`,
      [id]
    );
    res.json({ data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/:tableName', async (req, res) => {
  const { tableName } = req.params;
  const data = req.body;
  
  try {
    const columns = Object.keys(data).map(key => `"${key}"`).join(', ');
    const values = Object.keys(data).map((_, i) => `$${i + 1}`).join(', ');
    const valuesArray = Object.values(data);
    
    const result = await pool.query(
      `INSERT INTO "${tableName}" (${columns}) VALUES (${values}) RETURNING *`,
      valuesArray
    );
    res.json({ data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/:tableName/:id', async (req, res) => {
  const { tableName, id } = req.params;
  const data = req.body;
  
  try {
    const setClause = Object.keys(data)
      .map((key, i) => `"${key}" = $${i + 1}`)
      .join(', ');
    const valuesArray = [...Object.values(data), id];
    
    const result = await pool.query(
      `UPDATE "${tableName}" SET ${setClause} WHERE id = $${valuesArray.length} RETURNING *`,
      valuesArray
    );
    res.json({ data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/:tableName/:id', async (req, res) => {
  const { tableName, id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM "${tableName}" WHERE id = $1 RETURNING *`,
      [id]
    );
    res.json({ data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

## Security Considerations

1. **Never expose database credentials in the frontend** - The connection form is for development/testing. In production, handle authentication server-side.

2. **Use environment variables** for database credentials in production.

3. **Implement proper authentication** - Add JWT tokens or session management.

4. **Validate and sanitize inputs** - Prevent SQL injection attacks.

5. **Use connection pooling** - Manage database connections efficiently.

6. **Add rate limiting** - Prevent abuse of your API.

7. **Enable CORS** properly - Only allow requests from your frontend domain.

## Getting Started

1. Set up your backend API following the endpoints above
2. Update `.env` file with your API URL
3. Start your backend server
4. Start the frontend: `npm run dev`
5. Navigate to `/database/connection` to configure database connection
6. Navigate to `/tables` to see all tables and perform CRUD operations
