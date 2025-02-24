import dotenv from 'dotenv';
dotenv.config();

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}
// TODO: Define a class for the Weather object
class Weather {
  city: string;
  date: string;
  icon: string;
  iconDescription: string;
  tempF: number;
  windSpeed: number;
  humidity: number;
  constructor(city: string, date: string, icon: string, iconDescription: string, tempF: number, windSpeed: number, humidity: number) {
    this.city = city;
    this.date = date;
    this.icon = icon;
    this.iconDescription = iconDescription;
    this.tempF = tempF;
    this.windSpeed = windSpeed;
    this.humidity = humidity;
  }
}

// TODO: Complete the WeatherService class
class WeatherService {
  // TODO: Define the baseURL, API key, and city name properties
  private baseURL: string;
  private apiKey: string;
  private city: string;

  constructor() {
    this.baseURL = process.env.API_BASE_URL || '';
    this.apiKey = process.env.API_KEY || '';
    this.city = '';
  }


  private async fetchLocationData(query: string): Promise<Coordinates> {
    const response = await fetch(query);
    const data = await response.json();
    return data;
  }

  private destructureLocationData(locationData: any): Coordinates {
    return {
      lat: locationData[0].lat,
      lon: locationData[0].lon
    };
  }

  private buildGeocodeQuery(): string {
    return `${this.baseURL}/geo/1.0/direct?q=${this.city}&limit=1&appid=${this.apiKey}`;
  }

  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}/data/2.5/forecast?units=imperial&lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}`;
  }

  private async fetchAndDestructureLocationData(): Promise<Coordinates> {
    const url = this.buildGeocodeQuery();
    const locationData = await this.fetchLocationData(url);
    return this.destructureLocationData(locationData);
  }

  private async fetchWeatherData(coordinates: Coordinates) {
    const url = this.buildWeatherQuery(coordinates);
    const response = await fetch(url);
    const data = await response.json();
    return data;
  }

  private parseCurrentWeather(response: any): Weather {
    const prefix = response.list[0];
    return new Weather(this.city, 
      prefix.dt_txt,
      prefix.weather.icon,
      prefix.weather.description,
      prefix.main.temp,
      prefix.wind.speed,
      prefix.main.humidity)
  }

  private buildForecastArray(currentWeather: Weather, weatherData: any[]): Weather[] { 
    const forecast: Weather[] = [];
    weatherData.forEach((value, index) => {
     if (index === 0) {
      forecast.push(currentWeather);
     } else {
      const weatherInstance = new Weather(
        this.city,
        value.dt_txt,
        value.weather.icon,
        value.weather.description,
        value.main.temp,
        value.wind.speed,
        value.main.humidity
      );
    forecast.push(weatherInstance);
     }
    }); 
    return forecast;
  }

  async getWeatherForCity(city: string) {
    this.city = city;
    let coordinates = await this.fetchAndDestructureLocationData();
    let weatherData = await this.fetchWeatherData(coordinates);
    let currentWeather = this.parseCurrentWeather(weatherData);
    let forecast = this.buildForecastArray(currentWeather, weatherData.list);
    return forecast;
  }
}

export default new WeatherService();
