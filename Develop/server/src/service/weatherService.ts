import dotenv from 'dotenv';
dotenv.config();

interface Coordinates {
  lat: number;
  lon: number;
}

class Weather {
  temperature: number;
  humidity: number;
  description: string;
  windSpeed: number;

  constructor(temperature: number, humidity: number, description: string, windSpeed: number) {
    this.temperature = temperature;
    this.humidity = humidity;
    this.description = description;
    this.windSpeed = windSpeed;
  }
}

class WeatherService {
  private baseURL = process.env.BASE_URL;
  private apiKey = process.env.API_KEY;

  private async fetchLocationData(query: string): Promise<Coordinates> {
    const url = `http://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${this.apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    return this.destructureLocationData(data);
  }

  private destructureLocationData(locationData: any): Coordinates {
    const { coord: { lat, lon } } = locationData;
    return { lat, lon };
  }

  private buildWeatherQuery(coordinates: Coordinates): string {
    return `lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}`;
  }

  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    const weatherQuery = this.buildWeatherQuery(coordinates);
    const url = `${this.baseURL}?${weatherQuery}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
  }

  private buildForecastArray(weatherData: any[]): Weather[] {
    const forecastArray: Weather[] = weatherData.map((data: any) => {
      const { main, weather, wind } = data;
      const { temp, humidity } = main;
      const { description } = weather[0];
      const { speed: windSpeed } = wind;
      return new Weather(temp, humidity, description, windSpeed);
    });
    return forecastArray;
  }

  public async getWeatherForCity(city: string): Promise<Weather[]> {
    const coordinates = await this.fetchLocationData(city);
    const weatherData = await this.fetchWeatherData(coordinates);
    const forecastArray = this.buildForecastArray(weatherData.list);
    return forecastArray;
  }
}

export default new WeatherService();
