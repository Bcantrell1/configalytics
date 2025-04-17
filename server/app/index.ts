import 'dotenv/config';
import type { Express, Request, Response } from 'express';
import express from 'express';
import { databaseConnection } from './database.ts';

async function main() {
    startAPI();
}

const startAPI = async (): Promise<void> => {
    const app: Express = express();

    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });

    app.use(express.json());

    try {
        await databaseConnection.checkConnection();
        console.log('Connection made to the DB');
    } catch (e) {
        console.error('Test connection failed', e);
    }

    app.get('/', (req: Request, res: Response) => {
        res.send({ data: 'Hello, World!' });
    });
};

main();
