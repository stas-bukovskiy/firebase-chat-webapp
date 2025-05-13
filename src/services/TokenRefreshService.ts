import {useCurrentUserStore} from "@/stores/current-user.ts";
import {watch} from "vue";
import {doc, onSnapshot} from "firebase/firestore";
import type {Unsubscribe} from "@firebase/firestore";
import {auth, db} from "@/firebase";


let unsubscribe: Unsubscribe = null;

export const subscribeToTokenRefresh = async (): Promise<void> => {
    const currentUserStore = useCurrentUserStore();

    // Subscribe to token refresh
    await subscribeToTokenRefreshHelper(currentUserStore.username);

    // Watch for changes in the username to re-subscribe
    watch(() => currentUserStore.username, async (newUsername) => {
        if (newUsername) {
            if (unsubscribe) {
                await unsubscribeFromTokenRefresh();
            }
            await subscribeToTokenRefreshHelper(newUsername);
        }
    }, {immediate: true});
}

export const unsubscribeFromTokenRefresh = () => {
    if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
    }
}

const subscribeToTokenRefreshHelper = async (username: string): Promise<void> => {
    const userRef = doc(db, "refreshTime", username);
    unsubscribe = onSnapshot(userRef, async (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.data();
            if (data && data.refreshTime) {
                const refreshTime = data.refreshTime;
                const currentTime = Math.floor(Date.now());
                if (refreshTime > currentTime) {
                    await auth.currentUser?.getIdToken(true);
                    console.log("Token refresh time updated");
                }
            }
        }
    });
    console.log("subscribeToTokenRefreshHelper");
}