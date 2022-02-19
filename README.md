# Pickle App Frontend

Written from scratch, this will allow people to interact with the Pickle Protocol.

https://app.pickle.finance

## Development

This project uses [next-js](https://nextjs.org/) behind the scenes.

```
yarn
yarn dev
```

### Images

Images must be square, in PNG format. Ideally, 350x350px.
Rendered images are resized as necessary and returned in optimal
format (typically `webp`) by Next.js.

#### Tokens

1. Place the image under `/public/tokens` folder.
1. Name it so that it matches farm component returned from `pf-core`.
   E.g., if the farm component is named `usdc`, the filename will be `usdc.png`.
1. Add the dominant color of the image to `colors.ts`. E.g. `usdc: "#2775ca"`.

#### Protocols

1. Place the image under `/public/protocols` folder.
1. Name it so that it matches protocol returned from `pf-core`, with spaces removed
   and lower-cased. E.g., if the protocol is named `Uniswap v2`, the filename will
   be `uniswapv2.png`.
1. Add the dominant color of the image to `colors.ts`. E.g. `uniswapv2: "#ff007a"`.

### Localization

The only rule to keep in mind when translating locale files is
not to change the content inside `<>` and `{}` signs.
Parentheses `()` have no special meaning and their content
is meant to be translated.

For example:

```
// English
"yearly": "{{ percent }}% (yearly) <br /> <2>more info</2>",
// Slovak
"yearly": "{{ percent }}% (ročne) <br /> <2>viac informácií</2>",
```

Sometimes the order of words changes in the target language. If you
need to reorder a string, make sure you also move the wrapping tags:

```
// English
"apy": "<strong>{{ percent }}%</strong> <1>APY/1>",
// Slovak
"apy": "<1>Ročný výnos</1> <strong>{{ percent }}%</strong>",
```
