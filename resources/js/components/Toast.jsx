export default function Toast({ toast, onClose }) {
    if (!toast) {
        return null;
    }

    return (
        <div className={`toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
            <div>{toast.message}</div>
            <button type="button" className="toast-close" onClick={onClose}>
                OK
            </button>
        </div>
    );
}
