import fetch from "node-fetch";

const pickleApi = process.env.apiHost;
const getJarChartData = async (asset) => {
  return await fetch(`${pickleApi}/chart/jar/${asset}?count=4400`).then((response) =>
    response.json(),
  );
};

export const getJarChart = async (assets) => {
  const jarData = assets.map(async (asset) => {
    const assetKey = asset.toLowerCase();
    const ret = {
      asset: asset,
      data: await getJarChartData(assetKey),
    };
    return ret;
  });
  const waited = await Promise.all(jarData);
  return waited;
};

export const getAllJarsChart = async () => {
  const alljarsData = await getJarChartData("alljars");
  const jarData = Object.keys(alljarsData).map((assetName) => {
    return { asset: assetName, data: alljarsData[assetName] };
  });

  return jarData;
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
  return await fetch(`${pickleApi}/protocol/jar/${asset}/performance`).then((response) =>
    response.json(),
  );
};

export const getUserEarnings = async (userId) => {
  return await fetch(`${pickleApi}/protocol/earnings/${userId}`).then((response) => {
    if (response.status === 404) {
      return undefined;
    }
    return response.json();
  });
};

export const getProtocolData = async () => {
  return await fetch(`${pickleApi}/protocol/value?tokens=true`).then((response) => response.json());
};

export const getFarmData = async () => {
  return await fetch(`${pickleApi}/protocol/farm`).then((response) => response.json());
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
  return await fetch(`${coingeckoApi}/coins/${coin}`).then((response) => response.json());
};

export const getPickleCore = async () => {
  return await fetch(`${pickleApi}/protocol/pfcore/`).then((response) => response.json());
};
