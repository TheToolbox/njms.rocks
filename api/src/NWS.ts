import * as https from 'https';

function get(host: string, path: string): Promise<string> {
    const options: https.RequestOptions = {
        path: path,
        hostname: host,
        headers: {
            'User-Agent': 'curl/9.99.0', //they have a blacklist on... whatever node's default UA is?
        },
    }

    return new Promise(resolve => {
        https.get(options, response => {
            let data = '';
            response.on('data', d => data += d);
            response.on('end', () => resolve(data));
        }).end();
    });
}

interface NWSLocation {
    site: string,
    gridx: number,
    gridy: number,
}
interface Weather {
    temp: number,
    tempUnit: string,
    tempTrend: string,
    timestamp: number,
    windSpeed: string,
    windDirection: string,
}
export async function currentWeather(location: NWSLocation): Promise<Weather> {// may throw
    const path = `/gridpoints/${location.site}/${location.gridx},${location.gridy}/forecast`;
    const response = await get('api.weather.gov', path);
    const data = JSON.parse(response).properties;
    const current = data.periods[0];
    return {
        temp: current.temperature,
        timestamp: Date.now(),
        tempUnit: current.temperatureUnit,
        tempTrend: current.temperatureTrend,
        windSpeed: current.windSpeed,
        windDirection: current.windDirection,
    };
}