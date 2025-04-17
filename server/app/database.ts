import { error } from 'console';
import 'dotenv/config';
import type {
    Connection,
    FieldPacket,
    ResultSetHeader,
    RowDataPacket,
} from 'mysql2/promise';
import mysql from 'mysql2/promise';

type QueryResult<T> = T extends RowDataPacket[] ? T : ResultSetHeader;

class DatabaseConnection {
    private connection: Connection | null;

    constructor() {
        this.connection = null;
        this.executeQuery = this.executeQuery.bind(this);
        this.getConnection = this.getConnection.bind(this);
        this.checkConnection = this.checkConnection.bind(this);
    }

    async getConnection(): Promise<void> {
        let connected: boolean = false;

        if (this.connection) {
            connected = await this.checkConnection();
        }

        if (!connected) {
            try {
                await this.connection?.end();
            } catch (e) {
                console.error(
                    'Having trouble closing the invalid connection...',
                    e,
                );
            }
        }

        this.connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            connectTimeout: 10000,
            waitForConnections: true,
        });
    }

    async checkConnection(): Promise<boolean> {
        if (!this.connection) {
            return false;
        }

        try {
            await this.connection.execute('SELECT 1');
            return true;
        } catch (e) {
            console.error('Failed to make a connection to the database:', e);
            return false;
        }
    }

    async executeQuery<T extends RowDataPacket[] | ResultSetHeader>(
        query: string,
        params: [] = [],
    ): Promise<QueryResult<T>> {
        try {
            await this.getConnection();

            if (!this.connection) {
                throw new Error('Failed to connect to the database.');
            }

            const [results]: [T, FieldPacket[]] =
                await this.connection.execute<T>(query, params);

            if (Array.isArray(results)) {
                return results.map((row) => ({ ...row })) as QueryResult<T>;
            }

            return results as QueryResult<T>;
        } catch (e) {
            console.error('Execution Failed: ', e);
            throw e;
        }
    }

    async closeConnection(): Promise<void> {
        if (this.connection) {
            try {
                await this.connection.end();
                this.connection = null;
            } catch (e) {
                console.error('Could not close the connection:', e);
                throw e;
            }
        }
    }
}

export const databaseConnection = new DatabaseConnection();
