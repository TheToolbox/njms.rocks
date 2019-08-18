import { promises as sensor } from 'node-dht-sensor';
import * as https from 'https';

function post(url, data) {
    return new Promise((res, rej) => {
        https.request(url, { method: 'POST' }, response => {
            if (res.statusCode === 200) {
                res();
            } else {
                rej(`Server responded with code ${res.statusCode}`);
            }
        }).end(data);
    });
}

const location = process.env['SENSOR_LOCATION'] || 'not_set';

const DHT22 = 22;//setting to indicate which type of sensor we're using. It's


async function loop() {
    try {

        const { temperature, humidity } = await sensor.read(DHT22, 4);

        const data = {
            temperature: temperature.toFixed(2),
            humidity: humidity.toFixed(2),
            time: Date.now().toString(),
            location,
        };

        await post('https://njms.rocks/api/temperatures', JSON.stringify(data));

    } catch (err) {
        console.error('Failed to read sensor data:', err);
    }
}

setInterval(loop, 1000);