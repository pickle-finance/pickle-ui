export const GET_FUCKED = "not here anymore";

import { PickleCore } from "./usePickleCore";

export const isUsdc = (jarTokenAddress: string) => {
    return jarTokenAddress.toLowerCase() === "0xEB801AB73E9A2A482aA48CaCA13B1954028F4c94".toLowerCase();
};
