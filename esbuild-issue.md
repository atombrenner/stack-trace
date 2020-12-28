#Add --nosources option for source maps

## Context

I am using esbuild to bundle and minify Typescript functions for AWS lambda.

`esbuild --bundle --minify --keep-names --sourcemap --platform=node --target=node12`

To get meaningful stack traces for exceptions in production, I use the `--sourcemap` and `--keep-names` options.
I use `NODE_OPTIONS=--enable-source-maps` to get a stack trace that uses the source map.
One problem is, that I have to use the `--keep-names` option to see the original function names in the stack trace.
I guess that it could be related to the missing `names` field in the generated source map, but I'm not an expert on this topic.

## Issue

The `--sourcemap` option adds the original source to the `sourcesContent`field
of the source map. This is not necessary for meaningful stack traces,
it can be an empty array `"sourcesContent": []`.

Adding the complete source to the source map thwarts the goal of making the AWS Lamda artifact small
as it doubles the size of the zip package (index.js + index.js.map) I need to upload to AWS Lambda.

I would like an esbuild option `--nosources` that prevent sources from being included in the source map.
Something similiar to the [webpack devtool option `nosources-source-map`](https://webpack.js.org/configuration/devtool/#production)

My current workaround is to postprocess the generated source map from esbuild.
