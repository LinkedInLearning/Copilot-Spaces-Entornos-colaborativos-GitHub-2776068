import React, { useState, useEffect } from 'react';
import { currencyConverter, formatCurrency } from '../utils/currencyConverter';

const PriceAnalyzer = () => {
  const [priceData, setPriceData] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('electronics');
  const [selectedMarket, setSelectedMarket] = useState('US');
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(false);

  const products = [
    'electrónicos', 'textiles', 'maquinaria', 'químicos',
    'alimentos', 'automotriz', 'farmacéutica', 'commodities'
  ];

  const markets = [
    { id: 'US', name: 'Estados Unidos' },
    { id: 'EU', name: 'Unión Europea' },
    { id: 'CN', name: 'China' },
    { id: 'JP', name: 'Japón' },
    { id: 'BR', name: 'Brasil' }
  ];

  // Simulate price fluctuation data
  const generatePriceData = () => {
    setLoading(true);
    setTimeout(() => {
      const data = [];
      const basePrice = Math.random() * 1000 + 100;

      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));

        // Simulate realistic price fluctuations
        const fluctuation = (Math.random() - 0.5) * 0.1; // ±10%
        const price = basePrice * (1 + fluctuation + (Math.sin(i / 5) * 0.05));

        data.push({
          date: date.toISOString().split('T')[0],
          price: Math.round(price * 100) / 100,
          volume: Math.floor(Math.random() * 10000) + 1000,
          change: i > 0 ? ((price - data[i - 1]?.price || price) / (data[i - 1]?.price || price)) * 100 : 0
        });
      }

      setPriceData(data);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    generatePriceData();
  }, [selectedProduct, selectedMarket]);

  const currentPrice = priceData.length > 0 ? priceData[priceData.length - 1] : null;
  const previousPrice = priceData.length > 1 ? priceData[priceData.length - 2] : null;
  const priceChange = currentPrice && previousPrice ?
    ((currentPrice.price - previousPrice.price) / previousPrice.price) * 100 : 0;

  const averagePrice = priceData.length > 0 ?
    priceData.reduce((sum, item) => sum + item.price, 0) / priceData.length : 0;

  const convertPrice = (price) => {
    if (currency === 'USD') return price;
    try {
      const result = currencyConverter.convert(price, 'USD', currency);
      return result.convertedAmount;
    } catch (error) {
      return price;
    }
  };

  return (
    <div className="price-analyzer">
      <div className="row mb-3">
        <div className="col-md-4">
          <select
            className="form-select"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
          >
            {products.map(product => (
              <option key={product} value={product}>
                {product.charAt(0).toUpperCase() + product.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={selectedMarket}
            onChange={(e) => setSelectedMarket(e.target.value)}
          >
            {markets.map(market => (
              <option key={market.id} value={market.id}>
                {market.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="CNY">CNY</option>
            <option value="JPY">JPY</option>
            <option value="BRL">BRL</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card bg-primary text-white">
                <div className="card-body text-center">
                  <h5 className="card-title">Precio Actual</h5>
                  <h3 className="mb-0">
                    {currentPrice ? formatCurrency(convertPrice(currentPrice.price), currency) : '--'}
                  </h3>
                  <small className={`badge ${priceChange >= 0 ? 'bg-success' : 'bg-danger'} mt-2`}>
                    {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                  </small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-info text-white">
                <div className="card-body text-center">
                  <h5 className="card-title">Precio Promedio</h5>
                  <h3 className="mb-0">
                    {formatCurrency(convertPrice(averagePrice), currency)}
                  </h3>
                  <small className="opacity-75">30 días</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-success text-white">
                <div className="card-body text-center">
                  <h5 className="card-title">Precio Mínimo</h5>
                  <h3 className="mb-0">
                    {priceData.length > 0 ?
                      formatCurrency(convertPrice(Math.min(...priceData.map(d => d.price))), currency) : '--'}
                  </h3>
                  <small className="opacity-75">30 días</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-warning text-dark">
                <div className="card-body text-center">
                  <h5 className="card-title">Precio Máximo</h5>
                  <h3 className="mb-0">
                    {priceData.length > 0 ?
                      formatCurrency(convertPrice(Math.max(...priceData.map(d => d.price))), currency) : '--'}
                  </h3>
                  <small className="opacity-75">30 días</small>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Historial de Precios - Últimos 30 días</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Precio</th>
                      <th>Volumen</th>
                      <th>Cambio %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {priceData.slice(-10).reverse().map((item, index) => (
                      <tr key={index}>
                        <td>{item.date}</td>
                        <td>{formatCurrency(convertPrice(item.price), currency)}</td>
                        <td>{item.volume.toLocaleString()} unidades</td>
                        <td>
                          <span className={`badge ${item.change >= 0 ? 'bg-success' : 'bg-danger'}`}>
                            {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="mt-3">
            <button
              className="btn btn-primary"
              onClick={generatePriceData}
              disabled={loading}
            >
              <i className="fas fa-refresh me-2"></i>
              Actualizar Datos
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PriceAnalyzer;