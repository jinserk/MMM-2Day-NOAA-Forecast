/* MagicMirror² Module: MMM-2Day-NOAA-Forecast helper
 * Version: 0.2.0
 *
 * By Jinserk Baik https://github.com/jinserk/
 * MIT Licensed.
 */

const url = require("url");
const NodeHelper = require("node_helper");
const Log = require("logger");

module.exports = NodeHelper.create({
  start: function () {
    Log.log(`Starting node helper for: ${this.name}`);
  },

  getWeatherData: function (payload) {
    let _this = this;

    fetch(payload)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const forecastUrl = data.properties.forecast;
        _this.getForecastData(payload, forecastUrl);
      })
      .catch(function (error) {
        Log.error(error);
      });
  },

  getForecastData: function (url1, url2) {
    let _this = this;
    let forecast = [];

    fetch(url2)
      .then(async (response) => {
        if (response.status === 200) {
          const data = await response.json();
          const periods = data.properties.periods;

          if (periods.length > 4) {
            forecast = _this.parseData(periods);
            Log.info("Got forecast data from api.weather.gov");
          } else {
            Log.error("Got forecast data but something wrong");
            forecast = _this.fillEmptyData();
          }
        } else {
          Log.error("Error fetching forecast data:", response.status);
          forecast = _this.fillEmptyData();
        }
      })
      .catch(function (error) {
        Log.error("Error fetching forecast data:", error);
        forecast = _this.fillEmptyData();
      })
      .finally(function () {
        //Log.info(forecast);
        _this.sendSocketNotification("GOT-2DAY-NOAA-FORECAST", {
          url: url1,
          forecast: forecast
        });
      });
  },

  parseData: function (data) {
    let forecast = [];

    data.slice(0, 4).forEach((element, i) => {
      forecast.push({
        name: element.name,
        date: element.startTime,
        isDay: element.isDaytime,
        icon: this.parseIcon(element.icon),
        conditions: element.shortForecast,
        temp: element.temperature,
        pop: element.probabilityOfPrecipitation.value
          ? element.probabilityOfPrecipitation.value
          : 0,
        // Removed per https://www.weather.gov/media/notification/pdf_2023_24/scn24-55_api_v1.13.pdf 
        // humid: element.relativeHumidity.value,
        wspd: element.windSpeed
          .replace("to ", "")
          .split(" ")
          .slice(0, -1)
          .map(Number),
        wdir: element.windDirection
      });
    });

    return forecast;
  },

  parseIcon: function (icon_url) {
    let data = url.parse(icon_url).pathname.split("/").slice(4);

    if (data.length === 1) {
      let d0 = data[0].split(",");
      return d0.length === 2 ? d0[0] : data[0];
    } else {
      let d0 = data[0].split(",");
      let d1 = data[1].split(",");
      if (d0.length === 2) {
        return parseInt(d0[1], 10) > 50 ? d0[0] : d1[0];
      } else if (d1.length === 2) {
        return parseInt(d1[1], 10) > 50 ? d1[0] : d0[0];
      } else {
        // no pop, so choose the first
        return d0[0];
      }
    }
  },

  fillEmptyData: function () {
    let forecast = [];

    for (let i = 0; i < 4; i++) {
      forecast.push({
        name: "--",
        date: "--",
        isDay: "--",
        icon: ["not_available"],
        conditions: "No weather data",
        temp: "--",
        pop: "--",
        // Removed per https://www.weather.gov/media/notification/pdf_2023_24/scn24-55_api_v1.13.pdf 
        // humid: "--",
        wspd: ["--"],
        wdir: "--"
      });
    }

    return forecast;
  },

  socketNotificationReceived: function (notification, payload) {
    // Check this is for us and if it is let's get the weather data
    if (notification === "GET-2DAY-NOAA-FORECAST") {
      this.getWeatherData(payload);
    }
  }
});
