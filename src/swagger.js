import swaggerJsdoc from 'swagger-jsdoc';
import './config/environment.js'


const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'User API',
      version: '1.0.0',
      description: 'API docs with Swagger',
    },
    servers: [
      {
        url:  process.env.BASE_URL || 'http://localhost:4000',

      },
    ],
  },
//   apis: ['./routes/*.js'],
  apis: ['./src/*.js',
         './src/routes/*.js'
         ]
};

export const swaggerSpec = swaggerJsdoc(options);
