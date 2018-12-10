import * as http from 'http';
import * as URL from 'url';
import * as persist from 'node-persist';

(async function init() {
    const p = await persist.init();

    const server = http.createServer(respond);
    server.listen(80);
})();

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
                    return response.end();
                } catch (e) {
                    response.statusCode = 400;
                    return response.end(err('malformed input', e));
                }
            case 'GET /temperatures':
                const temp = await persist.getItem('temperature');
                return response.end(JSON.stringify({ temperature: temp }));
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
