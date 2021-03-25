# Replay Benchmarks

Compare performance of two different versions of Replay.

This assumes that sibling directories have different versions of the Replay repository like this:

```
> ls ..
replay
replay-benchmarks
replay-master
```

Where `replay-master` is a clone of Replay at the version you want to compare as your base. To use a different location, edit `"paths"` in `tsconfig.json`.

## Setup

```sh
# if using nix (sets Node version)
nix-shell

npm install

# Required for running `opt.js` (after running npm link in Replay)
npm link @replay/core
```

## Test replay-core

```
npm run core
```

## Check optimised / deoptimised code

This runs the code in `opt.js` to look at V8 code optimisations.

```
npm run opt
```
