import {onDocumentWrittenWithAuthContext} from "firebase-functions/v2/firestore";
import {beforeUserSignedIn} from "firebase-functions/v2/identity";
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from "firebase-admin/firestore";

const db = getFirestore()

export const setTokenClaimsBeforeUserSignedIn = beforeUserSignedIn(async (event): Promise<any> => {
    if (event.credential && event.credential.claims) {
        const username = await getUsernameByUid(event.data?.uid)
        if (!username) {
            console.log("No username found for uid", event.data?.uid);
            return {};
        }

        return {
            customClaims: {
                username: username,
            }
        };
    }
});


export const setTokenClaimsAfterUserUpdate = onDocumentWrittenWithAuthContext("users/{username}",
    async (event) => {
        if (event.type === "removed") {
            const username = event.params.username;
            await db.doc(`metadata/${username}/refreshTime`).delete();
            console.log("User deleted, removed refreshTime for user", username);
            return;
        }

        const snapshot = event.data?.after;
        if (!snapshot) {
            console.log("No data associated with the event");
            return;
        }

        const data = snapshot.data();
        console.log("ddata", data);
        if (!data) {
            console.log("No data associated with the event");
            return;
        }

        const snapshotBefore = event.data?.before;
        if (snapshotBefore) {
            const dataBefore = snapshotBefore.data();
            if (dataBefore && data.username === dataBefore.username) {
                console.log("Username has not changed, skipping");
                return;
            }
        }

        const userId = data.uid;
        if (!userId) {
            console.log("No userId associated with the event");
            return;
        }

        try {
            const customClaims = {
                username: event.params.username,
            }

            await getAuth().setCustomUserClaims(userId, customClaims);
            console.log("Custom claims set for user", userId, customClaims);
        } catch (error) {
            console.log("Error setting custom claims for user", userId, error);
        }

        // update the refresh time for the user to prompt the client to refresh the token
        await db.doc(`refreshTime/${event.params.username}`).set({
            refreshTime: Math.floor(Date.now() + 1000 * 60 * 3), // 3 minutes
        }, {
            merge: true
        });
    });

const getUsernameByUid = async (uid: string | undefined) => {
    if (!uid) {
        console.log("No uid provided");
        return null;
    }

    const userSnap = await db.collection("users").where("uid", "==", uid).get();
    if (userSnap.empty) {
        console.log("No user found with uid", uid);
        return null;
    }

    const userDoc = userSnap.docs[0];
    const username = userDoc.data()?.username;
    if (!username) {
        console.log("No username found for uid", uid);
        return null;
    }

    return username;

}