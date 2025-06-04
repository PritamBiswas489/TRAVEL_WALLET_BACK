import './config/environment.js';

import express, { Router, json, urlencoded } from 'express';
import compression from 'compression';
import cors from 'cors';
import { resolve as pathResolve, dirname, join as pathJoin } from 'path';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import * as Sentry from '@sentry/node';
import { Sequelize } from 'sequelize';

const { NODE_ENV, DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD } = process.env;
const publicDir = NODE_ENV === 'development' ? pathResolve(pathJoin(dirname('./'), 'public')) : pathResolve(pathJoin(dirname('./'), 'public'));

const app = express();
app.use(compression());
app.use(helmet());


const sequelize = new Sequelize(DB_DATABASE, DB_USERNAME, DB_PASSWORD, {
  host: DB_HOST,
  dialect: 'postgres',
  port: 25060, 
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: false
  
});

app.use(bodyParser.json({ limit: '500mb' }));
app.use(bodyParser.urlencoded({ limit: '500mb', extended: true, parameterLimit: 50000 }));
app.use(express.static(publicDir));


app.get('/test', (req, res, next) => {
	res.status(200).send({ msg: `server working - ${NODE_ENV} mode` });
});

app.get('/test-database', async (req, res, next) => {
 
	try {
		await sequelize.authenticate();
		console.log('Connection has been established successfully.');
		res.status(200).send({ msg: 'Database connection successful' });
	} catch (error) {
		console.error('Unable to connect to the database:', error);
		res.status(500).send({ msg: 'Database connection failed', error });
	}
});


export default app;