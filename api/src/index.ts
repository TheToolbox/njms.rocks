import * as http from 'http';
import * as URL from 'url';

const server = http.createServer(respond);
server.listen(80);

function respond(request: http.IncomingMessage, response: http.ServerResponse) {
    const method = (request.method || '').toLowerCase();
    const url = URL.parse(request.url || '');
    switch(method + ' ' + url.pathname) {
        case 'POST /api/temperatures':
            //add to list;
        case 'GET /api/temperatures':
            //get from list
    }

    response.end('{"error": "Not yet implemented."}');
}