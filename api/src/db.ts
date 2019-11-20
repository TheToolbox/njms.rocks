import * as pg from 'pg';

const pool = new pg.Pool();

//set up schema
const schema = [
    `CREATE TABLE IF NOT EXISTS temperatures (
        timestamp bigint,
        temperature numeric,
        PRIMARY KEY(timestamp)
    );`,
    `ALTER TABLE temperatures
        ADD COLUMN location TEXT,
        ADD COLUMN unit CHARACTER;`,
    ];

export async function addTemp(temperature: number, location: string, unit: string) {
    await ready();
    await pool.query('INSERT INTO temperatures(timestamp, temperature, location, unit) VALUES($1, $2, $3, $4)',
        [Date.now(), temperature, location, unit]);
}

export async function getTemp() {
    await ready();
}

let _ready = false;
async function ready() {
    if (!_ready) {
        await runMigrations();
        _ready = true;
    }
}

async function runMigrations() {
    //ensure version table exists
    await pool.query(`
        CREATE TABLE IF NOT EXISTS _schema_versions (
            version integer,
            PRIMARY KEY (version)
        );`);
    //what version are we on?
    const { rows: version_list } = await pool.query('SELECT * FROM _schema_versions');
    const version = Math.max(0, ...version_list.map(row => row.version));

    const client = await pool.connect(); //acquire pool connection for transation
    if (version >= schema.length) {
        return; //we're done if there are no migrations to run
    }
    try {
        //apply any schema changes as a transaction that haven't been completed
        await client.query('BEGIN');
        for (let i = version; i < schema.length; i++) {
            console.log(`Running Migration ${i}...`);
            await client.query(schema[i]);
        }
        await client.query('INSERT INTO _schema_versions(version) VALUES($1)', [schema.length]);
        await client.query('COMMIT');
        console.log('Migrations complete!');
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}
