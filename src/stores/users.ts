import {defineStore} from 'pinia'
import {reactive} from "vue";
import {doc} from "firebase/firestore";
import {db} from "@/firebase";
import {UserProfileEntity} from "@/services/entities.ts";
import {useDocument} from "vuefire";

export const useUserStore = defineStore('users', {
    state: () => ({
        users: reactive(new Map<string, UserProfileEntity>()),
    }),
    getters: {
        getByUsername: state => {
            return (username: string) => {
                return state.users.get(username);
            }
        },
        getUsers: state => {
            return Array.from(state.users.values());
        }
    },
    actions: {
        fetchByUsername(username: string) {
            if (!this.users.has(username)) {
                const userRef = doc(db, "users", username).withConverter(UserProfileEntity.converter);
                const userSnap = useDocument(userRef);
                this.users.set(username, userSnap);
            }

            return this.users.get(username);
        },
    },
})