export interface AvatarBadgeBorderColors {
    color: string;
    hoverColor: string;
}

export const DEFAULT_BADGE_COLORS: AvatarBadgeBorderColors = {
    color: "var(--cs-badge-default-bg-color)",
    hoverColor: "var(--cs-badge-current-bg-color)"
}

export const CARD_BADGE_COLORS: AvatarBadgeBorderColors = {
    color: "var(--cs-card-bg-color)",
    hoverColor: "var(--cs-badge-current-bg-color)"
}

export const SUB_CARD_BADGE_COLORS: AvatarBadgeBorderColors = {
    color: "var(--cs-sub-card-bg-color)",
    hoverColor: "var(--cs-badge-current-bg-color)"
}

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
            border: "3px solid var(--cs-badge-default-bg-color)",
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
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            border: "4px solid var(--cs-badge-default-bg-color)",
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
            border: "5px solid var(--cs-badge-default-bg-color)",
        }
    }],
]);