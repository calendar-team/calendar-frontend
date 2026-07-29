/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  experimental: {
    useTypeScriptCli: true,
  },
};

export default nextConfig;
