#!/usr/bin/env bash

XDG_CONFIG_HOME="${XDG_CONFIG_HOME:-$HOME/.config}"
XDG_CACHE_HOME="${XDG_CACHE_HOME:-$HOME/.cache}"
XDG_STATE_HOME="${XDG_STATE_HOME:-$HOME/.local/state}"
CONFIG_DIR="$XDG_CONFIG_HOME/ags"
CACHE_DIR="$XDG_CACHE_HOME/ags"
STATE_DIR="$XDG_STATE_HOME/ags"

term_alpha=100 #Set this to < 100 make all your terminals transparent
# sleep 0 # idk i wanted some delay or colors dont get applied properly
if [ ! -d "$CACHE_DIR"/user/generated ]; then
    mkdir -p "$CACHE_DIR"/user/generated
fi
cd "$CONFIG_DIR" || exit

colornames=''
colorstrings=''
colorlist=()
colorvalues=()

# wallpath=$(swww query | head -1 | awk -F 'image: ' '{print $2}')
# wallpath_png="$CACHE_DIR/user/generated/lockscreen.png"
# convert "$wallpath" "$wallpath_png"
# wallpath_png=$(echo "$wallpath_png" | sed 's/\//\\\//g')
# wallpath_png=$(sed 's/\//\\\\\//g' <<< "$wallpath_png")

transparentize() {
  local hex="$1"
  local alpha="$2"
  local red green blue

  red=$((16#${hex:1:2}))
  green=$((16#${hex:3:2}))
  blue=$((16#${hex:5:2}))

  printf 'rgba(%d, %d, %d, %.2f)\n' "$red" "$green" "$blue" "$alpha"
}

get_light_dark() {
    lightdark=""
    if [ ! -f "$STATE_DIR/user/colormode.txt" ]; then
        echo "" > "$STATE_DIR/user/colormode.txt"
    else
        lightdark=$(sed -n '1p' "$STATE_DIR/user/colormode.txt")
    fi
    echo "$lightdark"
}

apply_fuzzel() {
    # Check if scripts/templates/fuzzel/fuzzel.ini exists
    if [ ! -f "scripts/templates/fuzzel/fuzzel.ini" ]; then
        echo "Template file not found for Fuzzel. Skipping that."
        return
    fi
    # Copy template
    mkdir -p "$CACHE_DIR"/user/generated/fuzzel
    cp "scripts/templates/fuzzel/fuzzel.ini" "$CACHE_DIR"/user/generated/fuzzel/fuzzel.ini
    # Apply colors
    for i in "${!colorlist[@]}"; do
        sed -i "s/{{ ${colorlist[$i]} }}/${colorvalues[$i]#\#}/g" "$CACHE_DIR"/user/generated/fuzzel/fuzzel.ini
    done

    cp  "$CACHE_DIR"/user/generated/fuzzel/fuzzel.ini "$XDG_CONFIG_HOME"/fuzzel/fuzzel.ini
}

apply_term() {
    # Check if terminal escape sequence template exists
    if [ ! -f "scripts/templates/terminal/sequences.txt" ]; then
        echo "Template file not found for Terminal. Skipping that."
        return
    fi
    # Copy template
    mkdir -p "$CACHE_DIR"/user/generated/terminal
    cp "scripts/templates/terminal/sequences.txt" "$CACHE_DIR"/user/generated/terminal/sequences.txt
    # Apply colors
    for i in "${!colorlist[@]}"; do
        sed -i "s/${colorlist[$i]} #/${colorvalues[$i]#\#}/g" "$CACHE_DIR"/user/generated/terminal/sequences.txt
    done

    sed -i "s/\$alpha/$term_alpha/g" "$CACHE_DIR/user/generated/terminal/sequences.txt"

    for file in /dev/pts/*; do
      if [[ $file =~ ^/dev/pts/[0-9]+$ ]]; then
        cat "$CACHE_DIR"/user/generated/terminal/sequences.txt > "$file"
      fi
    done
}
apply_wlogout() {
    # Check if scripts/templates/wlogout/wlogout.css exists
    if [ ! -f "scripts/templates/wlogout/wlogout.css" ]; then
        echo "Template file not found for wlogout colors. Skipping that."
        return
    fi
    # Copy template
    mkdir -p "$CACHE_DIR"/user/generated/wlogout
    cp "scripts/templates/wlogout/wlogout.css" "$CACHE_DIR"/user/generated/wlogout/style.css
    # Apply colors
    for i in "''${!colorlist[@]}"; do
        sed -i "s/{{ ''${colorlist[$i]} }}/''${colorvalues[$i]#\#}/g" "$CACHE_DIR"/user/generated/wlogout/style.css
    done

    cp "$CACHE_DIR"/user/generated/wlogout/style.css "$XDG_CONFIG_HOME"/wlogout/style.css
}

apply_ags() {
    cp "$STATE_DIR"/scss/_material.scss "$CONFIG_DIR"/style/abstracts/_material-colors_end4.scss
}

colornames=$(cat $STATE_DIR/scss/_material.scss | cut -d: -f1)
colorstrings=$(cat $STATE_DIR/scss/_material.scss | cut -d: -f2 | cut -d ' ' -f2 | cut -d ";" -f1)
IFS=$'\n'
colorlist=( "$colornames" ) # Array of color names
colorvalues=( "$colorstrings" ) # Array of color values

apply_ags &
apply_wlogout &
apply_gtk &
apply_fuzzel &
#apply_term &
