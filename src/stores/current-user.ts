import {defineStore} from 'pinia'
import {doc, getDoc, collection, query, where, getDocs} from "firebase/firestore";
import {db} from "@/firebase";
import {UserProfileEntity} from "@/services/entities.ts";

export const useCurrentUserStore = defineStore('currentUser', {
    state: () => ({
        currentUser: null,
    }),
    getters: {
        isEmpty() {
            return !this.currentUser.id
        },
        isNotCompleted() {
            return !this.currentUser.firstName
        },
        id() {
            return this.currentUser.id
        },
        username() {
            return this.currentUser.username
        },
    },
    actions: {
        async fetchUserByEmail(email: string) {
            if (this.user?.email === email) {
                return this.user
            }

            const userQuery = query(collection(db, "users"), where("email", "==", email))
                .withConverter(UserProfileEntity.converter);
            const querySnapshot = await getDocs(userQuery);
            if (querySnapshot.size === 0) {
                return null
            } else {
                const doc = querySnapshot.docs[0];
                const user = doc.data();

                this.currentUser = user;
                return user
            }
        },
        setUser(user: UserProfileEntity) {
            this.currentUser = user
        },
    },
})