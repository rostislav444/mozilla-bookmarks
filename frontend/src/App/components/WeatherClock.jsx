import React, { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudDrizzle, Cloudy, Moon } from 'lucide-react';

const CACHE_KEY = 'weatherData';
const CACHE_EXPIRY_KEY = 'weatherDataExpiry';

const WeatherClockWidget = () => {
  const [time, setTime] = useState(new Date());
  const [weather, setWeather] = useState(() => {
    // Инициализируем состояние сразу из кеша при создании компонента
    const cachedData = localStorage.getItem(CACHE_KEY);
    return cachedData ? JSON.parse(cachedData) : {
      temp: null,
      condition: 'clear',
      isDay: true
    };
  });
  const [error, setError] = useState(null);

  const shouldUpdateWeather = () => {
    const now = new Date();
    const cachedExpiry = localStorage.getItem(CACHE_EXPIRY_KEY);

    if (!cachedExpiry) {
      console.log('Нет данных о времени обновления, нужно обновить');
      return true;
    }

    const expiryDate = new Date(cachedExpiry);
    const shouldUpdate = now >= expiryDate;
    console.log(shouldUpdate ? 'Кеш устарел, нужно обновить' : 'Кеш актуален');
    return shouldUpdate;
  };

  const setNextUpdateTime = () => {
    const now = new Date();
    const nextUpdate = new Date(now);
    nextUpdate.setHours(now.getHours() + 1, 0, 0, 0);
    localStorage.setItem(CACHE_EXPIRY_KEY, nextUpdate.toISOString());
    console.log('Следующее обновление в:', nextUpdate.toLocaleTimeString());
  };

  const fetchWeather = async (force = false) => {
    try {
      // Проверяем необходимость обновления, если это не принудительное обновление
      if (!force && !shouldUpdateWeather()) {
        console.log('Используем кешированные данные');
        return;
      }

      console.log('Загружаем свежие данные о погоде');
      const lat = 50.45;
      const lon = 30.52;

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,is_day`
      );

      if (!response.ok) {
        throw new Error('Weather data fetch failed');
      }

      const data = await response.json();

      const getCondition = (code, isDay) => {
        if (code === 0) return isDay ? 'clear' : 'night';
        if (code === 1 || code === 2 || code === 3) return 'clouds';
        if (code >= 51 && code <= 57) return 'drizzle';
        if (code >= 61 && code <= 65) return 'rain';
        if (code >= 71 && code <= 77) return 'snow';
        if (code >= 80 && code <= 82) return 'rain';
        if (code >= 95 && code <= 99) return 'thunderstorm';
        return 'clouds';
      };

      const weatherData = {
        temp: Math.round(data.current.temperature_2m),
        condition: getCondition(data.current.weathercode, data.current.is_day),
        isDay: data.current.is_day === 1
      };

      localStorage.setItem(CACHE_KEY, JSON.stringify(weatherData));
      setNextUpdateTime();

      setWeather(weatherData);
      setError(null);
      console.log('Данные о погоде обновлены');
    } catch (err) {
      setError('Failed to load weather');
      console.error('Weather fetch error:', err);
    }
  };

  // Эффект для обновления времени и проверки необходимости обновления погоды
  useEffect(() => {
    const timer = setInterval(() => {
      const newTime = new Date();
      setTime(newTime);

      // Обновляем погоду каждый час в 00 минут
      if (newTime.getMinutes() === 0 && newTime.getSeconds() === 0) {
        console.log('Наступил новый час, обновляем погоду');
        fetchWeather(true);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Эффект для первоначальной загрузки погоды
  useEffect(() => {
    if (shouldUpdateWeather()) {
      fetchWeather();
    }
  }, []);

  const getWeatherIcon = (condition) => {
    const icons = {
      clear: <Sun className="text-yellow-500 w-10 h-10" />,
      night: <Moon className="text-gray-300 w-10 h-10" />,
      clouds: <Cloud className="text-gray-500 w-10 h-10" />,
      rain: <CloudRain className="text-blue-500 w-10 h-10" />,
      snow: <CloudSnow className="text-blue-300 w-10 h-10" />,
      thunderstorm: <CloudLightning className="text-purple-500 w-10 h-10" />,
      drizzle: <CloudDrizzle className="text-blue-400 w-10 h-10" />,
      mist: <Cloudy className="text-gray-400 w-10 h-10" />,
      fog: <Cloudy className="text-gray-400 w-10 h-10" />
    };
    return icons[condition] || icons.clear;
  };

  const getShortDayOfWeek = (date) => {
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    return days[date.getDay()];
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long'
    });
  };

  return (
    <div>
      <div className="flex justify-start align-middle">
        <div className="flex flex-col">
          <span className="text-base font-medium text-text1">
            {time.toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </span>
          <span className="text-xs text-text1">
            {getShortDayOfWeek(time)}, {formatDate(time)}
          </span>
        </div>
        <div className="flex ml-6 items-center space-x-1 text-sm">
          {error ? (
            <span className="text-red-400 text-xs">!</span>
          ) : (
            <>
              {getWeatherIcon(weather.condition)}
              <span className='pl-2 text-text1'>{weather.temp !== null ? `${weather.temp}°C` : '--°C'}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherClockWidget;