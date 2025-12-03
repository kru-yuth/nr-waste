import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    signInWithPopup,
    GoogleAuthProvider,
    signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children, config = {} }) {
    const {
        domain = 'nr.ac.th',
        requireWhitelist = true,
        userCollection = 'users'
    } = config;

    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    async function login() {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({
            hd: domain // Hint to Google to prioritize this domain
        });

        try {
            setError('');
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Strict Domain Check
            if (!user.email.endsWith(`@${domain}`)) {
                await signOut(auth);
                throw new Error(`Access restricted to @${domain} domain only.`);
            }

            // Check if User is Whitelisted (exists in Firestore)
            if (requireWhitelist) {
                const userRef = doc(db, userCollection, user.uid);
                const userSnap = await getDoc(userRef);

                if (!userSnap.exists()) {
                    // User not in whitelist - deny access
                    await signOut(auth);
                    throw new Error('คุณยังไม่ได้รับอนุญาตให้เข้าใช้งานระบบ กรุณาติดต่อผู้ดูแลระบบ');
                }

                // User is whitelisted - set role
                setUserRole(userSnap.data().role);
            } else {
                // If whitelist not required, check if user exists to get role, otherwise default
                const userRef = doc(db, userCollection, user.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    setUserRole(userSnap.data().role);
                } else {
                    // Auto-create user record if not exists (optional, depending on requirements)
                    // For now, just set default role
                    setUserRole('user');
                }
            }

        } catch (err) {
            console.error("Login Error:", err);
            setError(err.message);
            throw err;
        }
    }

    function logout() {
        return signOut(auth);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                if (!user.email.endsWith(`@${domain}`)) {
                    await signOut(auth);
                    setCurrentUser(null);
                    setUserRole(null);
                    setLoading(false);
                    return;
                }

                if (requireWhitelist) {
                    // Check if user is whitelisted
                    try {
                        const userRef = doc(db, userCollection, user.uid);
                        const userSnap = await getDoc(userRef);

                        if (!userSnap.exists()) {
                            // User not in whitelist - sign them out
                            await signOut(auth);
                            setCurrentUser(null);
                            setUserRole(null);
                            setLoading(false);
                            return;
                        }

                        // User is whitelisted
                        setCurrentUser(user);
                        setUserRole(userSnap.data().role);
                    } catch (e) {
                        console.error("Error fetching user data:", e);
                        await signOut(auth);
                        setCurrentUser(null);
                        setUserRole(null);
                    }
                } else {
                    // No whitelist required
                    setCurrentUser(user);
                    try {
                        const userRef = doc(db, userCollection, user.uid);
                        const userSnap = await getDoc(userRef);
                        if (userSnap.exists()) {
                            setUserRole(userSnap.data().role);
                        } else {
                            setUserRole('user');
                        }
                    } catch (e) {
                        console.error("Error fetching role:", e);
                        setUserRole('user');
                    }
                }
            } else {
                setCurrentUser(null);
                setUserRole(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, [domain, requireWhitelist, userCollection]);

    const value = {
        currentUser,
        userRole,
        login,
        logout,
        error
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
