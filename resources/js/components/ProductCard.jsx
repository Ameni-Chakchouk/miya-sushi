export default function ProductCard({ item, isLoggedIn, isAdmin, onAddToCart }) {
    const imageUrl = item.image_full_url || item.image_url;
    const buttonLabel = !isLoggedIn ? 'Connexion requise' : isAdmin ? 'Admin' : 'Ajouter';

    return (
        <div className={item.is_new ? 'menu-card new' : 'menu-card'}>
            <div className="menu-card-image" style={{ backgroundImage: `url(${imageUrl})` }} />
            <div className="menu-card-content">
                <h3 className="menu-card-title">{item.name}</h3>
                <p className="menu-card-description">{item.description}</p>
                <div className="menu-card-footer">
                    <span className="price">{Number(item.price).toFixed(2)}€</span>
                    <button
                        type="button"
                        className="add-to-cart"
                        onClick={() => onAddToCart(item)}
                        disabled={!isLoggedIn || isAdmin}
                    >
                        <span>{buttonLabel}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
