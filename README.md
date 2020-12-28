# Stack Trace from Source Maps

Bundling and minifying javascript for the browser makes sense. It also makes sense to bundle and minify javascript intended for AWS Lambda Functions.
If you naively just zip your complete node_modules folder, your artifact can become huge and hit the size limit of 50MB pretty soon.
But with bundling and minifying comes the problem of unreadable stack traces.

This repo examines some approaches to get readable and useful stack traces.

## Sources

- [Source Map V3 Spec](https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit)
- [Mozilla source-map npm package](https://github.com/mozilla/source-map) (looks unsupported, no releases the last two years)
- [source-map-support npm package](https://github.com/mozilla/source-map) (caused infinite loops when decoding dynamodDb errors)
- [Article about native source map support in node](https://nodejs.medium.com/source-maps-in-node-js-482872b56116)
- [activate source-map support in node](https://nodejs.org/api/cli.html#cli_enable_source_maps)

## Notes

Esbuild generates source maps the contain the original source code, thwarting the goal of minifying the lambda artifact size.
The [nosource.js](nosource.js) helper script is needed to remove the source from the source map. We just want readable
stack traces from production, not source code debugging in production, so we don't need the source files.
With webpack, you can use the `nosource-source-map` to have the same effect, see https://webpack.js.org/configuration/devtool/#production

## Stack trace with unmodified Javascript

`node stack-trace.js`:

```
Error: dummy exception
    at /home/christian/Experiments/stack-trace.js:4:24
    at Array.map (<anonymous>)
    at throwDummyException (/home/christian/Experiments/stack-trace.js:3:9)
    at arrow (/home/christian/Experiments/stack-trace.js:10:20)
    at named (/home/christian/Experiments/stack-trace.js:16:9)
    at arrow (/home/christian/Experiments/stack-trace.js:11:10)
    at named (/home/christian/Experiments/stack-trace.js:16:9)
    at arrow (/home/christian/Experiments/stack-trace.js:11:10)
    at named (/home/christian/Experiments/stack-trace.js:16:9)
    at main (/home/christian/Experiments/stack-trace.js:20:9)
```

## Stack trace with transpiled and minified Typescript

`npm run minify && node index.js`:

```
Error: dummy exception
    at /home/christian/Experiments/index.js:1:53
    at Array.map (<anonymous>)
    at a (/home/christian/Experiments/index.js:1:30)
    at c (/home/christian/Experiments/index.js:1:112)
    at o (/home/christian/Experiments/index.js:1:161)
    at c (/home/christian/Experiments/index.js:1:116)
    at o (/home/christian/Experiments/index.js:1:161)
    at c (/home/christian/Experiments/index.js:1:116)
    at o (/home/christian/Experiments/index.js:1:161)
    at t (/home/christian/Experiments/index.js:1:193)
```

## Stack trace with transpiled and minified Typescript and enabled source map support

You need to [activate source-map support in node](https://nodejs.org/api/cli.html#cli_enable_source_maps) which was added in node v12.12.

`npm run minify && node --enable-source-maps index.js`:

```
Error: dummy exception
    at /home/christian/Experiments/stack-trace/index.js:1:53
        -> /home/christian/Experiments/stack-trace/stack-trace.ts:4:24
    at Array.map (<anonymous>)
    at a (/home/christian/Experiments/stack-trace/index.js:1:30)
        -> /home/christian/Experiments/stack-trace/stack-trace.ts:3:9
    at c (/home/christian/Experiments/stack-trace/index.js:1:112)
        -> /home/christian/Experiments/stack-trace/stack-trace.ts:10:20
    at o (/home/christian/Experiments/stack-trace/index.js:1:161)
        -> /home/christian/Experiments/stack-trace/stack-trace.ts:16:9
    at c (/home/christian/Experiments/stack-trace/index.js:1:116)
        -> /home/christian/Experiments/stack-trace/stack-trace.ts:11:10
    at o (/home/christian/Experiments/stack-trace/index.js:1:161)
        -> /home/christian/Experiments/stack-trace/stack-trace.ts:16:9
    at c (/home/christian/Experiments/stack-trace/index.js:1:116)
        -> /home/christian/Experiments/stack-trace/stack-trace.ts:11:10
    at o (/home/christian/Experiments/stack-trace/index.js:1:161)
        -> /home/christian/Experiments/stack-trace/stack-trace.ts:16:9
    at t (/home/christian/Experiments/stack-trace/index.js:1:193)
        -> /home/christian/Experiments/stack-trace/stack-trace.ts:20:9
```

Note that after each line in the stack trace there is an arrow `->` pointing to the location in the original source

## Stack trace esbuild --keep-names option

Now we have a stack trace that can be used to navigate to the source code.
For quick diagnosing it would be helpful to see the names of the called functions.
It may be a problem of the generated source map from esbuild, but adding the `--keep-names` option
makes the function names visible in the stack trace again.

`npm run keepnames && node --enable-source-maps index.js`:

```
Error: dummy exception
    at /home/christian/Experiments/stack-trace/index.js:1:128
        -> /home/christian/Experiments/stack-trace/stack-trace.ts:4:24
    at Array.map (<anonymous>)
    at throwDummyException (/home/christian/Experiments/stack-trace/index.js:1:105)
        -> /home/christian/Experiments/stack-trace/stack-trace.ts:3:9
    at arrow (/home/christian/Experiments/stack-trace/index.js:1:216)
        -> /home/christian/Experiments/stack-trace/stack-trace.ts:10:20
    at named (/home/christian/Experiments/stack-trace/index.js:1:274)
        -> /home/christian/Experiments/stack-trace/stack-trace.ts:16:9
    at arrow (/home/christian/Experiments/stack-trace/index.js:1:220)
        -> /home/christian/Experiments/stack-trace/stack-trace.ts:11:10
    at named (/home/christian/Experiments/stack-trace/index.js:1:274)
        -> /home/christian/Experiments/stack-trace/stack-trace.ts:16:9
    at arrow (/home/christian/Experiments/stack-trace/index.js:1:220)
        -> /home/christian/Experiments/stack-trace/stack-trace.ts:11:10
    at named (/home/christian/Experiments/stack-trace/index.js:1:274)
        -> /home/christian/Experiments/stack-trace/stack-trace.ts:16:9
    at main (/home/christian/Experiments/stack-trace/index.js:1:319)
        -> /home/christian/Experiments/stack-trace/stack-trace.ts:20:9
```
