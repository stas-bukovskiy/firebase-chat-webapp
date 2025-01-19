
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