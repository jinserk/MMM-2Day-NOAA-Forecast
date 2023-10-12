# MMM-2Day-NOAA-Forecast

This is a module for the [MagicMirror](https://github.com/MichMich/MagicMirror/tree/develop).
This module shows a 2-day forecast (today and tomorrow) using the [NOAA National Weather Service](https://www.weather.gov/)
At the first place I've tried to use [OpenWeather One Call 3.0 API](https://openweathermap.org/api/one-call-3),
but it shows quite inaccurate forecast result.
There already exists a project called [MMM-NOAA](https://github.com/cowboysdude/MMM-NOAA),
but this uses not NOAA API but [WeatherBit API](https://www.weatherbit.io/api/weather-forecast-api).

I just wanted an reliable weather forecast that will not be changed or discontinued.
I believe NOAA National Weather Service is the best one with no user registration required (They look being preparing some change for this).

## Screenshot

![image](https://github.com/jinserk/MMM-2Day-NOAA-Forecast/assets/823222/af64c0fc-dacb-479e-ae48-5703ce955de9)

![image](https://github.com/jinserk/MMM-2Day-NOAA-Forecast/assets/823222/d39e42ed-4a63-4008-9487-44f4a64eeac7)

## Installation

### Install `MMM-2Day-NOAA-Forecast`
Under your MagicMirror's `modules` folder, do:
```
cd <your-magic-mirror-path>/modules
git clone https://github.com/jinserk/MMM-2Day-NOAA-Forecast
cd MMM-2Day-NOAA-Forecast
```
### Install node dependenties
```
npm install
```

## Config
The entry in `config.js` can include the following options:

|Option|Description|Type|Default Value|
|---|---|---|---|
|`lat`|This is the latitude of the location you want to get the weather for.|`number`|`0.0`|
|`lon`|This is the longitude of the location you want to get the weather for.|`number`|`0.0`|
|`units`|The units you want the weather reporting in. Use `metric` for metric OR otherwise for imperial.|`string`|`metric`|
|`interval`|How often the weather is updated in millisecond.|`integer`|`600000 == 10 min`|

### An example of `config.js`
```javascript
{
    module:     'MMM-2Day-NOAA-Forecast',
    position:   'top_right',
	config: {
		lat:        42.36114,
		lon:        -71.05908,
		units:      'metric',
		interval:   10 * 60 * 1000
	}
},
```


