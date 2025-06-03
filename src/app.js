import express, { Router, json, urlencoded } from 'express';
import compression from 'compression';
import cors from 'cors';
import { resolve as pathResolve, dirname, join as pathJoin } from 'path';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import * as Sentry from '@sentry/node';

const { NODE_ENV } = process.env;
const publicDir = NODE_ENV === 'development' ? pathResolve(pathJoin(dirname('./'), 'public')) : pathResolve(pathJoin(dirname('./'), 'public'));

const app = express();
app.use(compression());
app.use(helmet());

app.use(bodyParser.json({ limit: '500mb' }));
app.use(bodyParser.urlencoded({ limit: '500mb', extended: true, parameterLimit: 50000 }));
app.use(express.static(publicDir));


app.get('/test', (req, res, next) => {
	res.status(200).send({ msg: 'server working' });
});


export default app;