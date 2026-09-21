import { useEffect, useMemo, useState } from 'react';
import AdminPanel from './components/AdminPanel';
import Footer from './components/Footer';
import CartModal from './components/CartModal';
import Header from './components/Header';
import Hero from './components/Hero';
import LoginModal from './components/LoginModal';
import MenuSection from './components/MenuSection';
import OrdersPage from './components/OrdersPage';
import Toast from './components/Toast';
import {
    acceptAdminOrder,
    createOrder,
    deleteAdminCategory,
    deleteAdminProduct,
    extractErrorMessage,
    fetchAdminCategories,
    fetchAdminDashboard,
    fetchAdminProductSalesStats,
    fetchAdminOrders,
    fetchAdminProducts,
    fetchCategories,
    fetchCurrentUser,
    fetchOrders,
    fetchProducts,
    login,
    logout,
    register,
    rejectAdminOrder,
    saveAdminCategory,
    saveAdminProduct,
    toggleAdminProductAvailability,
} from './lib/api';

export default function MiyaSushiApp() {
    const [currentPage, setCurrentPage] = useState('home');
    const [activeTab, setActiveTab] = useState('menu');
    const [authMode, setAuthMode] = useState('login');
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showCartModal, setShowCartModal] = useState(false);
    const [authSubmitting, setAuthSubmitting] = useState(false);
    const [orderSubmitting, setOrderSubmitting] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [loadingMenu, setLoadingMenu] = useState(true);
    const [loadingApp, setLoadingApp] = useState(true);
    const [user, setUser] = useState(null);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [adminOrders, setAdminOrders] = useState([]);
    const [adminProducts, setAdminProducts] = useState([]);
    const [adminCategories, setAdminCategories] = useState([]);
    const [dashboard, setDashboard] = useState({
        today_orders_count: 0,
        pending_orders_count: 0,
        today_revenue: 0,
        total_orders_count: 0,
        latest_orders: [],
    });
    const [salesStats, setSalesStats] = useState(null);
    const [cart, setCart] = useState([]);
    const [deliveryType, setDeliveryType] = useState('delivery');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [comments, setComments] = useState('');
    const [toast, setToast] = useState(null);

    const isLoggedIn = Boolean(user);
    const isAdmin = user?.role === 'admin';

    const filteredItems = useMemo(
        () => products.filter((item) => item.category_slug === activeTab),
        [activeTab, products],
    );

    const cartSubtotal = useMemo(
        () => cart.reduce((total, item) => total + Number(item.price) * item.quantity, 0),
        [cart],
    );

    useEffect(() => {
        const bootstrap = async () => {
            try {
                await Promise.all([loadCatalog(), loadCurrentUser()]);
            } finally {
                setLoadingApp(false);
            }
        };

        bootstrap();
    }, []);

    useEffect(() => {
        if (user?.address && !deliveryAddress) {
            setDeliveryAddress(user.address);
        }
    }, [deliveryAddress, user]);

    useEffect(() => {
        if (!toast) {
            return undefined;
        }

        const timeoutId = window.setTimeout(() => setToast(null), 3500);

        return () => window.clearTimeout(timeoutId);
    }, [toast]);

    useEffect(() => {
        if (isLoggedIn && !isAdmin) {
            loadUserOrders();
        }
    }, [isAdmin, isLoggedIn]);

    useEffect(() => {
        if (currentPage === 'admin' && isAdmin) {
            loadAdminData();
        }
    }, [currentPage, isAdmin]);

    const showSuccess = (message) => setToast({ type: 'success', message });
    const showError = (message) => setToast({ type: 'error', message });

    async function loadCatalog() {
        setLoadingMenu(true);

        try {
            const [categoryData, productData] = await Promise.all([
                fetchCategories(),
                fetchProducts(),
            ]);

            setCategories(categoryData);
            setProducts(productData);

            if (categoryData.length > 0 && !categoryData.some((category) => category.slug === activeTab)) {
                setActiveTab(categoryData[0].slug);
            }
        } catch (error) {
            showError(extractErrorMessage(error, 'Impossible de charger la carte.'));
        } finally {
            setLoadingMenu(false);
        }
    }

    async function loadCurrentUser() {
        try {
            const currentUser = await fetchCurrentUser();

            if (currentUser) {
                setUser(currentUser);
            }
        } catch (error) {
            showError(extractErrorMessage(error, 'Impossible de recuperer la session utilisateur.'));
        }
    }

    async function loadUserOrders() {
        try {
            const userOrders = await fetchOrders();
            setOrders(userOrders);
        } catch (error) {
            showError(extractErrorMessage(error, 'Impossible de charger vos commandes.'));
        }
    }

    async function loadAdminData() {
        try {
            const [dashboardData, orderData, productData, categoryData, salesStatsData] = await Promise.all([
                fetchAdminDashboard(),
                fetchAdminOrders(),
                fetchAdminProducts(),
                fetchAdminCategories(),
                fetchAdminProductSalesStats(),
            ]);

            setDashboard(dashboardData);
            setSalesStats(salesStatsData);
            setAdminOrders(orderData);
            setAdminProducts(productData);
            setAdminCategories(categoryData);
        } catch (error) {
            showError(extractErrorMessage(error, 'Impossible de charger le panneau admin.'));
        }
    }

    const openAuthModal = (mode = 'login') => {
        setAuthMode(mode);
        setShowAuthModal(true);
    };

    const navigate = (page) => {
        setCurrentPage(page);
    };

    const addToCart = (item) => {
        if (!isLoggedIn) {
            openAuthModal('login');
            return;
        }

        if (isAdmin) {
            return;
        }

        setCart((currentCart) => {
            const existingItem = currentCart.find((cartItem) => cartItem.id === item.id);

            if (existingItem) {
                return currentCart.map((cartItem) =>
                    cartItem.id === item.id
                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                        : cartItem,
                );
            }

            return [...currentCart, { ...item, quantity: 1 }];
        });

        setShowCartModal(true);
    };

    const updateQuantity = (itemId, delta) => {
        setCart((currentCart) =>
            currentCart
                .map((item) =>
                    item.id === itemId
                        ? { ...item, quantity: item.quantity + delta }
                        : item,
                )
                .filter((item) => item.quantity > 0),
        );
    };

    const removeFromCart = (itemId) => {
        setCart((currentCart) => currentCart.filter((item) => item.id !== itemId));
    };

    const handleLogin = async (payload) => {
        setAuthSubmitting(true);

        try {
            const response = await login(payload);
            setUser(response.user);
            setShowAuthModal(false);
            setCurrentPage(response.user.role === 'admin' ? 'admin' : 'menu');
            showSuccess('Connexion reussie.');
        } catch (error) {
            showError(extractErrorMessage(error, 'Connexion impossible.'));
        } finally {
            setAuthSubmitting(false);
        }
    };

    const handleRegister = async (payload) => {
        setAuthSubmitting(true);

        try {
            const response = await register(payload);
            setUser(response.user);
            setShowAuthModal(false);
            setCurrentPage('menu');
            showSuccess('Compte cree avec succes.');
        } catch (error) {
            showError(extractErrorMessage(error, 'Inscription impossible.'));
        } finally {
            setAuthSubmitting(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            setUser(null);
            setOrders([]);
            setAdminOrders([]);
            setCart([]);
            setCurrentPage('home');
            showSuccess('Deconnexion reussie.');
        } catch (error) {
            showError(extractErrorMessage(error, 'Deconnexion impossible.'));
        }
    };

    const handlePlaceOrder = async () => {
        if (cart.length === 0) {
            return;
        }

        setOrderSubmitting(true);

        try {
            const payload = {
                delivery_type: deliveryType,
                delivery_address: deliveryType === 'delivery' ? deliveryAddress : null,
                comments,
                items: cart.map((item) => ({
                    product_id: item.id,
                    quantity: item.quantity,
                })),
            };

            await createOrder(payload);
            await loadUserOrders();
            setCart([]);
            setComments('');
            setShowCartModal(false);
            showSuccess('Commande passee avec succes. En attente de validation.');
            setCurrentPage('orders');
        } catch (error) {
            showError(extractErrorMessage(error, 'Impossible de creer la commande.'));
        } finally {
            setOrderSubmitting(false);
        }
    };

    const handleAcceptOrder = async (orderId) => {
        setActionLoadingId(orderId);

        try {
            await acceptAdminOrder(orderId);
            await loadAdminData();
            showSuccess('Commande acceptee.');
        } catch (error) {
            showError(extractErrorMessage(error, 'Impossible d accepter la commande.'));
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleRejectOrder = async (orderId) => {
        setActionLoadingId(orderId);

        try {
            await rejectAdminOrder(orderId);
            await loadAdminData();
            showSuccess('Commande refusee.');
        } catch (error) {
            showError(extractErrorMessage(error, 'Impossible de refuser la commande.'));
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleSaveProduct = async (product, productId = null) => {
        try {
            await saveAdminProduct(product, productId);
            await Promise.all([loadAdminData(), loadCatalog()]);
            showSuccess(productId ? 'Produit mis a jour.' : 'Produit cree.');
            return true;
        } catch (error) {
            showError(extractErrorMessage(error, 'Impossible d enregistrer le produit.'));
            return false;
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('Supprimer ce produit ?')) {
            return;
        }

        try {
            await deleteAdminProduct(productId);
            await Promise.all([loadAdminData(), loadCatalog()]);
            showSuccess('Produit supprime.');
        } catch (error) {
            showError(extractErrorMessage(error, 'Impossible de supprimer le produit.'));
        }
    };

    const handleToggleProductAvailability = async (productId) => {
        try {
            await toggleAdminProductAvailability(productId);
            await Promise.all([loadAdminData(), loadCatalog()]);
            showSuccess('Disponibilite mise a jour.');
        } catch (error) {
            showError(extractErrorMessage(error, 'Impossible de changer la disponibilite.'));
        }
    };

    const handleSaveCategory = async (category, categoryId = null) => {
        try {
            await saveAdminCategory(category, categoryId);
            await Promise.all([loadAdminData(), loadCatalog()]);
            showSuccess(categoryId ? 'Categorie mise a jour.' : 'Categorie creee.');
            return true;
        } catch (error) {
            showError(extractErrorMessage(error, 'Impossible d enregistrer la categorie.'));
            return false;
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        if (!window.confirm('Supprimer cette categorie ?')) {
            return;
        }

        try {
            await deleteAdminCategory(categoryId);
            await Promise.all([loadAdminData(), loadCatalog()]);
            showSuccess('Categorie supprimee.');
        } catch (error) {
            showError(extractErrorMessage(error, 'Impossible de supprimer la categorie.'));
        }
    };

    return (
        <>
            <Header
                currentPage={currentPage}
                isLoggedIn={isLoggedIn}
                isAdmin={isAdmin}
                user={user}
                onNavigate={navigate}
                onOpenAuth={() => openAuthModal('login')}
                onLogout={handleLogout}
            />

            {loadingApp ? (
                <div className="container page-loading">
                    <div className="empty-state">
                        <div className="empty-state-icon">S</div>
                        <p>Chargement de Miya Sushi...</p>
                    </div>
                </div>
            ) : (
                <>
                    {currentPage === 'home' && (
                        <>
                            <Hero onExploreMenu={() => setCurrentPage('menu')} />
                            <MenuSection
                                categories={categories}
                                activeTab={activeTab}
                                onTabChange={setActiveTab}
                                items={filteredItems}
                                isLoggedIn={isLoggedIn}
                                isAdmin={isAdmin}
                                onAddToCart={addToCart}
                                loading={loadingMenu}
                            />
                        </>
                    )}
                    {currentPage === 'menu' && (
                        <MenuSection
                            categories={categories}
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                            items={filteredItems}
                            isLoggedIn={isLoggedIn}
                            isAdmin={isAdmin}
                            onAddToCart={addToCart}
                            loading={loadingMenu}
                        />
                    )}
                    {currentPage === 'orders' && isLoggedIn && !isAdmin && (
                        <OrdersPage orders={orders} onNavigateMenu={() => setCurrentPage('menu')} />
                    )}
                    {currentPage === 'admin' && isAdmin && (
                        <AdminPanel
                            dashboard={dashboard}
                            salesStats={salesStats}
                            orders={adminOrders}
                            products={adminProducts}
                            categories={adminCategories}
                            actionLoadingId={actionLoadingId}
                            onAcceptOrder={handleAcceptOrder}
                            onRejectOrder={handleRejectOrder}
                            onSaveProduct={handleSaveProduct}
                            onDeleteProduct={handleDeleteProduct}
                            onToggleProductAvailability={handleToggleProductAvailability}
                            onSaveCategory={handleSaveCategory}
                            onDeleteCategory={handleDeleteCategory}
                        />
                    )}
                </>
            )}

            <Footer />

            {isLoggedIn && !isAdmin && (
                <button type="button" className="cart-icon" onClick={() => setShowCartModal(true)}>
                    Cart
                    {cart.length > 0 && <div className="cart-badge">{cart.length}</div>}
                </button>
            )}

            {showAuthModal && (
                <LoginModal
                    mode={authMode}
                    submitting={authSubmitting}
                    onClose={() => setShowAuthModal(false)}
                    onModeChange={setAuthMode}
                    onLogin={handleLogin}
                    onRegister={handleRegister}
                />
            )}

            {showCartModal && (
                <CartModal
                    cart={cart}
                    deliveryType={deliveryType}
                    deliveryAddress={deliveryAddress}
                    comments={comments}
                    subtotal={cartSubtotal}
                    submitting={orderSubmitting}
                    onClose={() => setShowCartModal(false)}
                    onUpdateQuantity={updateQuantity}
                    onRemoveItem={removeFromCart}
                    onDeliveryTypeChange={setDeliveryType}
                    onDeliveryAddressChange={setDeliveryAddress}
                    onCommentsChange={setComments}
                    onPlaceOrder={handlePlaceOrder}
                />
            )}

            <Toast toast={toast} onClose={() => setToast(null)} />
        </>
    );
}
