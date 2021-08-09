const apiRoutesHost = () => {
  if (process.env.NODE_ENV === "development")
    return "http://localhost:3000/api";

  if (process.env.VERCEL_ENV === "preview")
    return `https://${process.env.VERCEL_URL}/api`;

  return `https://app.pickle.finance/api`;
};

/* eslint-env node */
module.exports = {
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    infura: "https://cloudflare-eth.com/",
    ethRPC: "https://cloudflare-eth.com/",
    polygonRPC:
      "https://speedy-nodes-nyc.moralis.io/a98d7a0d24a7ad8012eb933f/polygon/mainnet",
    Fortmatic: "pk_live_3754096A894BEFE4",
    Portis: "8f879477-6443-4f75-8e94-b44aee86a9f7",
    apiHost: "https://api.pickle.finance/prod",
    API_ROUTES_HOST: apiRoutesHost(),
  },
};
