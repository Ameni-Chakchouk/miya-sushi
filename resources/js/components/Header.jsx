export default function Header({
    currentPage,
    isLoggedIn,
    isAdmin,
    user,
    onNavigate,
    onOpenAuth,
    onLogout,
}) {
    return (
        <header className="header">
            <div className="header-content">
                <button
                    type="button"
                    className="logo"
                    aria-label="Miya Sushi - retour a l'accueil"
                    onClick={() => onNavigate('home')}
                >
                    <img
                        className="logo-img"
                        src="/images/logo-miya-sushi.png"
                        alt="Miya Sushi"
                    />
                </button>
                <nav className="nav">
                    <button
                        type="button"
                        className={currentPage === 'home' ? 'nav-link active nav-button' : 'nav-link nav-button'}
                        onClick={() => onNavigate('home')}
                    >
                        Accueil
                    </button>
                    <button
                        type="button"
                        className={currentPage === 'menu' ? 'nav-link active nav-button' : 'nav-link nav-button'}
                        onClick={() => onNavigate('menu')}
                    >
                        Menu
                    </button>
                    {isLoggedIn && !isAdmin && (
                        <button
                            type="button"
                            className={currentPage === 'orders' ? 'nav-link active nav-button' : 'nav-link nav-button'}
                            onClick={() => onNavigate('orders')}
                        >
                            Mes Commandes
                        </button>
                    )}
                    {isAdmin && (
                        <button
                            type="button"
                            className={currentPage === 'admin' ? 'nav-link active nav-button' : 'nav-link nav-button'}
                            onClick={() => onNavigate('admin')}
                        >
                            Admin Panel
                        </button>
                    )}
                </nav>
                <div className="auth-buttons">
                    {isLoggedIn ? (
                        <>
                            <div className="user-info">
                                <span className="user-icon">👤</span>
                                {user.name}
                                {isAdmin && <span className="admin-badge">Admin</span>}
                            </div>
                            <button type="button" className="btn btn-secondary" onClick={onLogout}>
                                Déconnexion
                            </button>
                        </>
                    ) : (
                        <button type="button" className="btn btn-primary" onClick={onOpenAuth}>
                            Connexion
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
