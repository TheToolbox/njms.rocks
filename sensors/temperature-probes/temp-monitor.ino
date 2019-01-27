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

SerialLogHandler logHandler;
DS18 sensor(D0);

HttpClient http;
http_header_t headers[] = {
    {"Content-Type", "application/json"},
    {"Accept", "*/*"},
    {NULL, NULL} // NOTE: Always terminate headers with NULL
};
http_request_t request;
http_response_t response;

float temp = 0.0;

void setup()
{
  Serial.begin(9600);
  Log("Timers started!");
}

int data_time = millis();
int sensor_time = millis();
int reset_time = millis();
void loop()
{
  if (millis() - sensor_time > 250)
  {
    get_data();
    sensor_time = millis();
  }
  if (millis() - data_time > 10000)
  {
    send_data();
    data_time = millis();
  }
  if (millis() - reset_time > 1000 * 60 * 61 * 24) {
    System.reset();
  }
}

void get_data()
{
  if (sensor.read())
  {
    Log("Temperature read");
    float reading = sensor.fahrenheit();
    if (temp < 0.1 && temp > -0.1)
    {
      temp = reading;
    }
    else
    {
      //simple moving average over last 5 values
      temp = (4.0 * temp + sensor.fahrenheit()) / 5.0;
    }
  }
  else
  {
    if (sensor.searchDone())
    {
      Log("Search Done, sleeping for a moment.");
    }
  }
}

void send_data()
{
  Log("Sending data...");
  char body[40];

  snprintf(body, 40, "{\"temperature\":\"%2.2f\"}", temp);
  Log(body);

  request.hostname = "tribble.ga"; //"njms.rocks";
  request.port = 80;
  request.path = "/api/temperatures";
  request.body = body;
  Log("About to send data!");
  http.post(request, response, headers);
  Log("data sent!");
}
