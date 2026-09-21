function getStatusLabel(order, admin) {
    if (admin) {
        if (order.status === 'pending') {
            return 'En attente';
        }

        if (order.status === 'accepted') {
            return 'Acceptée';
        }

        if (order.status === 'rejected') {
            return 'Refusée';
        }
    }

    return order.status_label;
}

function getStatusClass(order) {
    if (order.status === 'accepted') {
        return 'status-completed';
    }

    if (order.status === 'rejected' || order.status === 'cancelled') {
        return 'status-rejected';
    }

    return 'status-pending';
}

export default function OrderCard({ order, admin = false, actionLoadingId = null, onAccept, onReject }) {
    return (
        <div className="order-card">
            <div className="order-header">
                <div>
                    <div className="order-number">Commande {order.order_number}</div>
                    <div className="order-meta">
                        {order.created_at_display}
                        {admin && order.customer ? ` - ${order.customer.email}` : ''}
                    </div>
                </div>
                <div className={`order-status ${getStatusClass(order)}`}>{getStatusLabel(order, admin)}</div>
            </div>

            <div>
                {order.items.map((item) => (
                    <div key={item.id} className="order-item-row">
                        <strong>{item.product_name}</strong> x{item.quantity} - {Number(item.line_total).toFixed(2)}€
                    </div>
                ))}
            </div>

            <div className="order-summary">
                <div className="order-summary-grid">
                    <div>
                        <strong>Type:</strong> {order.delivery_type === 'delivery' ? '🚚 Livraison' : '📦 À emporter'}
                    </div>
                    <div className="order-total-highlight">
                        <strong>Total: {Number(order.total).toFixed(2)}€</strong>
                    </div>
                </div>

                {order.delivery_address && (
                    <div className="order-extra-line">
                        <strong>Adresse:</strong> {order.delivery_address}
                    </div>
                )}

                {order.comments && (
                    <div className="order-extra-line">
                        <strong>Commentaire:</strong> {order.comments}
                    </div>
                )}

                {admin && order.status === 'pending' && (
                    <div className="order-actions">
                        <button
                            type="button"
                            className="btn btn-success"
                            onClick={() => onAccept(order.id)}
                            disabled={actionLoadingId === order.id}
                        >
                            {actionLoadingId === order.id ? 'Mise à jour...' : 'Accepter la commande'}
                        </button>
                        <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => onReject(order.id)}
                            disabled={actionLoadingId === order.id}
                        >
                            {actionLoadingId === order.id ? 'Mise à jour...' : 'Refuser la commande'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
