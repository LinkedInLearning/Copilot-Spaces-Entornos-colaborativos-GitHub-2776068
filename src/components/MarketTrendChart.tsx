import React, { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MarketTrendChart = () => {
  const [trendData, setTrendData] = useState<any>({});
  const [selectedMarkets, setSelectedMarkets] = useState(['US', 'EU', 'CN']);
  const [timeframe, setTimeframe] = useState('6m');
  const [metric, setMetric] = useState('tradeVolume');
  const [loading, setLoading] = useState(false);

  const markets = [
    { id: 'US', name: 'Estados Unidos', color: '#0d6efd' },
    { id: 'EU', name: 'Unión Europea', color: '#6f42c1' },
    { id: 'CN', name: 'China', color: '#dc3545' },
    { id: 'JP', name: 'Japón', color: '#fd7e14' },
    { id: 'BR', name: 'Brasil', color: '#198754' }
  ];

  const timeframes = [
    { value: '1m', label: '1 Mes' },
    { value: '3m', label: '3 Meses' },
    { value: '6m', label: '6 Meses' },
    { value: '1y', label: '1 Año' },
    { value: '2y', label: '2 Años' }
  ];

  const metrics = [
    { value: 'tradeVolume', label: 'Volumen de Comercio' },
    { value: 'priceIndex', label: 'Índice de Precios' },
    { value: 'tariffRates', label: 'Tasas Arancelarias' },
    { value: 'demandIndex', label: 'Índice de Demanda' }
  ];

  const generateTrendData = () => {
    setLoading(true);
    
    setTimeout(() => {
      const periods = timeframe === '1m' ? 30 : 
                     timeframe === '3m' ? 90 :
                     timeframe === '6m' ? 180 :
                     timeframe === '1y' ? 365 : 730;

      const labels = [];
      const datasets = [];

      // Generate date labels
      for (let i = periods; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('es-ES', { 
          month: 'short', 
          day: 'numeric',
          ...(timeframe === '1y' || timeframe === '2y' ? { year: '2-digit' } : {})
        }));
      }

      // Generate data for each selected market
      selectedMarkets.forEach(marketId => {
        const market = markets.find(m => m.id === marketId);
        if (!market) return;

        const data = [];
        let baseValue = getBaseValue(marketId, metric);
        
        for (let i = 0; i <= periods; i++) {
          // Simulate realistic market trends
          const seasonality = Math.sin((i / periods) * 2 * Math.PI) * 0.1;
          const randomWalk = (Math.random() - 0.5) * 0.05;
          const trend = getTrendDirection(marketId, metric) * (i / periods) * 0.2;
          
          const value = baseValue * (1 + seasonality + randomWalk + trend);
          data.push(Math.max(0, Math.round(value * 100) / 100));
        }

        datasets.push({
          label: market.name,
          data: data,
          borderColor: market.color,
          backgroundColor: market.color + '20',
          fill: false,
          tension: 0.1,
          pointRadius: periods > 365 ? 0 : 2,
          pointHoverRadius: 5
        });
      });

      setTrendData({
        labels: labels,
        datasets: datasets
      });
      setLoading(false);
    }, 800);
  };

  const getBaseValue = (marketId, metric) => {
    const baseValues = {
      tradeVolume: { US: 4200, EU: 3800, CN: 5600, JP: 1200, BR: 280 },
      priceIndex: { US: 100, EU: 105, CN: 95, JP: 110, BR: 85 },
      tariffRates: { US: 7.4, EU: 5.1, CN: 9.8, JP: 4.3, BR: 13.5 },
      demandIndex: { US: 100, EU: 95, CN: 120, JP: 90, BR: 85 }
    };
    return baseValues[metric][marketId] || 100;
  };

  const getTrendDirection = (marketId, metric) => {
    // Simulate different trend directions for realism
    const trends = {
      tradeVolume: { US: 0.1, EU: 0.05, CN: 0.15, JP: -0.02, BR: 0.08 },
      priceIndex: { US: 0.02, EU: 0.03, CN: 0.05, JP: 0.01, BR: 0.04 },
      tariffRates: { US: -0.01, EU: 0.01, CN: -0.02, JP: 0.005, BR: 0.02 },
      demandIndex: { US: 0.03, EU: 0.02, CN: 0.08, JP: -0.01, BR: 0.05 }
    };
    return trends[metric][marketId] || 0;
  };

  const toggleMarket = (marketId) => {
    setSelectedMarkets(prev => 
      prev.includes(marketId) 
        ? prev.filter(id => id !== marketId)
        : [...prev, marketId]
    );
  };

  useEffect(() => {
    generateTrendData();
  }, [selectedMarkets, timeframe, metric]);

  const getYAxisLabel = () => {
    switch (metric) {
      case 'tradeVolume': return 'Volumen (Millones USD)';
      case 'priceIndex': return 'Índice (Base 100)';
      case 'tariffRates': return 'Tasa (%)';
      case 'demandIndex': return 'Índice (Base 100)';
      default: return 'Valor';
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Tendencias de ${metrics.find(m => m.value === metric)?.label || 'Mercado'}`,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Fecha'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: getYAxisLabel()
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    }
  };

  const getInsights = () => {
    if (!trendData.datasets || trendData.datasets.length === 0) return [];

    const insights = [];
    
    trendData.datasets.forEach(dataset => {
      const data = dataset.data;
      const firstValue = data[0];
      const lastValue = data[data.length - 1];
      const change = ((lastValue - firstValue) / firstValue) * 100;
      
      insights.push({
        market: dataset.label,
        change: change,
        direction: change > 0 ? 'up' : 'down',
        color: dataset.borderColor
      });
    });

    return insights.sort((a, b) => b.change - a.change);
  };

  return (
    <div className="market-trend-chart">
      <div className="row mb-3">
        <div className="col-md-4">
          <select 
            className="form-select"
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
          >
            {metrics.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <select 
            className="form-select"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
          >
            {timeframes.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <button 
            className="btn btn-outline-primary"
            onClick={generateTrendData}
            disabled={loading}
          >
            <i className="fas fa-sync-alt me-1"></i>
            Actualizar
          </button>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">Seleccionar Mercados</h6>
            </div>
            <div className="card-body">
              <div className="row">
                {markets.map(market => (
                  <div key={market.id} className="col-md-2 col-sm-4 col-6 mb-2">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`market-${market.id}`}
                        checked={selectedMarkets.includes(market.id)}
                        onChange={() => toggleMarket(market.id)}
                      />
                      <label className="form-check-label" htmlFor={`market-${market.id}`}>
                        <span 
                          className="d-inline-block me-2"
                          style={{ 
                            width: '12px', 
                            height: '12px', 
                            backgroundColor: market.color,
                            borderRadius: '2px'
                          }}
                        ></span>
                        {market.name}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : (
        <div className="row">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-body">
                <div className="chart-container" style={{ height: '400px' }}>
                  {trendData.labels && (
                    <Line data={trendData} options={chartOptions} />
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">Resumen de Tendencias</h6>
              </div>
              <div className="card-body">
                {getInsights().map((insight, index) => (
                  <div key={index} className="d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
                    <div>
                      <span 
                        className="d-inline-block me-2"
                        style={{ 
                          width: '12px', 
                          height: '12px', 
                          backgroundColor: insight.color,
                          borderRadius: '2px'
                        }}
                      ></span>
                      <strong>{insight.market}</strong>
                    </div>
                    <div>
                      <span className={`badge ${insight.change >= 0 ? 'bg-success' : 'bg-danger'}`}>
                        <i className={`fas fa-arrow-${insight.direction} me-1`}></i>
                        {Math.abs(insight.change).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
                
                {selectedMarkets.length === 0 && (
                  <p className="text-muted text-center">
                    Selecciona al menos un mercado para ver las tendencias.
                  </p>
                )}
              </div>
            </div>

            <div className="card mt-3">
              <div className="card-header">
                <h6 className="mb-0">Análisis Rápido</h6>
              </div>
              <div className="card-body">
                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                  <strong>Período:</strong> {timeframes.find(t => t.value === timeframe)?.label}
                </div>
                <div className="alert alert-secondary">
                  <i className="fas fa-chart-line me-2"></i>
                  <strong>Métrica:</strong> {metrics.find(m => m.value === metric)?.label}
                </div>
                {getInsights().length > 0 && (
                  <div className={`alert ${getInsights()[0].change >= 0 ? 'alert-success' : 'alert-warning'}`}>
                    <i className="fas fa-trophy me-2"></i>
                    <strong>Mejor rendimiento:</strong> {getInsights()[0].market}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketTrendChart;