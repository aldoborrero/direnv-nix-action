{
  description = "direnv-nix-action";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";

    # flake-parts
    flake-parts = {
      url = "github:hercules-ci/flake-parts";
      inputs.nixpkgs-lib.follows = "nixpkgs";
    };
    flake-root.url = "github:srid/flake-root";

    # utils
    devshell = {
      url = "github:numtide/devshell";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    treefmt-nix = {
      url = "github:numtide/treefmt-nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    flake-compat.url = "github:nix-community/flake-compat";
  };

  outputs = inputs @ {
    self,
    flake-parts,
    nixpkgs,
    ...
  }:
    flake-parts.lib.mkFlake {inherit inputs;}
    {
      imports = [
        inputs.flake-root.flakeModule
        inputs.treefmt-nix.flakeModule
        inputs.devshell.flakeModule
      ];

      systems = ["x86_64-linux"];

      perSystem = {
        self',
        config,
        inputs',
        lib,
        pkgs,
        ...
      }: {
        # Formatting
        treefmt.config = {
          inherit (config.flake-root) projectRootFile;
          flakeFormatter = true;
          flakeCheck = true;
          programs = {
            alejandra.enable = true;
            deno.enable = true;
            mdformat.enable = true;
            shellcheck.enable = true;
          };
        };

        # DevShell
        devshells.default = {
          name = "use-nix-action";
          packages = with pkgs; [
            act
            nodejs_20
          ];
          env = [];
          commands = [
            {
              category = "nix";
              name = "fmt";
              help = "Format the source tree";
              command = "nix fmt";
            }
            {
              category = "nix";
              name = "check";
              help = "Check the source code";
              command = "nix flake check";
            }
          ];
        };
      };
    };
}
