import {initializeApp} from "firebase-admin/app";

initializeApp();

import {sendMessage as sendMessageFunc} from "./send_message";
import {createGroup as createGroupFunc, updateGroup as updateGroupFunc} from "./chats";

export const sendMessage = sendMessageFunc;
export const createGroup = createGroupFunc;
export const updateGroup = updateGroupFunc;