export default function CartModal({
    cart,
    deliveryType,
    deliveryAddress,
    comments,
    subtotal,
    submitting,
    onClose,
    onUpdateQuantity,
    onRemoveItem,
    onDeliveryTypeChange,
    onDeliveryAddressChange,
    onCommentsChange,
    onPlaceOrder,
}) {
    return (
        <div className="modal" onClick={onClose}>
            <div className="modal-content" onClick={(event) => event.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Mon Panier</h2>
                    <button type="button" className="close-modal" onClick={onClose}>
                        ×
                    </button>
                </div>
                <div className="modal-body">
                    {cart.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">🛒</div>
                            <p>Votre panier est vide</p>
                        </div>
                    ) : (
                        <>
                            {cart.map((item) => (
                                <div key={item.id} className="cart-item">
                                    <div className="cart-item-info">
                                        <div className="cart-item-name">{item.name}</div>
                                        <div className="cart-item-price">{Number(item.price).toFixed(2)}€ l'unité</div>
                                    </div>
                                    <div className="cart-item-actions">
                                        <div className="quantity-control">
                                            <button type="button" className="quantity-btn" onClick={() => onUpdateQuantity(item.id, -1)}>
                                                -
                                            </button>
                                            <span className="quantity-value">{item.quantity}</span>
                                            <button type="button" className="quantity-btn" onClick={() => onUpdateQuantity(item.id, 1)}>
                                                +
                                            </button>
                                        </div>
                                        <button type="button" className="remove-btn" onClick={() => onRemoveItem(item.id)}>
                                            Retirer
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <div className="delivery-options">
                                <div className="form-label">Mode de Réception</div>
                                <div className="radio-group">
                                    <label className="radio-label">
                                        <input
                                            type="radio"
                                            name="delivery_type"
                                            value="delivery"
                                            checked={deliveryType === 'delivery'}
                                            onChange={(event) => onDeliveryTypeChange(event.target.value)}
                                        />
                                        <span>🚚 Livraison</span>
                                    </label>
                                    <label className="radio-label">
                                        <input
                                            type="radio"
                                            name="delivery_type"
                                            value="takeaway"
                                            checked={deliveryType === 'takeaway'}
                                            onChange={(event) => onDeliveryTypeChange(event.target.value)}
                                        />
                                        <span>📦 À emporter</span>
                                    </label>
                                </div>
                            </div>

                            {deliveryType === 'delivery' && (
                                <div className="form-group">
                                    <label className="form-label">Adresse de Livraison</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Numéro, rue, ville, code postal"
                                        value={deliveryAddress}
                                        onChange={(event) => onDeliveryAddressChange(event.target.value)}
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">Commentaires & Instructions</label>
                                <textarea
                                    className="form-input"
                                    placeholder="Allergies, préférences, instructions de livraison..."
                                    value={comments}
                                    onChange={(event) => onCommentsChange(event.target.value)}
                                />
                            </div>
                        </>
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="cart-total">
                        <div className="total-row">
                            <span className="total-label">Total à Payer</span>
                            <span className="total-amount">{subtotal.toFixed(2)}€</span>
                        </div>
                        <button
                            type="button"
                            className="btn btn-primary full-width"
                            onClick={onPlaceOrder}
                            disabled={submitting || (deliveryType === 'delivery' && !deliveryAddress.trim())}
                        >
                            {submitting ? 'Validation...' : 'Valider la Commande'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
