import PriceAnalyzer from './components/PriceAnalyzer'
import SupplierValidator from './components/SupplierValidator'
import MarketTrendChart from './components/MarketTrendChart'
import './App.css'

function App() {
  return (
    <div className="container-fluid">
      <header className="py-4 mb-4 border-bottom">
        <div className="container">
          <h1 className="display-4 text-primary">Comercio Internacional</h1>

        </div>
      </header>

      <main className="container">
        <div className="row">
          <div className="col-12 mb-4">
            <div className="card shadow">
              <div className="card-header">
                <h2 className="h4 mb-0">Análisis de Precios</h2>
              </div>
              <div className="card-body">
                <PriceAnalyzer />
              </div>
            </div>
          </div>

          <div className="col-lg-6 mb-4">
            <div className="card shadow">
              <div className="card-header">
                <h2 className="h4 mb-0">Validación de Proveedores</h2>
              </div>
              <div className="card-body">
                <SupplierValidator />
              </div>
            </div>
          </div>

          <div className="col-lg-6 mb-4">
            <div className="card shadow">
              <div className="card-header">
                <h2 className="h4 mb-0">Tendencias del Mercado</h2>
              </div>
              <div className="card-body">
                <MarketTrendChart />
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-4 mt-5 border-top">
        <div className="container text-center text-muted">
          <p>&copy; 2024 Porroa e Hijos. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}

export default App