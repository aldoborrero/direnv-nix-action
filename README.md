# direnv-nix-action

![GitHub Actions badge](https://github.com/aldoborrero/direnv-nix-action/workflows/direnv-nix-action%20test/badge.svg)

This GitHub Action installs `direnv` using Nix and sources all `.envrc`
variables to prepare them for use in the environment.

## Requirements

- Nix must be pre-installed on the Github Actions runner.

## Inputs

Specify inputs using the `with:` keyword in your workflow file:

- `use_nix_profile`: Optional. Set to `true` to use the `nix profile` command
  instead of `nix-env` for installing `direnv`. The default is `false`.

## Outputs

This action produces no outputs.

## Usage

Below is an example of how to use `direnv-nix-action` in a workflow:

```yaml
name: Example workflow using direnv-nix-action

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2

    - uses: cachix/install-nix-action@v23

    - name: Install direnv with Nix
      uses: aldoborrero/direnv-nix-action@v1
      with:
        use_nix_profile: 'true'

    # Add additional steps that utilize the environment variables sourced from .envrc
```

**NOTE**: If you are looking for a more comprehensive action that includes
installing Nix and this one, check out
[use-nix-action](https://github.com/aldoborrero/use-nix-action). It's a great
way to combine the capabilities of `cachix/install-nix-action` and
`direnv-nix-action` in one streamlined step.

## License

See [License](./LICENSE) for more information.
