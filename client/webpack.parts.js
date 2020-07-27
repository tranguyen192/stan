const PurifyCSSPlugin = require("purifycss-webpack")

exports.purifyCSS = ({ paths }) => ({
  plugins: [new PurifyCSSPlugin({ paths })],
})
