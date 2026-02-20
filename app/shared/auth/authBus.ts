let logoutHandler: null | ((reason?: string) => void) = null;

export const setLogoutHandler = (fn: (reason?: string) => void) => {
    logoutHandler = fn;
};

export const triggerLogout = (reason?: string) => {
    if (reason) {
        sessionStorage.setItem('logout_reason', reason);
    } else {
        sessionStorage.removeItem('logout_reason');
    }

    if (logoutHandler) logoutHandler(reason);
};
