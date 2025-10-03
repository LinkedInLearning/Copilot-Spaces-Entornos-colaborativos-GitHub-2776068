import React, { useState, useEffect } from 'react';
import suppliersData from '../configs/suppliers.json';

const SupplierValidator = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  useEffect(() => {
    setSuppliers(suppliersData.suppliers);
    setFilteredSuppliers(suppliersData.suppliers);
  }, []);

  useEffect(() => {
    let filtered = suppliers;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(supplier => supplier.category === selectedCategory);
    }

    if (selectedCountry !== 'all') {
      filtered = filtered.filter(supplier => supplier.country === selectedCountry);
    }

    if (verifiedOnly) {
      filtered = filtered.filter(supplier => supplier.verified);
    }

    if (searchTerm) {
      filtered = filtered.filter(supplier => 
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSuppliers(filtered);
  }, [suppliers, selectedCategory, selectedCountry, verifiedOnly, searchTerm]);

  const getCountries = () => {
    const countries = [...new Set(suppliers.map(s => s.country))];
    return countries.map(country => {
      const countryNames = {
        'CN': 'China',
        'IT': 'Italia', 
        'BR': 'Brasil',
        'JP': 'Japón',
        'DE': 'Alemania',
        'US': 'Estados Unidos'
      };
      return { code: country, name: countryNames[country] || country };
    });
  };

  const getRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={i} className="fas fa-star text-warning"></i>);
    }

    if (hasHalfStar) {
      stars.push(<i key="half" className="fas fa-star-half-alt text-warning"></i>);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="far fa-star text-warning"></i>);
    }

    return stars;
  };

  const validateSupplier = (supplier) => {
    const validationPoints = [];
    
    if (supplier.verified) {
      validationPoints.push({ type: 'success', message: 'Proveedor verificado oficialmente' });
    } else {
      validationPoints.push({ type: 'warning', message: 'Proveedor no verificado - requiere validación adicional' });
    }

    if (supplier.rating >= 4.5) {
      validationPoints.push({ type: 'success', message: 'Excelente calificación de clientes' });
    } else if (supplier.rating >= 4.0) {
      validationPoints.push({ type: 'info', message: 'Buena calificación de clientes' });
    } else {
      validationPoints.push({ type: 'warning', message: 'Calificación promedio - revisar referencias' });
    }

    if (supplier.certifications.length >= 3) {
      validationPoints.push({ type: 'success', message: 'Múltiples certificaciones de calidad' });
    } else if (supplier.certifications.length >= 1) {
      validationPoints.push({ type: 'info', message: 'Certificaciones básicas disponibles' });
    } else {
      validationPoints.push({ type: 'danger', message: 'Sin certificaciones de calidad' });
    }

    const annualRevenue = parseFloat(supplier.tradeCapacity.annualRevenue.replace(/[$M]/g, ''));
    if (annualRevenue >= 20) {
      validationPoints.push({ type: 'success', message: 'Empresa con alta capacidad financiera' });
    } else if (annualRevenue >= 10) {
      validationPoints.push({ type: 'info', message: 'Empresa con capacidad financiera estable' });
    } else {
      validationPoints.push({ type: 'warning', message: 'Empresa pequeña - evaluar capacidad de entrega' });
    }

    return validationPoints;
  };

  return (
    <div className="supplier-validator">
      <div className="row mb-3">
        <div className="col-md-3">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar proveedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <select 
            className="form-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">Todas las categorías</option>
            {suppliersData.categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <select 
            className="form-select"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
          >
            <option value="all">Todos los países</option>
            {getCountries().map(country => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <div className="form-check mt-2">
            <input
              className="form-check-input"
              type="checkbox"
              id="verifiedOnly"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="verifiedOnly">
              Solo verificados
            </label>
          </div>
        </div>
      </div>

      <div className="row">
        {filteredSuppliers.map(supplier => (
          <div key={supplier.id} className="col-lg-6 mb-3">
            <div className="card h-100">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h6 className="mb-0">{supplier.name}</h6>
                {supplier.verified && (
                  <span className="badge bg-success">
                    <i className="fas fa-check me-1"></i>Verificado
                  </span>
                )}
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-8">
                    <p className="mb-1">
                      <strong>País:</strong> {supplier.country} - {supplier.city}
                    </p>
                    <p className="mb-1">
                      <strong>Categoría:</strong> {supplier.category}
                    </p>
                    <p className="mb-1">
                      <strong>Calificación:</strong> 
                      <span className="ms-2">
                        {getRatingStars(supplier.rating)}
                        <span className="ms-1">({supplier.rating})</span>
                      </span>
                    </p>
                    <p className="mb-1">
                      <strong>Certificaciones:</strong>
                    </p>
                    <div className="mb-2">
                      {supplier.certifications.map(cert => (
                        <span key={cert} className="badge bg-info me-1 mb-1">{cert}</span>
                      ))}
                    </div>
                  </div>
                  <div className="col-4 text-end">
                    <div className="mb-2">
                      <small className="text-muted">Empleados</small>
                      <div><strong>{supplier.tradeCapacity.totalEmployees}</strong></div>
                    </div>
                    <div className="mb-2">
                      <small className="text-muted">Ingresos</small>
                      <div><strong>{supplier.tradeCapacity.annualRevenue}</strong></div>
                    </div>
                  </div>
                </div>
                
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => setSelectedSupplier(supplier)}
                  data-bs-toggle="modal"
                  data-bs-target="#supplierModal"
                >
                  Ver Detalles y Validación
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSuppliers.length === 0 && (
        <div className="text-center py-4">
          <p className="text-muted">No se encontraron proveedores con los criterios seleccionados.</p>
        </div>
      )}

      {/* Modal for supplier details */}
      <div className="modal fade" id="supplierModal" tabIndex={-1}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            {selectedSupplier && (
              <>
                <div className="modal-header">
                  <h5 className="modal-title">{selectedSupplier.name}</h5>
                  <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div className="modal-body">
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <h6>Información de Contacto</h6>
                      <p><strong>Email:</strong> {selectedSupplier.contact.email}</p>
                      <p><strong>Teléfono:</strong> {selectedSupplier.contact.phone}</p>
                      <p><strong>Website:</strong> {selectedSupplier.contact.website}</p>
                    </div>
                    <div className="col-md-6">
                      <h6>Capacidad Comercial</h6>
                      <p><strong>Empleados:</strong> {selectedSupplier.tradeCapacity.totalEmployees}</p>
                      <p><strong>Ingresos Anuales:</strong> {selectedSupplier.tradeCapacity.annualRevenue}</p>
                      <p><strong>% Exportación:</strong> {selectedSupplier.tradeCapacity.exportPercentage}%</p>
                    </div>
                  </div>

                  <h6>Productos Principales</h6>
                  <div className="table-responsive mb-3">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>MOQ</th>
                          <th>Rango de Precio</th>
                          <th>Tiempo de Entrega</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedSupplier.products.map((product, index) => (
                          <tr key={index}>
                            <td>{product.name}</td>
                            <td>{product.minOrderQuantity}</td>
                            <td>{product.priceRange}</td>
                            <td>{product.leadTime}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <h6>Análisis de Validación</h6>
                  <div className="validation-results">
                    {validateSupplier(selectedSupplier).map((point, index) => (
                      <div key={index} className={`alert alert-${point.type} py-2`}>
                        <i className={`fas fa-${point.type === 'success' ? 'check-circle' : 
                          point.type === 'warning' ? 'exclamation-triangle' :
                          point.type === 'danger' ? 'times-circle' : 'info-circle'} me-2`}></i>
                        {point.message}
                      </div>
                    ))}
                  </div>

                  <h6>Términos de Pago</h6>
                  <div>
                    {selectedSupplier.paymentTerms.map(term => (
                      <span key={term} className="badge bg-secondary me-1">{term}</span>
                    ))}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                    Cerrar
                  </button>
                  <button type="button" className="btn btn-primary">
                    Contactar Proveedor
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierValidator;