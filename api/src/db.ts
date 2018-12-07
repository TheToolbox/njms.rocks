import * as pg from 'pg';

const pool = new pg.Pool();

pool.connect();

//set up schema
const schema = `
    CREATE TABLE IF NOT EXISTS temperatures 
        COLUMN ID 
        COLUMN TIMESTAMP
        COLUMN CELSIUS;
`;


export function query() {}