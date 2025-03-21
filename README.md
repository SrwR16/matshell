<div align="center">
  
# Matshell 
### A Material Design desktop shell powered by [Astal](https://github.com/Aylur/astal)

![GitHub repo size](https://img.shields.io/github/repo-size/neurarian/matshell?style=for-the-badge&logo=gitlfs&logoColor=%23FFDBC9&labelColor=%2346362d&color=%23FFDBC9)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/neurarian/matshell?style=for-the-badge&logo=git&logoColor=%23FFB68D&labelColor=%2346362d&color=%23FFB68D)
![GitHub last commit (branch)](https://img.shields.io/github/last-commit/neurarian/matshell/master?style=for-the-badge&logo=git&logoColor=%23EDBD92&labelColor=%2346362d&color=%23EDBD92)
![GitHub Repo stars](https://img.shields.io/github/stars/neurarian/matshell?style=for-the-badge&logo=github&logoColor=%23ECBF78&labelColor=%2346362d&color=%23ECBF78)

</div>

Matshell is a Material Design inspired desktop shell built with [Astal](https://github.com/Aylur/astal) for [Hyprland](https://github.com/hyprwm/Hyprland). This project draws inspiration from [fufexan's](https://github.com/fufexan/dotfiles) AGSv1 config, with design influences from [saimoomedits](https://github.com/saimoomedits/eww-widgets), tailored for both multi-monitor desktop setups and laptops.

## Features

- **Adaptive Layout**: Automatically adapts to desktop or laptop environments by conditionally rendering notebook-specific widgets
- **Dynamic Material Design Theming**: Change themes on-the-fly using either scripts I botched from [end-4](https://github.com/end-4/dots-hyprland) or via [matugen](https://github.com/InioX/matugen) templates
- **Multi-monitor Support**: Designed with multi-monitor setups in mind
- **Hyprland Integration**: Built specifically for the Hyprland compositor
- **Nix Support**: Support for NixOS / Home-Manager with dedicated module

______________________________________________________________________

### ⛓️ Dependencies

<details>
  <summary>Show dependency list</summary>

#### Required:

- astal
- ags
- glibtop
- hyprland
- adw-gtk3-git
- adwaita-icon-theme
- coreutils
- dart-sass
- imagemagick
- Material Symbols Outlined Font
- ***For the end-4 scripts:***
  - python-materialyoucolor-git
  - gradience-git
  - python-libsass
  - python-material-color-utilities
  - python-build
  - python-pillow
  - python-pywal
  - python-setuptools-scm
  - python-wheel
- ***For matugen:***
  - matugen
  - [image-hct](https://github.com/Neurarian/NixOS-config/tree/master/packages/image-hct) (optional; for additional chroma/tone based theming)

#### Not required but launched by Astal widgets:

- gnome-control-center
- mission-center
- overskride
- pwvucontrol

</details>

### 🛠️ Installation

Run the installation script:

```console
 bash <(curl -s https://raw.githubusercontent.com/Neurarian/matshell/refs/heads/master/install.sh)
```

<details>
  <summary>Manual install</summary>

...Or do it manually by cloning this repo...

**❗Make sure to create a backup of your current config if you want to keep it❗**

```console
  git clone --depth 1 "https://github.com/Neurarian/matshell" "$XDG_CONFIG_HOME/ags/"
```

For the color generation with the end-4-scripts to work, run this command to create the necessary additional directories:

```console
mkdir -p $XDG_STATE_HOME/astal/{scss,user} $XDG_CACHE_HOME/astal/user/generated
```

</details>

After using hyprpaper or some other means to set your wallpaper, run the script from [end-4](https://github.com/end-4/dots-hyprland) like this:

```console
$HOME/.config/astal/scripts/colorgen.sh "$HOME/.cache/current_wallpaper.jpg" --apply --smart
```

The color generation works better with wallpapers that have a bit of chroma.

#### ❄️ Nix

For a NixOS implementation and example [script](https://github.com/Neurarian/NixOS-config/blob/master/home/Liqyid/common/optional/scripts/wal_set.nix) for use with hyprpaper, matugen, and a [custom cli utility](https://github.com/Neurarian/NixOS-config/tree/master/packages/image-hct) to get chroma/tone, check my [NixOS-config](https://github.com/Neurarian/NixOS-config).

On Nix you can test the config via the flake exposed package, but I would recommend to also imperatively copy or symlink this repo to your dotfiles to circumvent nix-store immutability. Otherwise the dynamic theming will not work. One way to do this would be via the home-manager module which adds the following enable option to the set of ags options:

```nix
# ...

imports = [
  inputs.matshell.homeManagerModules.default
];

programs.ags = {
  matshell.enable = true;
    };
#...

```

This will simply clone the repo for you to .config/ags if that dir does not exist, build ags wrapped with all dependencies for matshell, and start a systemd service. You will have to remove the ags home-manager module from you config, as enabling matshell will handle everything ags-related for you.

This is absolutely hacky, probably unsafe, and not the nix way to do it, but it gets the job done. To get the latest version of matshell, you would have to pull the updates manually or delete .config/ags and rebuild the system/home-manager.

## Acknowledgements

This project wouldn't be possible without:
- [fufexan's dotfiles](https://github.com/fufexan/dotfiles) for the initial inspiration and foundation
- [end-4's dots-hyprland](https://github.com/end-4/dots-hyprland) for the color generation scripts
- [saimoomedits' eww-widgets](https://github.com/saimoomedits/eww-widgets) for design influence
- [Astal](https://github.com/Aylur/astal) for the powerful widget toolkit

______________________________________________________________________

## Screenshots

### 🌚 Dark Theme (Desktop)
<p align="center">
  
![2025-03-21T22:42:06,141625834+01:00](https://github.com/user-attachments/assets/c6c66f14-35b1-418c-839c-e66fbdffbb3c)
![2025-03-21T23:02:56,372784904+01:00](https://github.com/user-attachments/assets/c10ab60a-c8e1-43e8-ad7a-9723437af4f1)



</p>

### 🌞 Light Theme (Desktop)
<p align="center">

![2025-03-21T22:37:54,320570898+01:00](https://github.com/user-attachments/assets/45bf6c1a-d931-40a1-8644-fd7ccbfb4f95)
![2025-03-21T22:52:59,913307252+01:00](https://github.com/user-attachments/assets/444a6624-9c36-412a-b265-2a887717c933)


</p>

### Video Demo
<p align="center">
  <video src="https://github.com/Neurarian/ags-bar/assets/110474238/3f01073e-552a-479b-99f9-d82647138e55" controls width="600"></video>
</p>
