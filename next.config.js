module.exports = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/gallery',
        permanent: true,
      },
    ]
  },
}