export type EnvironmentItemMissing = { key: string, alt: string, present: false };
export type EnvironmentItemPresent = { key: string, alt: string, present: true, current: string };