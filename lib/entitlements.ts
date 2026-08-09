export const ENTITLEMENTS = {
    HEAT_INPUT_PREMIUM: "heat-input-premium",
    REMOVE_ADS: "remove-ads",
    SAVE_CALCULATIONS: "save-calculations",
    PDF_EXPORT: "pdf-export",
  } as const;
  
  export type Entitlement =
    (typeof ENTITLEMENTS)[keyof typeof ENTITLEMENTS];
  
  export function hasEntitlement(
    entitlements: readonly string[] | null | undefined,
    entitlement: Entitlement
  ): boolean {
    return entitlements?.includes(entitlement) ?? false;
  }
  
  export function hasAllEntitlements(
    entitlements: readonly string[] | null | undefined,
    requiredEntitlements: readonly Entitlement[]
  ): boolean {
    return requiredEntitlements.every((entitlement) =>
      hasEntitlement(entitlements, entitlement)
    );
  }