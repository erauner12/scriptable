#!/bin/bash

build_path="$(pwd)/dist/"
module_path="$(pwd)/modules/"
icloud_path="$HOME/Library/Mobile Documents/iCloud~dk~simonbs~Scriptable/Documents/"

function show_commands() {
	echo "Available commands: '$1'"
	printf '\r\n'
	printf '    '
	printf '%s\n    ' "${commands[@]}"
	printf '\r\n'
}

function init() {
	ln -s "${icloud_path}" build
}

function import() {
	echo
	local script=$(select_script "${build_path}")
	if [[ $script == "exit" ]]; then
		echo "🚪 Exiting script..."
	else
		local filename="$(find "${script}" -maxdepth 0 -type f -name "*.js" -exec basename {} \;)"
		local link_path="$script"

		if [ -e "$link_path" ]; then
			remove_file "$link_path"
			if [ "$?" != 0 ]; then
				echo "🚪 Exiting script..."
				return 1
			fi
		fi

		ln "dist/${filename}" "$link_path"
		echo "✅ Successfully created hard link: \"$link_path\""
	fi
}

function importModule() {
	ln ~/Library/Mobile\ Documents/iCloud~dk~simonbs~Scriptable/Documents/modules/"$1.js" "modules/$1.js"
}

function list() {
	ls ~/Library/Mobile\ Documents/iCloud~dk~simonbs~Scriptable/Documents/
}

function select_script() {
	local file_list="$(find "$1" -maxdepth 1 -type f -name "*.js" -exec basename {} \; | sort -f)"

	local file_array=()
	while read -r file; do
		local filename="${file%.js}"
		file_array+=("📝 ${filename}")
	done <<<"$file_list"

	# Add option to exit
	file_array+=("🚪 Exit")

	PS3=$'\n🤔 Select a script from the list (or enter 0 to exit): '
	select file_name in "${file_array[@]}"; do
		if [[ "$REPLY" == 0 ]] || [[ "$REPLY" == ${#file_array[@]} ]]; then
			echo "exit"
			return 1
		fi

		if [[ -n "$file_name" ]]; then
			echo "$(find "${icloud_path}${file_name:2}.js" -maxdepth 0 -type f)"
			return 0
		fi
	done
}

function remove_file() {
	local file="$1"
	local remove_file=""

	while [[ "$remove_file" != "y" && "$remove_file" != "n" ]]; do
		read -n 1 -p "😱 File already exists. Do you want to remove it? [y/n]: " remove_file
		echo

		if [[ "$remove_file" != "y" && "$remove_file" != "n" ]]; then
			echo -e "\n✋ Invalid input. Please enter 'y' or 'n'."
		fi
	done

	if [ "$remove_file" == "y" ]; then
		rm "$file"
	else
		return 1
	fi
}

commands=(init list import importModule)

if [[ $# -gt 0 ]] && [[ "${commands[@]}" =~ "$1" ]]; then
	$1 "${@:2}"
else
	show_commands "$commands"
fi
