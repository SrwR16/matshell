<div align="center">
  
# Matshell 
### A Material Design desktop shell powered by [Astal](https://github.com/Aylur/astal)

![GitHub repo size](https://img.shields.io/github/repo-size/neurarian/matshell?style=for-the-badge&logo=gitlfs&logoColor=%23FFDBC9&labelColor=%2346362d&color=%23FFDBC9)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/neurarian/matshell?style=for-the-badge&logo=git&logoColor=%23FFB68D&labelColor=%2346362d&color=%23FFB68D)
![GitHub last commit (branch)](https://img.shields.io/github/last-commit/neurarian/matshell/master?style=for-the-badge&logo=git&logoColor=%23EDBD92&labelColor=%2346362d&color=%23EDBD92)
![GitHub Repo stars](https://img.shields.io/github/stars/neurarian/matshell?style=for-the-badge&logo=github&logoColor=%23ECBF78&labelColor=%2346362d&color=%23ECBF78)

![Neurarian_Matshell_round-2](https://github.com/user-attachments/assets/f3a2cbf8-6f62-4047-938f-68a4a01d8cd3)



</div>

Matshell is a Material Design inspired desktop shell built with [Astal](https://github.com/Aylur/astal) for [Hyprland](https://github.com/hyprwm/Hyprland). This project draws heavy inspiration from [fufexan's](https://github.com/fufexan/dotfiles) AGSv1 config, with design influences from [saimoomedits](https://github.com/saimoomedits/eww-widgets), tailored for both multi-monitor desktop setups and laptops.

This setup tries to achieve sleek, "MacOS-esque" looks with a little bit of rice sprinkled on top.

Take a look at the GTK4 branch for the most recent version which is still work in progress (but ~95% done and absolutely usable).

## Features

- **Adaptive Layout**: Automatically adapts to desktop or laptop environments by conditionally rendering notebook-specific widgets
- **Dynamic Material Design Theming**: Change themes on-the-fly using either scripts I botched from [end-4](https://github.com/end-4/dots-hyprland) or via [matugen](https://github.com/InioX/matugen) templates
- **Multi-monitor Support**: Designed with multi-monitor setups in mind
- **Hyprland Integration**: Built specifically for the Hyprland compositor
- **Nix Support**: Support for NixOS / Home-Manager with dedicated module

<details>
  <summary>Widget List</summary>
  

- **Main Status Bar**
- Laptop (Light)
    
![2025-03-23T18:37:29,615714672+01:00](https://github.com/user-attachments/assets/8656aa43-7793-476b-9e12-f0a58eeccbfb)
- Desktop (Dark)
    
![2025-03-23T18:53:49,228938439+01:00](https://github.com/user-attachments/assets/01e4e84c-1901-4532-a924-3a86696aa22c)

- **App Launcher**
- Light
  
![2025-03-23T18:41:51,470421774+01:00](https://github.com/user-attachments/assets/ae8b69a8-8fc1-4a48-a18e-77a8af6f83c8)

- Dark

![2025-03-23T18:56:24,165287965+01:00](https://github.com/user-attachments/assets/3760a241-913f-4d31-a90b-f1a6d85b59bf)

- **Logout Menu**
- Light
    
![2025-03-23T19:00:49,303694058+01:00](https://github.com/user-attachments/assets/df572fad-1783-45fe-b7ca-a43fd3d55319)

- Dark
      
![2025-03-23T18:40:10,844462569+01:00](https://github.com/user-attachments/assets/53eb4206-b33d-459c-b3b4-d6cb1154c4f3)

- **Music Player with CAVA**

![2025-03-23T18:53:13,488130463+01:00](https://github.com/user-attachments/assets/302da48d-6a04-4587-bd21-19e90f9fdd9a)

- **Notifications**
- Light
  
![2025-03-23T18:42:09,143344616+01:00](https://github.com/user-attachments/assets/cacd60a8-4941-40d4-802c-54a683ff8b34)

- Dark

![2025-03-23T19:05:38,240008405+01:00](https://github.com/user-attachments/assets/c949ade2-2d3b-4678-a36e-0ff725859e05)


- **On Screen Display**
- Light
  
![2025-03-23T18:47:25,513704415+01:00](https://github.com/user-attachments/assets/86351939-d32a-4063-bd6f-c4f2b9e7292d)

- Dark

![2025-03-23T19:06:59,375609741+01:00](https://github.com/user-attachments/assets/3ea5eb01-1042-4740-ad88-ee59212dc50c)

- **System Menu**
- Laptop (Light)
  
![2025-03-23T18:38:30,002859605+01:00](https://github.com/user-attachments/assets/c520f03b-f365-4782-8008-591a8993eaef)

- Desktop (Dark)

![2025-03-23T19:09:22,826684018+01:00](https://github.com/user-attachments/assets/8c701cb4-d675-4bf9-97fa-cf3eceaa9545)

</details>

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
- Fira Code Nerd Font
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

This will simply clone the repo for you to .config/ags if that dir does not exist, build ags wrapped with all dependencies for matshell, and start a systemd service. You will have to <ins>remove the ags home-manager module</ins> from your config, as enabling matshell will handle everything ags-related for you.

This is absolutely hacky, probably unsafe, and not the nix way to do it, but it gets the job done. To get the latest version of matshell, you would have to pull the updates manually or delete .config/ags and rebuild the system/home-manager profile.

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
