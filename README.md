# Pickle App Frontend

Written from scratch, this will allow people to interact with the Pickle Protocol.

https://app.pickle.finance

## Development

This project uses [next-js](https://nextjs.org/) behind the scenes.

```
yarn
yarn dev
```

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
