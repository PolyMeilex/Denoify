# Denoify
# WIP!
Simple node typescript to deno transpiler.

I have a tone of platform-agnostic ts code and the only thing that stops it from working are import statements so here it is... the automatic converter of imports for deno.

TODO:
- [x] Path transpiler
    - [ ] Make it nice an clean xd
- [ ] Simple compile time conditions
    - Simple system for conditionally adding deno specific code, for example swapping http get methods


### Example Input
`./index.ts:`
```ts
import a from "./a";
import b from "./b";
```
`./a.ts`
```
export const a = 5;
export default a;
```
`./b/index.ts`
```
export const b = 5;
export default b;
```

### Will Output
`./index.ts:`
```ts
import a from "./a.ts";
import b from "./b/index.ts";
```