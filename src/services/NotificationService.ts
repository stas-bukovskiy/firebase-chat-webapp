// src/services/NotificationService.ts
import {db, firebaseVapidKey, messaging} from '@/firebase'
import {getToken, onMessage, deleteToken} from 'firebase/messaging'
import {useCurrentUserStore} from "@/stores/current-user.ts";
import {doc, setDoc, deleteDoc} from "firebase/firestore";
import {nowToUTCTimestamp} from "@/utils/datetime.ts";

let token = '';

export async function unsubscribe(): Promise<boolean> {
    if (!token) {
        console.error('No token to unsubscribe')
        return false
    }

    try {
        await deleteToken(messaging, token)
        await deleteFCMToken(token)
        return true
    } catch (err) {
        console.error('Error deleting token:', err)
        return false
    }
}

function deleteFCMToken(token: string): Promise<void> {
    const userTokenRef = doc(db, 'users', useCurrentUserStore().username, 'tokens', token);
    return deleteDoc(userTokenRef)
}

export async function requestPermissionAndGetToken(): Promise<string | null> {
    try {
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
            return null
        }

        const vapidKey = firebaseVapidKey;
        token = await getToken(messaging, {vapidKey})
        if (!token) {
            console.error('No Instance ID token available. Request permission to generate one.')
            return null
        }

        await saveFCMToken(token);
        return token
    } catch (err) {
        console.error('Error retrieving FCM token:', err)
        return null
    }
}

function saveFCMToken(token: string): Promise<void> {
    const userTokenRef = doc(db, 'users', useCurrentUserStore().username, 'tokens', token);
    return setDoc(userTokenRef, {token: token, createdAt: nowToUTCTimestamp()}, {merge: true})
}

export function initializeMessageListener(callback: (payload: any) => void) {
    onMessage(messaging, (payload) => {
        console.log('Received foreground message: ', payload);
        callback(payload);
    });
}