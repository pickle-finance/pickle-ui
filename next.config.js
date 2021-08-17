const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer({
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
  },
});
