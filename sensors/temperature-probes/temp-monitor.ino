/*
Temperature is read from: DS18S20, DS18B20, DS1822, DS2438
I/O setup:
These made it easy to just 'plug in' my 18B20
D3 - 1-wire ground, or just use regular pin and comment out below.
D4 - 1-wire signal, 2K-10K resistor to D5 (3v3)
D5 - 1-wire power, ditto ground comment.
A pull-up resistor is required on the signal line. The spec calls for a 4.7K.
I have used 1K-10K depending on the bus configuration and what I had out on the
bench. If you are powering the device, they all work. If you are using parasitic
power it gets more picky about the value.
*/

#include "DS18.h"
#include "HttpClient.h"

DS18 sensor(D0);

HttpClient http;
http_header_t headers[] = {
    {"Content-Type", "application/json"},
    {"Accept", "*/*"},
    {NULL, NULL} // NOTE: Always terminate headers with NULL
};
http_request_t request;
http_response_t response;

float temp = 22.0;
Timer get_temp_timer(1000, get_temp);
Timer send_data_timer(10000, send_data);

void setup()
{
  Serial.begin(9600);
  send_data();
  get_temp_timer.start();
  send_data_timer.start();
}

void loop() {}

void get_temp()
{
  sensor.read();
  //simple moving average over 30 seconds
  temp = (29.0 * temp + sensor.celsius()) / 30.0;
}

void send_data()
{
  request.hostname = "tribble.ga";//"njms.rocks";
  request.port = 80;
  request.path = "/api/temperatures";
  request.body = "{\"temperature\":\"" + String(temp) + "\"}";

  http.post(request, response, headers);
}
