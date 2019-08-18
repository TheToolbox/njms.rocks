import * as http from 'http';
import * as URL from 'url';
import * as persist from 'node-persist';
import * as db from './db';

async function init() {
    const p = await persist.init();

    console.log('Starting API server...');
    const server = http.createServer(respond);
    server.listen(80);

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

async function respond(request: http.IncomingMessage, response: http.ServerResponse) {
    try {
        const method = (request.method || '').toUpperCase();
        const url = URL.parse(request.url || '');
        switch (method + ' ' + url.pathname) {
            case 'POST /temperatures':
                const body = await getBody(request);
                try {
                    const data = JSON.parse(body);
                    console.log("Got new temperature: " + data.temperature);
                    await persist.setItem('temperature', data.temperature);
                    await persist.setItem('time', Date.now());
                    await db.addTemp(Number(data.temperature));
                    return response.end();
                } catch (e) {
                    response.statusCode = 400;
                    return response.end(err('malformed input', e));
                }
            case 'GET /temperatures':
                const temp = await persist.getItem('temperature');
                const time = await persist.getItem('time');

                return response.end(JSON.stringify({ temperature: temp, time: time }));
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
