export default () => ({
  proxy: {
    protocol: process.env.PROXY_PROTOCOL,
    host: process.env.PROXY_HOST,
    port: process.env.PROXY_PORT,
    username: process.env.PROXY_USERNAME,
    password: process.env.PROXY_PASSWORD,
  },
});
