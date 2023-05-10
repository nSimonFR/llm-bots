# ServaTilis (Servum Utilis)

## Requirements for deployment

Edit `node_modules/wrangler/wrangler-dist/cli.js`
```js
external: ["__STATIC_CONTENT_MANIFEST"],
```
To:
```js
external: ["__STATIC_CONTENT_MANIFEST", "@dqbd/tiktoken"],
```