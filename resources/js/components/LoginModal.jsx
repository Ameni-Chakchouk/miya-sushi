import { useEffect, useState } from 'react';

const loginDefaults = {
    email: '',
    password: '',
};

const registerDefaults = {
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    password_confirmation: '',
};

export default function LoginModal({
    mode,
    submitting,
    onClose,
    onModeChange,
    onLogin,
    onRegister,
}) {
    const [loginForm, setLoginForm] = useState(loginDefaults);
    const [registerForm, setRegisterForm] = useState(registerDefaults);

    useEffect(() => {
        setLoginForm(loginDefaults);
        setRegisterForm(registerDefaults);
    }, [mode]);

    const handleLoginSubmit = async (event) => {
        event.preventDefault();
        await onLogin(loginForm);
    };

    const handleRegisterSubmit = async (event) => {
        event.preventDefault();
        await onRegister(registerForm);
    };

    return (
        <div className="modal" onClick={onClose}>
            <div className="modal-content" onClick={(event) => event.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{mode === 'login' ? 'Connexion' : 'Créer un compte'}</h2>
                    <button type="button" className="close-modal" onClick={onClose}>
                        ×
                    </button>
                </div>
                <div className="modal-body">
                    <div className="auth-mode-switch">
                        <button
                            type="button"
                            className={mode === 'login' ? 'tab active' : 'tab'}
                            onClick={() => onModeChange('login')}
                        >
                            Se connecter
                        </button>
                        <button
                            type="button"
                            className={mode === 'register' ? 'tab active' : 'tab'}
                            onClick={() => onModeChange('register')}
                        >
                            S'inscrire
                        </button>
                    </div>

                    {mode === 'login' ? (
                        <form onSubmit={handleLoginSubmit}>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder="votre@email.com"
                                    value={loginForm.email}
                                    onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Mot de passe</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="••••••••"
                                    value={loginForm.password}
                                    onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary full-width" disabled={submitting}>
                                {submitting ? 'Connexion...' : 'Se connecter'}
                            </button>
                            <p className="form-hint">Admin: admin@gmail.com / 123</p>
                        </form>
                    ) : (
                        <form onSubmit={handleRegisterSubmit}>
                            <div className="form-group">
                                <label className="form-label">Nom</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={registerForm.name}
                                    onChange={(event) => setRegisterForm((current) => ({ ...current, name: event.target.value }))}
                                    required
                                />
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        value={registerForm.email}
                                        onChange={(event) => setRegisterForm((current) => ({ ...current, email: event.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Téléphone</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={registerForm.phone}
                                        onChange={(event) => setRegisterForm((current) => ({ ...current, phone: event.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Adresse</label>
                                <textarea
                                    className="form-input"
                                    value={registerForm.address}
                                    onChange={(event) => setRegisterForm((current) => ({ ...current, address: event.target.value }))}
                                    placeholder="Numéro, rue, ville, code postal"
                                />
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Mot de passe</label>
                                    <input
                                        type="password"
                                        className="form-input"
                                        value={registerForm.password}
                                        onChange={(event) => setRegisterForm((current) => ({ ...current, password: event.target.value }))}
                                        minLength={8}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Confirmation</label>
                                    <input
                                        type="password"
                                        className="form-input"
                                        value={registerForm.password_confirmation}
                                        onChange={(event) => setRegisterForm((current) => ({ ...current, password_confirmation: event.target.value }))}
                                        minLength={8}
                                        required
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary full-width" disabled={submitting}>
                                {submitting ? 'Création...' : 'Créer mon compte'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
