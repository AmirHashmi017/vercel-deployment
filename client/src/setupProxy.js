
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "https://api.duffel.com",
      changeOrigin: true,
      pathRewrite: {
        "^/api": "", // This will forward to https://api.duffel.com/air/offers
      },
      onProxyReq: (proxyReq, req, res) => {
        // proxyReq.setHeader("Authorization", "Bearer authentication");
        //For testing
        proxyReq.setHeader("Authorization", "Bearer authentication");
        proxyReq.setHeader("Duffel-Version", "v2");
        if (req.body) {
          // Ensure body is forwarded correctly if required
          proxyReq.setHeader("Content-Type", "application/json");
        }
      },
    })
  );
};

