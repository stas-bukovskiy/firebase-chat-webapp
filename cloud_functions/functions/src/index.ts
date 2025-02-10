import {initializeApp} from "firebase-admin/app";

initializeApp();

import {onMessageCreated as onMessageCreatedFunc} from "./messages";
import {onChatCreated as onChatCreatedFunc, onChatUpdated as onChatUpdatedFunc} from "./chats";
import {leaveGroup as leaveGroupFunc} from "./groups";
import {onUserChatDeleted as onChatDeletedFunc} from "./user_chats";

export const onMessageCreated = onMessageCreatedFunc;
export const onChatCreated = onChatCreatedFunc;
export const onChatUpdated = onChatUpdatedFunc;
export const onUserChatDeleted = onChatDeletedFunc;

export const leaveGroup = leaveGroupFunc;