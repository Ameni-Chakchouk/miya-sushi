import OrderCard from './OrderCard';

export default function OrdersPage({ orders, onNavigateMenu }) {
    return (
        <div className="container">
            <h2 className="section-title">Mes Commandes</h2>
            <p className="section-subtitle">Suivez l'état de vos commandes en temps réel</p>
            {orders.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📦</div>
                    <p>Vous n'avez pas encore passé de commande</p>
                    <button type="button" className="btn btn-primary empty-state-button" onClick={onNavigateMenu}>
                        Commander Maintenant
                    </button>
                </div>
            ) : (
                <div className="order-list">
                    {orders.map((order) => (
                        <OrderCard key={order.id} order={order} />
                    ))}
                </div>
            )}
        </div>
    );
}
