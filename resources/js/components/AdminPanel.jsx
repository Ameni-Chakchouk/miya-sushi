import { useMemo, useState } from 'react';
import OrderCard from './OrderCard';
import ProductSalesChart from './ProductSalesChart';

const initialProductForm = {
    category_id: '',
    name: '',
    description: '',
    price: '',
    image_url: '',
    image_upload: null,
    is_new: false,
    is_available: true,
    display_order: 0,
};

const initialCategoryForm = {
    name: '',
    slug: '',
    display_order: 0,
};

export default function AdminPanel({
    dashboard,
    salesStats,
    orders,
    products,
    categories,
    actionLoadingId,
    onAcceptOrder,
    onRejectOrder,
    onSaveProduct,
    onDeleteProduct,
    onToggleProductAvailability,
    onSaveCategory,
    onDeleteCategory,
}) {
    const [activeSection, setActiveSection] = useState('orders');
    const [editingProductId, setEditingProductId] = useState(null);
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [productForm, setProductForm] = useState(initialProductForm);
    const [categoryForm, setCategoryForm] = useState(initialCategoryForm);

    const latestOrders = useMemo(
        () => (dashboard.latest_orders?.data ? dashboard.latest_orders.data : dashboard.latest_orders || []),
        [dashboard.latest_orders],
    );

    const handleEditProduct = (product) => {
        setActiveSection('products');
        setEditingProductId(product.id);
        setProductForm({
            category_id: String(product.category_id),
            name: product.name,
            description: product.description,
            price: String(product.price),
            image_url: product.image_url ?? '',
            image_upload: null,
            is_new: product.is_new,
            is_available: product.is_available,
            display_order: product.display_order ?? 0,
        });
    };

    const handleEditCategory = (category) => {
        setActiveSection('categories');
        setEditingCategoryId(category.id);
        setCategoryForm({
            name: category.name,
            slug: category.slug,
            display_order: category.display_order ?? 0,
        });
    };

    const resetProductForm = () => {
        setEditingProductId(null);
        setProductForm(initialProductForm);
    };

    const resetCategoryForm = () => {
        setEditingCategoryId(null);
        setCategoryForm(initialCategoryForm);
    };

    const handleProductSubmit = async (event) => {
        event.preventDefault();
        const success = await onSaveProduct(productForm, editingProductId);

        if (success) {
            resetProductForm();
        }
    };

    const handleCategorySubmit = async (event) => {
        event.preventDefault();
        const success = await onSaveCategory(categoryForm, editingCategoryId);

        if (success) {
            resetCategoryForm();
        }
    };

    return (
        <div className="container">
            <div className="admin-panel">
                <h2 className="section-title admin-title">Tableau de Bord Admin</h2>
                <p className="section-subtitle admin-subtitle">Gestion des commandes et statistiques</p>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-value">{dashboard.today_orders_count ?? 0}</div>
                        <div className="stat-label">Commandes Aujourd'hui</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{dashboard.pending_orders_count ?? 0}</div>
                        <div className="stat-label">En Attente</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{Number(dashboard.today_revenue ?? 0).toFixed(2)}€</div>
                        <div className="stat-label">Revenus du Jour</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{dashboard.total_orders_count ?? 0}</div>
                        <div className="stat-label">Total Commandes</div>
                    </div>
                </div>
            </div>

            <div className="tab-container admin-tab-container">
                <div className="tabs">
                    <button type="button" className={activeSection === 'orders' ? 'tab active' : 'tab'} onClick={() => setActiveSection('orders')}>
                        Commandes
                    </button>
                    <button type="button" className={activeSection === 'products' ? 'tab active' : 'tab'} onClick={() => setActiveSection('products')}>
                        Produits
                    </button>
                    <button type="button" className={activeSection === 'categories' ? 'tab active' : 'tab'} onClick={() => setActiveSection('categories')}>
                        Catégories
                    </button>
                </div>
            </div>

            {activeSection === 'orders' && (
                <>
                    <h3 className="section-title admin-section-title">Toutes les Commandes</h3>
                    {latestOrders.length > 0 && (
                        <div className="admin-latest-orders">
                            <h4 className="manager-subtitle">Dernières commandes</h4>
                            <div className="latest-order-grid">
                                {latestOrders.map((order) => (
                                    <div key={order.id} className="mini-order-card">
                                        <strong>{order.order_number}</strong>
                                        <span>{order.customer_email ?? order.customer?.email}</span>
                                        <span>{Number(order.total).toFixed(2)}€</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {orders.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">📊</div>
                            <p>Aucune commande enregistrée</p>
                        </div>
                    ) : (
                        <div className="order-list">
                            {orders.map((order) => (
                                <OrderCard
                                    key={order.id}
                                    order={order}
                                    admin
                                    actionLoadingId={actionLoadingId}
                                    onAccept={onAcceptOrder}
                                    onReject={onRejectOrder}
                                />
                            ))}
                        </div>
                    )}
                    <ProductSalesChart stats={salesStats} />
                </>
            )}

            {activeSection === 'products' && (
                <div className="manager-layout">
                    <div className="manager-card">
                        <h3 className="manager-title">{editingProductId ? 'Modifier le Produit' : 'Ajouter un Produit'}</h3>
                        <form onSubmit={handleProductSubmit}>
                            <div className="form-group">
                                <label className="form-label">Catégorie</label>
                                <select
                                    className="form-input"
                                    value={productForm.category_id}
                                    onChange={(event) => setProductForm((current) => ({ ...current, category_id: event.target.value }))}
                                    required
                                >
                                    <option value="">Sélectionner</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Nom</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={productForm.name}
                                    onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-input"
                                    value={productForm.description}
                                    onChange={(event) => setProductForm((current) => ({ ...current, description: event.target.value }))}
                                    required
                                />
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Prix</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="form-input"
                                        value={productForm.price}
                                        onChange={(event) => setProductForm((current) => ({ ...current, price: event.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Ordre d'affichage</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="form-input"
                                        value={productForm.display_order}
                                        onChange={(event) => setProductForm((current) => ({ ...current, display_order: event.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Image externe (URL)</label>
                                <input
                                    type="url"
                                    className="form-input"
                                    value={productForm.image_url}
                                    onChange={(event) => setProductForm((current) => ({ ...current, image_url: event.target.value }))}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Ou téléverser une image</label>
                                <input
                                    type="file"
                                    className="form-input"
                                    accept="image/*"
                                    onChange={(event) => setProductForm((current) => ({ ...current, image_upload: event.target.files?.[0] ?? null }))}
                                />
                            </div>
                            <div className="form-grid">
                                <label className="checkbox-row">
                                    <input
                                        type="checkbox"
                                        checked={productForm.is_new}
                                        onChange={(event) => setProductForm((current) => ({ ...current, is_new: event.target.checked }))}
                                    />
                                    <span>Badge NOUVEAU</span>
                                </label>
                                <label className="checkbox-row">
                                    <input
                                        type="checkbox"
                                        checked={productForm.is_available}
                                        onChange={(event) => setProductForm((current) => ({ ...current, is_available: event.target.checked }))}
                                    />
                                    <span>Disponible</span>
                                </label>
                            </div>
                            <div className="form-action-row">
                                <button type="submit" className="btn btn-primary">
                                    {editingProductId ? 'Mettre à jour' : 'Créer le produit'}
                                </button>
                                {editingProductId && (
                                    <button type="button" className="btn btn-outline" onClick={resetProductForm}>
                                        Annuler
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="manager-card">
                        <h3 className="manager-title">Catalogue Admin</h3>
                        <div className="manager-list">
                            {products.map((product) => (
                                <div key={product.id} className="manager-list-item">
                                    <div>
                                        <div className="manager-item-title">{product.name}</div>
                                        <div className="manager-item-meta">
                                            {product.category?.name ?? product.category_slug} - {Number(product.price).toFixed(2)}€
                                        </div>
                                        <div className="manager-item-meta">
                                            {product.is_available ? 'Disponible' : 'Indisponible'}
                                            {product.is_new ? ' - Nouveau' : ''}
                                        </div>
                                    </div>
                                    <div className="manager-actions">
                                        <button type="button" className="btn btn-outline" onClick={() => handleEditProduct(product)}>
                                            Modifier
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => onToggleProductAvailability(product.id)}
                                        >
                                            {product.is_available ? 'Masquer' : 'Publier'}
                                        </button>
                                        <button type="button" className="btn btn-danger" onClick={() => onDeleteProduct(product.id)}>
                                            Supprimer
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeSection === 'categories' && (
                <div className="manager-layout">
                    <div className="manager-card">
                        <h3 className="manager-title">{editingCategoryId ? 'Modifier la Catégorie' : 'Ajouter une Catégorie'}</h3>
                        <form onSubmit={handleCategorySubmit}>
                            <div className="form-group">
                                <label className="form-label">Nom</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={categoryForm.name}
                                    onChange={(event) => setCategoryForm((current) => ({ ...current, name: event.target.value }))}
                                    required
                                />
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Slug</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={categoryForm.slug}
                                        onChange={(event) => setCategoryForm((current) => ({ ...current, slug: event.target.value }))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Ordre d'affichage</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="form-input"
                                        value={categoryForm.display_order}
                                        onChange={(event) => setCategoryForm((current) => ({ ...current, display_order: event.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="form-action-row">
                                <button type="submit" className="btn btn-primary">
                                    {editingCategoryId ? 'Mettre à jour' : 'Créer la catégorie'}
                                </button>
                                {editingCategoryId && (
                                    <button type="button" className="btn btn-outline" onClick={resetCategoryForm}>
                                        Annuler
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="manager-card">
                        <h3 className="manager-title">Catégories</h3>
                        <div className="manager-list">
                            {categories.map((category) => (
                                <div key={category.id} className="manager-list-item">
                                    <div>
                                        <div className="manager-item-title">{category.name}</div>
                                        <div className="manager-item-meta">
                                            {category.slug} - ordre {category.display_order}
                                        </div>
                                    </div>
                                    <div className="manager-actions">
                                        <button type="button" className="btn btn-outline" onClick={() => handleEditCategory(category)}>
                                            Modifier
                                        </button>
                                        <button type="button" className="btn btn-danger" onClick={() => onDeleteCategory(category.id)}>
                                            Supprimer
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
