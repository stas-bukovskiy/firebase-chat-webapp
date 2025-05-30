import {DocumentReference, getFirestore} from "firebase-admin/firestore";
import {onDocumentCreated, onDocumentUpdated} from "firebase-functions/firestore";

import {sendNotification} from "./notifications";
import {Chat, UPDATE_FROM} from "./models";
import {createSystemMessage, SYSTEM_MESSAGE} from "./system_messages";

const db = getFirestore()

export const onChatCreated = onDocumentCreated("chats/{chatId}", async (event) => {
    if (!event.data) {
        console.log("No data associated with the event");
        return;
    }

    const data = event.data.data() as Chat;
    if (!data.isGroup) {
        console.log("Not a group chat, skipping");
        return;
    }

    const chatId = event.params.chatId;

    await createSystemMessage(chatId, SYSTEM_MESSAGE.GROUP_CREATED, {
        groupName: data.groupName,
    })

    const members = data.members.filter(member => member.id !== data.createdBy.id);
    for (const member of members) {
        await createSystemMessage(chatId, SYSTEM_MESSAGE.GROUP_MEMBER_ADDED, {newMemberId: member.id});
        await createUserChat(chatId, member);
    }

    await sendNotification(chatId, members, data.createdBy, {
        notification: {
            title: data.groupName || '',
            body: "You have been added to the group chat",
        },
        data: {
            chatId,
            icon: data.groupImageUrl || '',
        },
    });
})

const createUserChat = async (chatId: string, userRef: DocumentReference) => {
    await db.doc(`userChats/${userRef.id}/chats/${chatId}`).set({
        chat: db.doc(`chats/${chatId}`),
        unreadCount: 1,
        isStarred: false,
        createdAt: Math.floor(Date.now())
    })
}

export const onChatUpdated = onDocumentUpdated("chats/{chatId}", async (event) => {
    if (!event.data) {
        console.log("No data associated with the event");
        return;
    }

    const oldData = event.data.before.data() as Chat;
    if (!oldData.isGroup) {
        console.log("Not a group chat, skipping");
        return;
    }

    const newData = event.data.after.data() as Chat;
    if (newData.metadata?.updatedFrom === UPDATE_FROM.LEAVE_GROUP) {
        console.log("Group updated from leaveGroup, skipping");
        return;
    }

    const chatId = event.params.chatId;

    if (oldData.groupName !== newData.groupName) {
        console.log("Group renamed", newData.groupName);
        await createSystemMessage(chatId, SYSTEM_MESSAGE.GROUP_RENAMED, {newGroupName: newData.groupName})
    }

    if (oldData.groupImageUrl !== newData.groupImageUrl) {
        console.log("Group image updated", newData.groupImageUrl);
        await createSystemMessage(chatId, SYSTEM_MESSAGE.GROUP_IMAGE_UPDATED, {newGroupImageUrl: newData.groupImageUrl})
    }

    const newMembers = newData.members.filter(newMember => {
        return (oldData.members.findIndex(oldMember => newMember.id === oldMember.id) === -1);
    })
    for (const member of newMembers) {
        console.log("Adding member", member.id);
        await createSystemMessage(chatId, SYSTEM_MESSAGE.GROUP_MEMBER_ADDED, {newMemberId: member.id});
        await createUserChat(chatId, member);
    }

    const removedMembers = oldData.members.filter(oldMember => {
        return (newData.members.findIndex(newMember => newMember.id === oldMember.id) === -1);
    })
    for (const member of removedMembers) {
        console.log("Removing member", member.id);
        await createSystemMessage(chatId, SYSTEM_MESSAGE.GROUP_MEMBER_REMOVED, {removedMemberId: member.id});
        await deleteUserChat(chatId, member);
    }
})

const deleteUserChat = async (chatId: string, userRef: DocumentReference) => {
    await db.doc(`userChats/${userRef.id}/chats/${chatId}`).delete();
}
