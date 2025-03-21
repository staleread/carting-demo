import { ProxyAgent } from 'undici';

export default () => {
  const proxyHost = process.env.PROXY_HOST;
  const proxyPort = process.env.PROXY_PORT;
  const proxyUser = process.env.PROXY_USERNAME;
  const proxyPassword = process.env.PROXY_PASSWORD;

  const canCreateProxy = proxyHost && proxyPort && proxyUser && proxyPassword;

  const proxyAgent = canCreateProxy
    ? new ProxyAgent({
        uri: `https://${proxyHost}:${proxyPort}`,
        token: `Basic ${Buffer.from(`${proxyUser}:${proxyPassword}`).toString('base64')}`,
      })
    : undefined;

  return {
    dispatcher: proxyAgent,
  };
};
