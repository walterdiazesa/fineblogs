module.exports = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/blog',
        permanent: true,
      },
    ]
  },
  future: {
    webpack5: true,
  }
}
