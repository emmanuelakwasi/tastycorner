import React, { useEffect, useState } from 'react';
import './WeatherEffects.css';

function WeatherEffects({ weatherData }) {
  const [weatherType, setWeatherType] = useState(null);
  const [intensity, setIntensity] = useState(1);

  useEffect(() => {
    if (!weatherData || !weatherData.summary) {
      setWeatherType(null);
      return;
    }

    const summary = weatherData.summary.toLowerCase();
    
    // Determine weather type
    if (summary.includes('sun') || summary.includes('clear')) {
      setWeatherType('sunny');
      setIntensity(1);
    } else if (summary.includes('rain') || summary.includes('drizzle')) {
      setWeatherType('rain');
      setIntensity(summary.includes('heavy') ? 2 : 1);
    } else if (summary.includes('snow')) {
      setWeatherType('snow');
      setIntensity(summary.includes('heavy') ? 2 : 1);
    } else if (summary.includes('cloud')) {
      setWeatherType('cloudy');
      setIntensity(1);
    } else if (summary.includes('fog') || summary.includes('mist')) {
      setWeatherType('foggy');
      setIntensity(1);
    } else {
      setWeatherType(null);
    }
  }, [weatherData]);

  if (!weatherType) {
    return null;
  }

  return (
    <div className={`WeatherEffects WeatherEffects-${weatherType} WeatherEffects-intensity-${intensity}`}>
      {weatherType === 'sunny' && <SunnyEffect />}
      {weatherType === 'rain' && <RainEffect intensity={intensity} />}
      {weatherType === 'snow' && <SnowEffect intensity={intensity} />}
      {weatherType === 'cloudy' && <CloudyEffect />}
      {weatherType === 'foggy' && <FoggyEffect />}
    </div>
  );
}

function SunnyEffect() {
  return (
    <>
      <div className="WeatherEffects-sun" />
      <div className="WeatherEffects-sun-rays" />
    </>
  );
}

function RainEffect({ intensity }) {
  const drops = Array.from({ length: intensity * 50 }, (_, i) => (
    <div
      key={i}
      className="WeatherEffects-rain-drop"
      style={{
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 2}s`,
        animationDuration: `${0.5 + Math.random() * 0.5}s`
      }}
    />
  ));

  return <>{drops}</>;
}

function SnowEffect({ intensity }) {
  const flakes = Array.from({ length: intensity * 30 }, (_, i) => (
    <div
      key={i}
      className="WeatherEffects-snow-flake"
      style={{
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 3}s`,
        animationDuration: `${2 + Math.random() * 2}s`
      }}
    >
      ❄
    </div>
  ));

  return <>{flakes}</>;
}

function CloudyEffect() {
  return (
    <>
      <div className="WeatherEffects-cloud WeatherEffects-cloud-1" />
      <div className="WeatherEffects-cloud WeatherEffects-cloud-2" />
      <div className="WeatherEffects-cloud WeatherEffects-cloud-3" />
    </>
  );
}

function FoggyEffect() {
  return (
    <>
      <div className="WeatherEffects-fog WeatherEffects-fog-1" />
      <div className="WeatherEffects-fog WeatherEffects-fog-2" />
      <div className="WeatherEffects-fog WeatherEffects-fog-3" />
    </>
  );
}

export default WeatherEffects;

