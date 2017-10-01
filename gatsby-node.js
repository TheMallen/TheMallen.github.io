const _ = require("lodash")
const Promise = require("bluebird")
const path = require("path")
const select = require(`unist-util-select`)
const fs = require(`fs-extra`)

exports.modifyWebpackConfig = ({ config }) => {
  // copied from
  // https://gi thub.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/utils/webpack.config.js
  // we remove `svg` from url-loader
  config.loader(`url-loader`, {
    test: /\.(jpg|jpeg|png|gif|mp4|webm|wav|mp3|m4a|aac|oga)(\?.*)?$/,
    loader: `url`,
    query: {
      limit: 10000,
      name: `static/[name].[hash:8].[ext]`,
    },
  })

  config.loader('svg', {
    test: /\.svg$/,
    loaders: [
      '@shopify/images/icon-loader',
      'image-webpack-loader',
    ],
  })

  return config
}

exports.createPages = ({ graphql, boundActionCreators }) => {
  const { createPage } = boundActionCreators

  return new Promise((resolve, reject) => {
    const pages = []
    const blogPost = path.resolve("./src/templates/blog-post.js")
    resolve(
      graphql(
        `
      {
        allMarkdownRemark(limit: 1000) {
          edges {
            node {
              frontmatter {
                path
              }
            }
          }
        }
      }
    `
      ).then(result => {
        if (result.errors) {
          console.log(result.errors)
          reject(result.errors)
        }

        // Create blog posts pages.
        _.each(result.data.allMarkdownRemark.edges, edge => {
          createPage({
            path: edge.node.frontmatter.path,
            component: blogPost,
            context: {
              path: edge.node.frontmatter.path,
            },
          })
        })
      })
    )
  })
}
