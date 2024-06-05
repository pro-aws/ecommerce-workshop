/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = nextConfig;

// TODO: #9 Nothing to see in here, but I can't add comments
// to JSON files and I wanted to point out that in `package.json`
// you'll notice that the `dev` script looks like this:
//
//  "scripts": {
//      "dev": "sst dev next dev",
//      ...
//  }
//
// This is basically running `next dev` "inside" of an `sst dev`
// session, and this is needed to support the `Resource` linking
// we just went over.
