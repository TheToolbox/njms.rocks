const sensor = require('node-dht-sensor').promises;
const https = require('https');

const DHT22 = 22; //setting to indicate which type of sensor we're using. 22 for a DHT22 sensor and 11 for a DHT11
const PIN = 4; //setting which pin on the pi the sensor's data line is connected to
const samples = {
    temperature: [],
    humidity: [],
    error_count: 0,
    timestamps: [],
    location: process.env['SENSOR_LOCATION'] || 'not_set', // what room we're in
};

sensor.initialize(DHT22, PIN);

function get_temps() {

    const { temperature, humidity, valid, errors } = sensor.readSync(DHT22, PIN); //for whatever reason, the promise-based version of this function doesn't work so we're doing it synchronously

    // keep count of any errors in case we want to track that later
    samples.error_count += errors;
    // if the data's invalid, we're done here
    if (!valid) { return; }
    // add temp, humidity, and the current time to our list of data
    samples.temperatures.push(temperature);
    samples.humidity.push(humidity);
    timestamps.push(Date.now());
}

function send_temps() {
    // do an HTTP POST to our API to send the data. Currently we're ignoring any errors (for simplicity)
    https.request('https://njms.rocks/api/temperatures', { method: 'POST' })
        .end(JSON.stringify(samples)); // send the stringified data as the last part of the request
}

setInterval(get_temps, 1000); // get temps every 1 second
setInterval(send_temps, 10000); // send temps every 10 seconds