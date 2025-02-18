export const SIZE_CONFIGS = new Map([
    ["small", {
        avatar: {
            minWidth: "32px",
            width: "32px",
            minHeight: "32px",
            height: "32px",
            borderRadius: "8px"
        },
        avatarInitials: {
            fontSize: "0.8em"
        },
        badge: {
            top: "-3px",
            left: "24px",
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            border: "3px solid var(--cd-badge-border-color)",
        }
    }],
    ["default", {
        avatar: {
            minWidth: "46px",
            width: "46px",
            minHeight: "46px",
            height: "46px",
            borderRadius: "8px"
        },
        avatarInitials: {
            fontSize: "1.1em"
        },
        badge: {
            top: "-4px",
            left: "34px",
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            border: "3px solid var(--cd-badge-border-color)",
        }
    }],
    ["big", {
        avatar: {
            minWidth: "64px",
            width: "64px",
            minHeight: "64px",
            height: "64px",
            borderRadius: "10px"
        },
        avatarInitials: {
            fontSize: "1.6em"
        },
        badge: {
            top: "-5px",
            left: "50px",
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            border: "4px solid var(--cd-badge-border-color)",
        }
    }],
]);