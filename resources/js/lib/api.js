import axios from 'axios';

const api = axios.create({
    withCredentials: true,
    withXSRFToken: true,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
    headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
});

const toBooleanString = (value) => (value ? '1' : '0');

async function ensureCsrfCookie() {
    await api.get('/sanctum/csrf-cookie');
}

function buildProductFormData(product, productId = null) {
    const formData = new FormData();

    formData.append('category_id', product.category_id);
    formData.append('name', product.name);
    formData.append('description', product.description);
    formData.append('price', product.price);
    formData.append('image_url', product.image_url ?? '');
    formData.append('is_new', toBooleanString(product.is_new));
    formData.append('is_available', toBooleanString(product.is_available));
    formData.append('display_order', product.display_order ?? 0);

    if (product.image_upload instanceof File) {
        formData.append('image_upload', product.image_upload);
    }

    if (productId) {
        formData.append('_method', 'PUT');
    }

    return formData;
}

export function extractErrorMessage(error, fallback = 'Une erreur est survenue.') {
    const errors = error?.response?.data?.errors;

    if (errors && typeof errors === 'object') {
        const firstField = Object.values(errors)[0];

        if (Array.isArray(firstField) && firstField.length > 0) {
            return firstField[0];
        }
    }

    return error?.response?.data?.message || error?.message || fallback;
}

export async function fetchCurrentUser() {
    try {
        const response = await api.get('/api/me');

        return response.data.user;
    } catch (error) {
        if (error?.response?.status === 401) {
            return null;
        }

        throw error;
    }
}

export async function login(payload) {
    await ensureCsrfCookie();

    const response = await api.post('/api/login', payload);

    return response.data;
}

export async function register(payload) {
    await ensureCsrfCookie();

    const response = await api.post('/api/register', payload);

    return response.data;
}

export async function logout() {
    const response = await api.post('/api/logout');

    return response.data;
}

export async function fetchProducts(category = null) {
    const response = await api.get('/api/products', {
        params: category ? { category } : {},
    });

    return response.data.data;
}

export async function fetchCategories() {
    const response = await api.get('/api/categories');

    return response.data.data;
}

export async function fetchOrders() {
    const response = await api.get('/api/orders');

    return response.data.data;
}

export async function createOrder(payload) {
    const response = await api.post('/api/orders', payload);

    return response.data;
}

export async function fetchAdminDashboard() {
    const response = await api.get('/api/admin/dashboard');

    return response.data;
}

export async function fetchAdminProductSalesStats() {
    const response = await api.get('/api/admin/stats/product-sales');

    return response.data;
}

export async function fetchAdminOrders() {
    const response = await api.get('/api/admin/orders');

    return response.data.data;
}

export async function acceptAdminOrder(orderId) {
    const response = await api.patch(`/api/admin/orders/${orderId}/accept`);

    return response.data;
}

export async function rejectAdminOrder(orderId) {
    const response = await api.patch(`/api/admin/orders/${orderId}/reject`);

    return response.data;
}

export async function fetchAdminProducts() {
    const response = await api.get('/api/admin/products');

    return response.data.data;
}

export async function saveAdminProduct(product, productId = null) {
    const formData = buildProductFormData(product, productId);
    const response = productId
        ? await api.post(`/api/admin/products/${productId}`, formData)
        : await api.post('/api/admin/products', formData);

    return response.data;
}

export async function deleteAdminProduct(productId) {
    const response = await api.delete(`/api/admin/products/${productId}`);

    return response.data;
}

export async function toggleAdminProductAvailability(productId) {
    const response = await api.patch(`/api/admin/products/${productId}/toggle-availability`);

    return response.data;
}

export async function fetchAdminCategories() {
    const response = await api.get('/api/admin/categories');

    return response.data.data;
}

export async function saveAdminCategory(category, categoryId = null) {
    const response = categoryId
        ? await api.put(`/api/admin/categories/${categoryId}`, category)
        : await api.post('/api/admin/categories', category);

    return response.data;
}

export async function deleteAdminCategory(categoryId) {
    const response = await api.delete(`/api/admin/categories/${categoryId}`);

    return response.data;
}
