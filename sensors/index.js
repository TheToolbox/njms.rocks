const sensor = require('node-dht-sensor').promises;
const https = require('https');

const DHT22 = 22; //setting to indicate which type of sensor we're using. 22 for a DHT22 sensor and 11 for a DHT11
const PIN = 4; //setting which pin on the pi the sensor's data line is connected to
const samples = {
    temperature: [],
    humidity: [],
    error_count: 0,
    timestamp: [],
    location: process.env['SENSOR_LOCATION'] || 'not_set', // what room we're in
};

sensor.initialize(DHT22, PIN);
sensor.setMaxRetries(3);

function get_temps() {

    const { temperature, humidity, isValid, errors } = sensor.readSync(DHT22, PIN); //for whatever reason, the promise-based version of this function doesn't work so we're doing it synchronously
    
    // keep count of any errors in case we want to track that later
    samples.error_count += errors;
    // if the data's invalid, we're done here
    if (!isValid) { return; }
    // add temp, humidity, and the current time to our list of data
    samples.temperature.push(temperature);
    samples.humidity.push(humidity);
    samples.timestamp.push(Date.now());
}

function send_temps() {
    // do an HTTP POST to our API to send the data. Currently we're ignoring any errors (for simplicity)
    https.request('https://njms.rocks/api/temperatures',
        { method: 'POST' },
        function(response) {
            if (response.statusCode === 200) {
                samples.error_count = 0;
                samples.humidity = [];
                samples.temperature = [];
                samples.timestamp = [];
            } else {
                console.error('Non-200 response from API');
            }
        })
        .on('error', err => console.error(err))
        .end(JSON.stringify(samples)); // send the stringified data as the last part of the request
}

function ruwireless() {//hack to keep running on RUWireless until proper management is available
    https.request('https://cisco-wlc.ruw.rutgers.edu/login.html', {
        method: 'POST',
    }).end('buttonClicked=4&redirect_url=https%3A%2F%2F1.1.1.1%2F&err_flag=0&password=RUGuestPass&username=RUGuestPass');
}

setInterval(get_temps, 5000); // get temps every 1 second
setInterval(send_temps, 20000); // send temps every 10 seconds
setInterval(ruwireless, 60000);
ruwireless();