
'use client'; 

import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';


interface DailyWeatherData {
  time: string[]; // Dates in 'YYYY-MM-DD' format
  temperature_2m_max: number[]; // Max daily temperature
  temperature_2m_min: number[]; // Min daily temperature
  precipitation_sum: number[]; // Sum of daily precipitation
}

interface WeatherApiResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  daily_units: {
    time: string;
    temperature_2m_max: string;
    temperature_2m_min: string;
    precipitation_sum: string;
  };
  daily: DailyWeatherData;
}

interface ChartDataPoint {
  date: string;
  minTemp: number;
  maxTemp: number;
  precipitation: number;
}

// These utility functions help with date formatting and validation.

const formatChartDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const isValidDateRange = (startDate: string, endDate: string): boolean => {
  return new Date(startDate) <= new Date(endDate);
};

const getTodayDateString = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const getDateStringDaysAgo = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};


// This custom hook encapsulates the data fetching logic.

interface UseWeatherDataResult {
  data: ChartDataPoint[] | null;
  loading: boolean;
  error: string | null;
  fetchData: (latitude: number, longitude: number, startDate: string, endDate: string) => void;
}

const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

const transformWeatherData = (apiData: WeatherApiResponse): ChartDataPoint[] => {
  const { daily } = apiData;
  const transformed: ChartDataPoint[] = [];

  for (let i = 0; i < daily.time.length; i++) {
    transformed.push({
      date: daily.time[i],
      minTemp: daily.temperature_2m_min[i],
      maxTemp: daily.temperature_2m_max[i],
      precipitation: daily.precipitation_sum[i],
    });
  }
  return transformed;
};

const useWeatherData = (): UseWeatherDataResult => {
  const [data, setData] = useState<ChartDataPoint[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (
    latitude: number,
    longitude: number,
    startDate: string,
    endDate: string
  ) => {
    setLoading(true);
    setError(null);
    setData(null); // Clear previous data when fetching new
    try {
      const apiUrl = `${OPEN_METEO_BASE_URL}?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&start_date=${startDate}&end_date=${endDate}`;
      
      const response = await fetch(apiUrl);

      if (!response.ok) {
        let errorMsg = `Failed to fetch weather data: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData && errorData.reason) {
            errorMsg = `API Error: ${errorData.reason}`;
          }
        } catch (parseError) {
          // If JSON parsing fails, use the default error message
        }
        throw new Error(errorMsg);
      }

      const apiResponse: WeatherApiResponse = await response.json();
      const transformedData = transformWeatherData(apiResponse);
      setData(transformedData);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchData };
};


// This component provides the date input fields and apply button.

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onApply: () => void;
  errorMessage: string | null;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onApply,
  errorMessage,
}) => {
  const today = getTodayDateString();
  const maxDate = today;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4 border border-gray-200">
      <div className="flex flex-col w-full md:w-auto">
        <label htmlFor="startDate" className="text-sm font-medium text-gray-700 mb-1">
          Start Date:
        </label>
        <input
          type="date"
          id="startDate"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          max={maxDate}
          className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full transition-all duration-200"
        />
      </div>
      <div className="flex flex-col w-full md:w-auto">
        <label htmlFor="endDate" className="text-sm font-medium text-gray-700 mb-1">
          End Date:
        </label>
        <input
          type="date"
          id="endDate"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          max={maxDate}
          className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full transition-all duration-200"
        />
      </div>
      <button
        onClick={onApply}
        disabled={!isValidDateRange(startDate, endDate)}
        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto mt-4 md:mt-0 transform hover:scale-105"
      >
        Apply Filter
      </button>
      {errorMessage && (
        <p className="text-red-600 text-sm mt-2 md:mt-0 md:ml-4 font-medium">{errorMessage}</p>
      )}
    </div>
  );
};


interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  loading: boolean;
  error: string | null;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children, loading, error }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-center min-h-[380px] border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">{title}</h2>
      {loading ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-600">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
          <p className="text-lg">Loading data...</p>
        </div>
      ) : error ? (
        <div className="text-red-600 text-center p-6 border border-red-300 bg-red-50 rounded-lg max-w-sm mx-auto">
          <p className="font-bold text-lg mb-2">Error:</p>
          <p>{error}</p>
          <p className="text-sm mt-2">Please try again or adjust the date range.</p>
        </div>
      ) : (
        <div className="w-full h-[300px]">{children}</div>
      )}
    </div>
  );
};


// This component renders the temperature line chart using Recharts.

interface TemperatureLineChartProps {
  data: ChartDataPoint[];
}

const TemperatureLineChart: React.FC<TemperatureLineChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="date" tickFormatter={formatChartDate} />
        <YAxis label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft', fill: '#4A5568' }} />
        <Tooltip
          formatter={(value: number, name: string) => [`${value}°C`, name === 'maxTemp' ? 'Max Temp' : 'Min Temp']}
          labelFormatter={(label: string) => `Date: ${formatChartDate(label)}`}
          contentStyle={{ backgroundColor: '#2D3748', border: 'none', borderRadius: '8px', color: '#FFFFFF', padding: '10px' }}
          labelStyle={{ color: '#E2E8F0', fontWeight: 'bold' }}
          itemStyle={{ color: '#FFFFFF' }}
        />
        <Legend wrapperStyle={{ paddingTop: '15px' }} iconType="circle" />
        <Line type="monotone" dataKey="maxTemp" stroke="#E53E3E" strokeWidth={2} activeDot={{ r: 6, fill: '#E53E3E', stroke: '#FFFFFF', strokeWidth: 2 }} name="Max Temp" />
        <Line type="monotone" dataKey="minTemp" stroke="#4299E1" strokeWidth={2} activeDot={{ r: 6, fill: '#4299E1', stroke: '#FFFFFF', strokeWidth: 2 }} name="Min Temp" />
      </LineChart>
    </ResponsiveContainer>
  );
};


// This component renders the precipitation bar chart using Recharts.

interface PrecipitationBarChartProps {
  data: ChartDataPoint[];
}

const PrecipitationBarChart: React.FC<PrecipitationBarChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="date" tickFormatter={formatChartDate} />
        <YAxis label={{ value: 'Precipitation (mm)', angle: -90, position: 'insideLeft', fill: '#4A5568' }} />
        <Tooltip
          formatter={(value: number) => [`${value} mm`, 'Precipitation']}
          labelFormatter={(label: string) => `Date: ${formatChartDate(label)}`}
          contentStyle={{ backgroundColor: '#2D3748', border: 'none', borderRadius: '8px', color: '#FFFFFF', padding: '10px' }}
          labelStyle={{ color: '#E2E8F0', fontWeight: 'bold' }}
          itemStyle={{ color: '#FFFFFF' }}
        />
        <Legend wrapperStyle={{ paddingTop: '15px' }} iconType="circle" />
        <Bar dataKey="precipitation" fill="#48BB78" name="Daily Precipitation" radius={[10, 10, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};


const App: React.FC = () => {
  // Default to a 7-day range ending today
  const defaultEndDate = getTodayDateString();
  const defaultStartDate = getDateStringDaysAgo(6); // 7 days including today

  const [startDate, setStartDate] = useState<string>(defaultStartDate);
  const [endDate, setEndDate] = useState<string>(defaultEndDate);
  const [dateRangeError, setDateRangeError] = useState<string | null>(null);

  // Coordinates for Abuja, Nigeria (can be changed by the user or dynamically)
  const ABUJA_LATITUDE = 9.0765;
  const ABUJA_LONGITUDE = 7.3986;

  // Use the custom hook to manage weather data fetching
  const { data, loading, error, fetchData } = useWeatherData();


  const handleApplyFilter = useCallback(() => {
    if (!isValidDateRange(startDate, endDate)) {
      setDateRangeError('Start date cannot be after end date.');
      return;
    }
    setDateRangeError(null); // Clear any previous error
    fetchData(ABUJA_LATITUDE, ABUJA_LONGITUDE, startDate, endDate);
  }, [startDate, endDate, fetchData]); // Re-run only if these dependencies change

  // Fetch initial data on component mount
  useEffect(() => {
    handleApplyFilter();
  }, [handleApplyFilter]); // Ensures initial data fetch when component mounts

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50 font-sans text-gray-900">
      {/* Dashboard Header */}
      <header className="mb-10 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-3 leading-tight">
          Weather Insights Dashboard
        </h1>
        <p className="text-xl text-gray-600 font-medium">
          Historical daily weather for Abuja, Nigeria
        </p>
        <p className="text-md text-gray-500 mt-1">
          Explore temperature and precipitation trends over your selected period.
        </p>
      </header>

      {/* Date Range Selection Section */}
      <section className="mb-10 max-w-5xl mx-auto px-2">
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onApply={handleApplyFilter}
          errorMessage={dateRangeError}
        />
      </section>

      {/* Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto px-2">
        {/* Temperature Line Chart Card */}
        <ChartCard title="Daily Temperature Trend" loading={loading} error={error}>
          {data && <TemperatureLineChart data={data} />}
        </ChartCard>

        {/* Precipitation Bar Chart Card */}
        <ChartCard title="Daily Precipitation" loading={loading} error={error}>
          {data && <PrecipitationBarChart data={data} />}
        </ChartCard>
      </section>

      {/* Dashboard Footer */}
      <footer className="text-center text-sm text-gray-500 mt-16 p-4 border-t border-gray-200">
        <p>Data provided by Open-Meteo API. Designed with Next.js, TypeScript, Recharts, and Tailwind CSS.</p>
        <p className="mt-1">&copy; {new Date().getFullYear()} victor. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App; 
