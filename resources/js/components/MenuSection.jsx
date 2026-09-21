import ProductCard from './ProductCard';

export default function MenuSection({
    categories,
    activeTab,
    onTabChange,
    items,
    isLoggedIn,
    isAdmin,
    onAddToCart,
    loading,
}) {
    return (
        <div className="container">
            <div className="tab-container">
                <h2 className="section-title">Notre Collection</h2>
                <p className="section-subtitle">Chaque création est une œuvre d'art culinaire</p>
                <div className="tabs">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            type="button"
                            className={activeTab === category.slug ? 'tab active' : 'tab'}
                            onClick={() => onTabChange(category.slug)}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>
            {loading ? (
                <div className="empty-state">
                    <div className="empty-state-icon">🍣</div>
                    <p>Chargement de la carte...</p>
                </div>
            ) : (
                <div className="menu-grid">
                    {items.map((item) => (
                        <ProductCard
                            key={item.id}
                            item={item}
                            isLoggedIn={isLoggedIn}
                            isAdmin={isAdmin}
                            onAddToCart={onAddToCart}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
