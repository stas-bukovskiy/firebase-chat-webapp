import {defineStore} from 'pinia'
import {reactive} from "vue";
import {doc, getDoc, collection, query, where, getDocs} from "firebase/firestore";
import {db} from "@/firebase";

export const useUserStore = defineStore('user', {
    state: () => ({
        user: reactive({
            username: '',
            firstName: '',
            lastName: '',
            email: '',
            uid: '',
            createdAt: '',
        })
    }),
    getters: {
        isEmpty() {
            return !this.user.uid
        },
        isNotCompleted() {
            return !this.user.firstName
        }
    },
    actions: {
        async fetchUser(username: string) {
            const userRef = doc(db, "users", username);
            const userSnap = await getDoc(userRef);
            this.setUser(userSnap.data())
        },
        async fetchUserProfileByEmail(email: string) {
            if (this.user.email === email) {
                return this.user
            }

            const q = query(collection(db, "users"), where("email", "==", email));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.size === 0) {
                return null
            } else {
                const doc = querySnapshot.docs[0];
                const user = doc.data();
                this.setUser(user);
                return user
            }
        },
        setUser(user: { firstName: string, lastName: string, email: string, uid: string, createdAt: string }) {
            this.user.uid = user.uid
            this.user.firstName = user.firstName
            this.user.lastName = user.lastName
            this.user.email = user.email
            this.user.createdAt = user.createdAt
        },
    },
})