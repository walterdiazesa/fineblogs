module.exports = {
  async rewrites() {
    return [{ source: "/", destination: "/index.html" }];
  },
  images: {
    domains: ["firebasestorage.googleapis.com", "lh3.googleusercontent.com"],
    deviceSizes: [640, 768, 1024, 1536],
  },
};
