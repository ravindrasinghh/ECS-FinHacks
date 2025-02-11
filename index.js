'use strict'

const express = require('express');
const client = require('prom-client');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const { RDSDataClient, ExecuteStatementCommand } = require('@aws-sdk/client-rds-data');
// Create a Registry to register the metrics
const register = new client.Registry();
client.collectDefaultMetrics({ register });
const PORT = 8080;
const HOST = '0.0.0.0';

const app = express();

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express API with Swagger',
      version: '1.0.0',
      description: 'A simple Express API',
    },
  },
  apis: ['./index.js'], // files containing annotations
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// RDS configuration - using IAM Role, no need for explicit credentials
const rdsClient = new RDSDataClient({
    region: process.env.AWS_REGION || 'us-east-1'
});

const dbConfig = {
    host: process.env.DB_HOST || 'your-rds-endpoint',
    port: process.env.DB_PORT || 3306,
    username: process.env.DB_USERNAME || 'admin',
    password: process.env.DB_PASSWORD || 'your-password',
    database: process.env.DB_NAME || 'employees_db'
};

/**
 * @swagger
 * /:
 *   get:
 *     summary: Welcome message
 *     description: Returns a welcome message
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sentence:
 *                   type: string
 */
app.get('/', (req, res) => {
    const sentence = 'Welcome to the CICD Automation world';

    // Send the sentence as the response
    res.json({ sentence });
});

/**
 * @swagger
 * /metrics:
 *   get:
 *     summary: Get metrics
 *     description: Returns Prometheus metrics
 *     responses:
 *       200:
 *         description: Metrics data
 */
app.get('/metrics', async(req, res) => {
    res.setHeader('Content-Type', register.contentType);
    res.send(await register.metrics());
});

/**
 * @swagger
 * /ping:
 *   get:
 *     summary: Ping endpoint
 *     description: Returns pong message
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: pong
 */
app.get('/ping', (req, res) => {
    res.status(200).json({ message: "pong" })
});

/**
 * @swagger
 * /error:
 *   get:
 *     summary: Error endpoint
 *     description: Simulates an internal server error
 *     responses:
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
app.get('/error', (req, res) => {
    // Simulating an internal server error (500)
    const error = new Error('Internal Server Error');
    res.status(500).json({ error: error.message });
});

/**
 * @swagger
 * /db-check:
 *   get:
 *     summary: Check database connection and fetch employees
 *     description: Connects to Aurora Serverless using RDS Data API and retrieves list of employees
 *     responses:
 *       200:
 *         description: Successfully retrieved employees
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 employees:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       position:
 *                         type: string
 *       500:
 *         description: Database connection error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
app.get('/db-check', async (req, res) => {
    try {
        const params = {
            ...dbConfig,
            sql: 'SELECT * FROM employees',
            includeResultMetadata: true
        };

        const command = new ExecuteStatementCommand(params);
        const response = await rdsClient.send(command);

        // Transform the response into a more friendly format
        const employees = response.records.map(record => {
            return {
                id: record[0].longValue,
                name: record[1].stringValue,
                position: record[2].stringValue
            };
        });

        res.json({
            status: 'Database connection successful',
            employees: employees
        });
    } catch (error) {
        console.error('Database operation failed:', error);
        res.status(500).json({
            error: 'Database operation failed: ' + error.message
        });
    }
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Checks the health of the application and database connection
 *     responses:
 *       200:
 *         description: Application and database are healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 database:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *       500:
 *         description: Application or database is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 error:
 *                   type: string
 *                 timestamp:
 *                   type: string
 */
app.get('/health', async (req, res) => {
    try {
        const params = {
            ...dbConfig,
            sql: 'SELECT 1',
            includeResultMetadata: true
        };

        const command = new ExecuteStatementCommand(params);
        await rdsClient.send(command);

        res.json({
            status: 'healthy',
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(500).json({
            status: 'unhealthy',
            error: 'Database connection failed: ' + error.message,
            timestamp: new Date().toISOString()
        });
    }
});

app.listen(PORT, HOST);
console.log(`running on http://${HOST}:${PORT}`);
