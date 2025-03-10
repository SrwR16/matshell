{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-parts = {
      url = "github:hercules-ci/flake-parts";
    };
    systems = {
      url = "systems";
    };
    ags = {
      url = "github:aylur/ags";
      inputs.nixpkgs.follows = "nixpkgs";
      inputs.astal = {
        url = "github:aylur/astal";
        inputs.nixpkgs.follows = "nixpkgs";
      };
    };
  };

  outputs = {
    self,
    nixpkgs,
    flake-parts,
    systems,
    ags,
  } @ inputs: let
    mkPkgs = system:
      import nixpkgs {
        inherit system;
      };
    mkMatshellDeps = system: let
      pkgs = mkPkgs system;
      agsPkgs = ags.packages.${system};
    in
      (with pkgs; [
        wrapGAppsHook
        gobject-introspection
        typescript
        dart-sass
        mission-center
        imagemagick
        libgtop
      ])
      ++ (with agsPkgs; [
        io
        notifd
        hyprland
        wireplumber
        mpris
        network
        tray
        bluetooth
        cava
        battery
        powerprofiles
      ]);

    # Create a static map for all systems.
    # Required for hm-module.
    sys = import systems;
    matshellDeps = builtins.listToAttrs (
      map
      (system: {
        name = system;
        value = mkMatshellDeps system;
      })
      sys
    );
  in
    flake-parts.lib.mkFlake {inherit inputs;} {
      systems = sys;

      perSystem = {system, ...}: let
        pkgs = mkPkgs system;
        name = "matshell";
      in {
        packages.default = ags.lib.bundle {
          inherit pkgs name;
          src = ./.;
          entry = "bundleapp.ts";
          extraPackages = matshellDeps.${system} ++ [ags.packages.${system}.default];
        };

        devShells.default = pkgs.mkShell {
          inputsFrom = builtins.attrValues {
            inherit (self.packages.${system}) default;
          };
        };
      };

      flake = {
        homeManagerModules = {
          default = self.homeManagerModules.matshell;
          matshell = import ./nix/hm-module.nix self;
        };
        inherit matshellDeps;
      };
    };
}
