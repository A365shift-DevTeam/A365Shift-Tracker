/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../services/firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    function signup(email, password) {
        return createUserWithEmailAndPassword(auth, email, password);
    }

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password)
            .then((result) => {
                // Set login timestamp
                localStorage.setItem('auth_login_timestamp', Date.now().toString());
                return result;
            });
    }

    function logout() {
        localStorage.removeItem('auth_login_timestamp');
        return signOut(auth);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // Check for expiration
                const loginTime = localStorage.getItem('auth_login_timestamp');
                const ONE_HOUR = 60 * 60 * 1000;

                if (!loginTime || (Date.now() - parseInt(loginTime) > ONE_HOUR)) {
                    // Expired or invalid session
                    console.log('Session expired or invalid, logging out.');
                    logout();
                    setCurrentUser(null);
                } else {
                    // Valid session
                    setCurrentUser(user);
                }
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Periodic check for expiration (every minute)
    useEffect(() => {
        const interval = setInterval(() => {
            if (currentUser) {
                const loginTime = localStorage.getItem('auth_login_timestamp');
                const ONE_HOUR = 60 * 60 * 1000;
                if (loginTime && (Date.now() - parseInt(loginTime) > ONE_HOUR)) {
                    console.log('Session expired (periodic check), logging out.');
                    logout();
                }
            }
        }, 60000);

        return () => clearInterval(interval);
    }, [currentUser]);

    const value = {
        currentUser,
        signup,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
