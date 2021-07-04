module.exports = {
  async rewrites() {
    return [{ source: "/", destination: "/index.html" }];
  },
  future: {
    webpack5: true,
  },
};
