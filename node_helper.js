/* Magic Mirror Module: MMM-2Day-NOAA-Forecast helper
 * Version: 0.1.0
 *
 * By Jinserk Baik https://github.com/jinserk/
 * MIT Licensed.
 */

const url = require("url");
const NodeHelper = require("node_helper");
const date = require("date-fns");
const axios = require("axios");
const Log = require("logger");

module.exports = NodeHelper.create({
  start: function () {
    Log.log(`Starting node helper for: ${this.name}`);
  },

  getWeatherData: function (payload) {
    let _this = this;

    axios
      .get(payload)
      .then(function (response) {
        if (response.status === 200) {
          var forecast_url = response.data.properties.forecast;
          _this.getForecastData(payload, forecast_url);
        }
      })
      .catch(function (error) {
        Log.error(error);
      });
  },

  getForecastData: function (url1, url2) {
    let _this = this;
    let forecast = [];

    axios
      .get(url2)
      .then(function (response) {
        var data = response.data.properties.periods;
        if (response.status === 200 && data.length > 4) {
          forecast = _this.parseData(data);
          Log.info("Got forecast data from api.weather.gov");
        } else {
          Log.error("Got forecast data but something wrong");
          forecast = _this.fillEmptyData();
        }
      })
      .catch(function (error) {
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
        humid: element.relativeHumidity.value,
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
        humid: "--",
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
