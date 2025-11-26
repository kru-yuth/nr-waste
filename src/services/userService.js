import {
    collection,
    doc,
    setDoc,
    getDocs,
    deleteDoc,
    query,
    where
} from "firebase/firestore";
import { db } from "../firebase";

const COLLECTION_NAME = "users";

export const userService = {
    // Create or Update a user (Admin only function ideally, but used during login for creation)
    createUser: async (uid, userData) => {
        try {
            await setDoc(doc(db, COLLECTION_NAME, uid), {
                ...userData,
                updatedAt: new Date()
            }, { merge: true });
        } catch (error) {
            console.error("Error creating/updating user: ", error);
            throw error;
        }
    },

    // Get all users (Admin only)
    getAllUsers: async () => {
        try {
            const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error getting users: ", error);
            throw error;
        }
    },

    // Delete user (Firestore record only - Auth deletion requires Admin SDK or Cloud Functions)
    deleteUserRecord: async (uid) => {
        try {
            await deleteDoc(doc(db, COLLECTION_NAME, uid));
        } catch (error) {
            console.error("Error deleting user record: ", error);
            throw error;
        }
    },

    // Update user role
    updateUserRole: async (uid, newRole) => {
        try {
            await setDoc(doc(db, COLLECTION_NAME, uid), {
                role: newRole,
                updatedAt: new Date()
            }, { merge: true });
        } catch (error) {
            console.error("Error updating user role: ", error);
            throw error;
        }
    }
};
