import {defineStore} from 'pinia'
import {collection, getDocs, onSnapshot, query, where, doc, setDoc} from "firebase/firestore";
import {db} from "@/firebase";
import {UserProfileEntity} from "@/models/entities.ts";
import {notifyError} from "@/utils/errors.ts";
import {useNotification} from "naive-ui";
import {reactive} from "vue";
import type {User} from "@firebase/auth";

export const useCurrentUserStore = defineStore('currentUser', {
    state: () => ({
        currentUser: reactive(new UserProfileEntity())
    }),
    getters: {
        user() {
            return this.currentUser
        },
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
            if (this.user?.email === email && this.user?.id) {
                console.log("User already fetched");
                return this.user
            }

            const userQuery = query(collection(db, "users"), where("email", "==", email))
                .withConverter(UserProfileEntity.converter);
            const querySnapshot = await getDocs(userQuery);
            if (querySnapshot.size === 0) {
                return null
            } else {
                const doc = querySnapshot.docs[0];
                this.setUser(doc.data() as UserProfileEntity);
            }

            onSnapshot(userQuery, (snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === "added") {
                        this.setUser(change.doc.data() as UserProfileEntity);
                    } else if (change.type === "modified") {
                        this.setUpdatedUser(change.doc.data() as UserProfileEntity);
                    }
                });
            }, error => {
                notifyError(useNotification(), error)
            })

            return this.currentUser;
        },
        async setUserIsOnline(isOnline: boolean) {
            const userRef = doc(db, "users", this.currentUser.id);
            await setDoc(userRef, {
                isOnline: isOnline
            }, {merge: true}).catch((error) => {
                notifyError(useNotification(), error)
            })
        },
        setUser(user: UserProfileEntity) {
            this.currentUser.id = user.id
            this.currentUser.uid = user.uid
            this.currentUser.email = user.email
            this.currentUser.firstName = user.firstName
            this.currentUser.lastName = user.lastName
            this.currentUser.username = user.username
            this.currentUser.photoUrl = user.photoUrl
            this.currentUser.createdAt = user.createdAt
            
            this.currentUser.isOnline = true
        },
        setRawUser(user: User | null) {
            if (!user) {
                return
            }

            this.currentUser.uid = user.uid
            this.currentUser.email = user.email
            this.currentUser.username = user.displayName
            this.currentUser.photoUrl = user.photoURL
        },
        setUpdatedUser(updatedUser: UserProfileEntity) {
            this.currentUser.firstName = updatedUser.firstName
            this.currentUser.lastName = updatedUser.lastName
            this.currentUser.username = updatedUser.username
            this.currentUser.photoUrl = updatedUser.photoUrl
        }
    },
})