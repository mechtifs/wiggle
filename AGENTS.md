# AGENTS.md

## Commands

- `npm test` - Run unit tests with Mocha
- `npx mocha --require ./tests/mocks/gjs.js tests/**/*.test.js` - Alternative test command

## Architecture

- This is a GNOME extension written in JavaScript using the GJS framework
- The main entry point is `extension.js`
- Effects are implemented as separate classes extending `EffectBase`
- Two effect types exist: `MagnificationEffect` (cursor zoom) and `FindMouseEffect` (halo)
- Settings are managed via GSettings schema in `schemas/org.gnome.shell.extensions.wiggle.gschema.xml`

## Testing

- Tests use Mocha + Chai + Sinon
- Mock GJS modules in `tests/mocks/gjs.js` must be loaded before tests
- Test files are in the `tests/` directory with `.test.js` extension
- Node 24+ is used for testing (ESM modules)

## Build & Install

- Run `make install` to build and install the extension
- Requires GNOME 46 or later
- Extension UUID: `wiggle@mechtifs.github.com`

## Important Notes

- Do NOT commit `node_modules/` - it's in `.gitignore`
- The `wiggle` subdirectory is a git submodule (the original repo)
- Keep changes focused on the extension code, not test infrastructure
