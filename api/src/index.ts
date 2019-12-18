import * as http from 'http';
import * as URL from 'url';
import * as db from './db';
import * as NWS from './NWS';

async function init() {
    console.log('Starting API server...');
    const server = http.createServer(respond);
    server.listen(80);

    console.log('Starting weather logging...');
    setInterval(async () => {
        try {
            const location = { site: 'OKX', gridx: 26, gridy: 34 }; //newark near school
            const weather = await NWS.currentWeather(location);
            console.log(`Got current weather! Temp: ${weather.temp}`);
            await db.addTemp(weather.temp, 'outside', weather.tempUnit);
        } catch (err) {
            console.log(`Error in temp logging: ${err.message}`);
        }
    }, 1000 * 5); //every 30 minutes

    if (process.env['SIMULATE_SENSORS']) {

        console.log('DEV OPTION ENABLED: Simulating sensors...');
        let sim_temp = 70;
        setInterval(() => {
            const req = http.request({
                method: 'POST',
                host: 'localhost',
                path: '/temperatures',
            });
            req.end(JSON.stringify({
                temperature: sim_temp += Math.random() - 0.5
            }));
        }, 3000);
    }
}

init();//actually run init!

interface IncomingData {
    temperature: Array<number>,
    humidity: Array<number>,
    error_count: number,
    timestamp: Array<number>,
    location: string,
}

const state: { [index: string]: { temperature: number, humidity: number, timestamp: number } } = {};

function average(arr: Array<number>) {
    return arr.reduce((x, y) => x + y) / arr.length;
}

async function respond(request: http.IncomingMessage, response: http.ServerResponse) {
    try {
        const method = (request.method || '').toUpperCase();
        const url = URL.parse(request.url || '');
        switch (method + ' ' + url.pathname) {
            case 'POST /temperatures':
                const body = await getBody(request);
                try {
                    const data = JSON.parse(body) as IncomingData;
                    console.log("Got new data: " + body);
                    state[data.location] = {
                        temperature: average(data.temperature),
                        humidity: average(data.humidity),
                        timestamp: Math.round(average(data.timestamp)),
                    };
                    await db.addTemp(average(data.temperature), data.location, 'C'); //may want to dynamically get temperature unit in the future
                    return response.end();
                } catch (e) {
                    response.statusCode = 400;
                    return response.end(err('malformed input', e));
                }
            case 'GET /temperatures':
                return response.end(JSON.stringify(state));
        }
        console.log(method + ' ' + url.pathname);
        const body = await getBody(request);
        response.end(body);
    } catch (e) {
        response.end(err('Internal Server Error', e));
    }
}

async function getBody(request: http.IncomingMessage): Promise<string> {
    let data = '';
    request.on('data', d => data += d);
    return new Promise<string>(resolve => request.on('end', () => resolve(data)));
}

function err(info: string, context: Error) {
    return JSON.stringify({
        error: info,
        string: context,
    });
}
