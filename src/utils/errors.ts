import type {NotificationApiInjection} from "naive-ui/es/notification/src/NotificationProvider";

export const UsernameAlreadyInUseError = "auth/username-already-in-use";
export const EmailAlreadyInUseError = "auth/email-already-in-use";
export const StorageObjectNotFoundError = "storage/object-not-found";

type ErrorDetail = {
    title: string;
    description: string;
}

const defaultErrorDetail: ErrorDetail = {
    title: "Something went wrong on our end.",
    description: "Please try again later or contact support if the problem persists.",
}

const errors: Map<string, ErrorDetail> = new Map([
    [EmailAlreadyInUseError, {
        title: "Email already in use",
        description: "Use another email address or try logging in."
    }],
    [UsernameAlreadyInUseError, {
        title: "Username already in use",
        description: "Please choose another username."
    }],
    ["auth/invalid-email", {
        title: "Invalid email",
        description: "Please enter a valid email address."
    }],
    ["auth/operation-not-allowed", {
        title: "Operation not allowed",
        description: "Please contact support to enable email/password accounts."
    }],
    ["auth/user-not-found", {
        title: "User not found",
        description: "Please check your email and try again."
    }],
    ["auth/invalid-credential", {
        title: "Invalid credential",
        description: "Please check your email and password."
    }]
]);

const notNotifyErrors: Set<string> = new Set([
    "storage/canceled",
]);

export function notifyError(notification: NotificationApiInjection, error: Error): void {
    const errorCode = error.code || error.message || error;
    if (notNotifyErrors.has(errorCode)) {
        return;
    }

    console.log("Error code:", error.code, " for ", error);
    const errorDetail = errors.get(errorCode) ?? defaultErrorDetail;
    notifyErrorDetail(notification, errorDetail);
}

export function notifyErrorDetail(notification: NotificationApiInjection, errorDetail: ErrorDetail): void {
    notification.error({
        title: errorDetail.title,
        description: errorDetail.description,
        duration: 5000,
    });
}