const API_BASE_URL = 'https://sardinaconquesofrito427.lat/destilo';

export async function apiClient(endpoint, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error en la petición');
    }

    return await response.json();
  } catch (error) {
    console.error(`Error en la petición a ${endpoint}:`, error);
    throw error;
  }
}

// Funciones específicas para cada tipo de operación
export const api = {
  // Clientes
  getCustomers: () => apiClient('/customers'),
  createCustomer: (data) => apiClient('/customers', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  deleteCustomer: (id) => apiClient(`/customers/${id}`, {
    method: 'DELETE'
  }),

  // Proveedores
  getSuppliers: () => apiClient('/suppliers'),
  createSupplier: (data) => apiClient('/suppliers', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  deleteSupplier: (id) => apiClient(`/suppliers/${id}`, {
    method: 'DELETE'
  }),

  // Servicios
  getServices: () => apiClient('/services'),
  createService: (data) => apiClient('/services', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateService: (id, data) => apiClient(`/services/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteService: (id) => apiClient(`/services/${id}`, {
    method: 'DELETE'
  }),

  // Inventario
  getStocks: () => apiClient('/stocks'),
  updateStockQuantity: (id, quantity) => apiClient(`/stocks/${id}/quantity`, {
    method: 'PUT',
    body: JSON.stringify({ quantity })
  }),

  // Ventas
  getSells: () => apiClient('/sells'),
  createSell: (data) => apiClient('/sells', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Datos generales
  createData: (collection, data) => apiClient(`/data/${collection}`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateData: (collection, id, data) => apiClient(`/data/${collection}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteData: (collection, id) => apiClient(`/data/${collection}/${id}`, {
    method: 'DELETE'
  })
};
