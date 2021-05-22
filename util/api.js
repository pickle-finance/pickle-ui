import fetch from "node-fetch";

const pickleApi = "https://stkpowy01i.execute-api.us-west-1.amazonaws.com/prod";

export const getJarChart = async (assets) => {
  const jarData = assets.map(async (asset) => {
    const assetKey = asset.toLowerCase();
    return {
      asset: asset,
      data: await getJarChartData(assetKey),
    };
  });
  return await Promise.all(jarData);
};

const getJarChartData = async (asset) => {
  return await fetch(
    `${pickleApi}/chart/jar/${asset}?count=4400`,
  ).then((response) => response.json());
};

export const getStakingData = async () => {
  return await fetch(`${pickleApi}/protocol/reward`).then((response) =>
    response.json(),
  );
};

export const getStakingChart = async (assets) => {
  const stakingData = assets.map(async (asset) => {
    const assetKey = asset.toLowerCase();
    return {
      asset: asset,
      data: await getStakingChartData(assetKey),
    };
  });
  return await Promise.all(stakingData);
};

const getStakingChartData = async (asset) => {
  return await fetch(
    `${pickleApi}/chart/reward/${asset}?count=4400`,
  ).then((response) => response.json());
};

export const getPerformanceChart = async (assets) => {
  const performanceData = assets.map(async (asset) => {
    const assetKey = asset.toLowerCase();
    return {
      asset: asset,
      data: await getPerformanceChartData(assetKey.toLowerCase()),
    };
  });
  return await Promise.all(performanceData);
};

const getPerformanceChartData = async (asset) => {
  return await fetch(
    `${pickleApi}/chart/jar/${asset}/performance`,
  ).then((response) => response.json());
};

export const getPerformanceData = async (assets) => {
  const performanceData = assets.map(async (asset) => {
    const assetKey = asset.toLowerCase();
    return {
      asset: asset,
      ...(await getAssetPerformanceData(assetKey.toLowerCase())),
    };
  });
  return await Promise.all(performanceData);
};

export const getAssetPerformanceData = async (asset) => {
  return await fetch(
    `${pickleApi}/protocol/jar/${asset}/performance`,
  ).then((response) => response.json());
};

export const getUserEarnings = async (userId) => {
  return await fetch(`${pickleApi}/protocol/earnings/${userId}`).then(
    (response) => {
      if (response.status === 404) {
        return undefined;
      }
      return response.json();
    },
  );
};

export const getProtocolData = async () => {
  return await fetch(
    `${pickleApi}/protocol/value?tokens=true`,
  ).then((response) => response.json());
};

export const getFarmData = async () => {
  return await fetch(`${pickleApi}/protocol/farm`).then((response) =>
    response.json(),
  );
};

export const formatUsd = (value) => {
  let display = parseFloat(value.toFixed(2));
  if (display > 1000000) {
    display = `${(value / 1000000).toFixed(2)}MM`;
  } else if (display > 1000) {
    display = `${(value / 1000).toFixed(2)}K`;
  }
  return `$${display}`;
};

// api coingecko functions

const coingeckoApi = "https://api.coingecko.com/api/v3";

export const getCoinData = async (coin) => {
  return await fetch(`${coingeckoApi}/coins/${coin}`).then((response) =>
    response.json(),
  );
};
