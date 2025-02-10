import {getFirestore} from "firebase-admin/firestore";
import {onCall, HttpsError, CallableRequest} from "firebase-functions/v2/https";
import {createSystemMessage, SYSTEM_MESSAGE} from "./system_messages";
import {Chat, UPDATE_FROM} from "./models";

const db = getFirestore()

interface LeaveGroupRequest {
    chatId: string
}

export const leaveGroup = onCall(
    {cors: [/firebase\.com$/, /localhost:\d{4}$/]},
    async (request: CallableRequest<LeaveGroupRequest>) => {
        const chatId = request.data.chatId
        if (!chatId) {
            throw new HttpsError("invalid-argument", "chatId and memberId are required");
        }

        // retrieve chat entity from firestore
        const chatRef = db.collection("chats").doc(chatId);
        const chatSnap = await chatRef.get();
        const chat = chatSnap.data() as Chat;
        if (!chat) {
            throw new HttpsError("not-found", "Chat not found");
        }

        // retrieve user entity from firestore
        const uid = request.auth?.uid;
        if (!uid) {
            throw new HttpsError("unauthenticated", "User must be authenticated");
        }

        console.log("uid", uid);

        const memberRef = db.collection("users").where("uid", "==", uid);
        const memberSnap = await memberRef.get();
        if (memberSnap.empty) {
            throw new HttpsError("not-found", "User not found");
        }
        const memberId = memberSnap.docs[0].id;
        console.log("memberId", memberId);

        // check if the user is a member of the chat
        const memberIndex = chat.members.findIndex(member => member.id === memberId);
        if (memberIndex === -1) {
            throw new HttpsError("not-found", "Member not found in the chat");
        }

        // remove the userChat associated with the user and chat
        await db.doc(`userChats/${memberId}/chats/${chatId}`).delete();
        // remove the user from the chat members
        await chatRef.update({
            members: chat.members.filter((member) => member.id !== memberId),
            metadata: {
                updatedFrom: UPDATE_FROM.LEAVE_GROUP
            }
        });
        // create a system message to notify the chat members
        await createSystemMessage(chatId, SYSTEM_MESSAGE.GROUP_MEMBER_LEFT, {leftMemberId: memberId})
    });