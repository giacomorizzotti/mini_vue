# ci

What the GitHub workflow in `.github/workflows/build.yml` runs: a Vite build
of both barrels (`@/mini/components`, `@/mini/composables`) wired the way a
consuming project wires mini_vue, with no `vue-i18n` installed. The package
versions match jpm's.

To run it locally, use a copy outside the repo, so no `node_modules` or
symlink lands inside mini_vue (which projects link in as `src/mini`):

```bash
cp -r ci /tmp/mini-vue-ci && cd /tmp/mini-vue-ci
npm ci
mkdir -p src && ln -s /home/projects/mini/website/src/mini src/mini
npm run build
```
