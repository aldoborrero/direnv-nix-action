# direnv-nix-action

![GitHub Actions badge](https://github.com/aldoborrero/direnv-nix-action/workflows/direnv-nix-action%20test/badge.svg)

This GitHub Action installs `direnv` using Nix and sources all `.envrc`
variables to prepare them for use in the environment.

## Why direnv-nix-action?

Combining `nix` with `direnv` is a common practice that enhances project
environment management. This action automates the process, ensuring a seamless
integration of any binaries or environment variables into GitHub Actions
workflows.

## Prerequisites

- Nix must be pre-installed on the Github Actions runner.

**Looking for a comprehensive setup?**: Try
[use-nix-action](https://github.com/aldoborrero/use-nix-action), which combines
the installation of Nix alongside with this action, streamlining your setup into
one convinient step.

## Inputs

Specify inputs using the `with:` keyword in your workflow file:

- `use_nix_profile`: Optional. Set to `true` to use the `nix profile` command
  instead of `nix-env` for installing `direnv`. The default is `false`.

- `nix_channel`: Optional. Specify the nix channel nix will use to install
  `direnv` package. The default is `nixpkgs`.

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
    - uses: actions/checkout@v4

    - uses: cachix/install-nix-action@v23

    - name: Install direnv with Nix
      uses: aldoborrero/direnv-nix-action@v2
      with:
        use_nix_profile: true
        nix_channel: nixpkgs

    # Add additional steps that utilize the binaries
    # and/or environment variables sourced from .envrc
```

## License

See [License](./LICENSE) for more information.
