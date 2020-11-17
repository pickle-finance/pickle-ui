export enum Farm {
  P3CRV = "3poolCRV",
  PDAI = "pDAI",
  PRENCRV = "renBTCCRV",
}

export const POOL_IDs: { [key in Farm]: number } = {
  [Farm.PRENCRV]: 13,
  [Farm.P3CRV]: 14,
  [Farm.PDAI]: 16,
};
