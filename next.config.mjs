/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // 静的書き出し → out/ を Cloudflare Pages に置くだけ
  images: { unoptimized: true },
};
export default nextConfig;
