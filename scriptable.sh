#!/bin/bash

DIST_PATH="$(pwd)/dist/"
MODULE_PATH="$(pwd)/modules/"
BUILD_PATH="$(pwd)/build/"
ICLOUD_PATH="$HOME/Library/Mobile Documents/iCloud~dk~simonbs~Scriptable/Documents/"

function show_commands() {
	echo "Available commands: '$1'"
	printf '\r\n'
	printf '    '
	printf '%s\n    ' "${commands[@]}"
	printf '\r\n'
}

function init() {
	local dir_name=$(basename "$BUILD_PATH")
	local directory_path="$(pwd)/${dir_name}"

	create_link "${ICLOUD_PATH}" "${directory_path}" -s
	log_complete $?
}

function import() {
	select_and_link "$DIST_PATH" "$BUILD_PATH" ".js"
}

function importModule() {
	ln ~/Library/Mobile\ Documents/iCloud~dk~simonbs~Scriptable/Documents/modules/"$1.js" "modules/$1.js"
}

function list() {
	ls ~/Library/Mobile\ Documents/iCloud~dk~simonbs~Scriptable/Documents/
}

function create_link() {
	local source_path="$1"
	local destination_path="$2"
	local soft_flag="$3"
	local link_type="hard"
	local friendly_source_path=$(get_user_friendly_path "$source_path")
	local friendly_destination_path=$(get_user_friendly_path "$destination_path")

	if [ ! -d "$(dirname "$source_path")" ]; then
		log_error "Source directory \"$(dirname "$friendly_source_path")\" does not exist"
	fi

	if [ ! -d "$(dirname "$destination_path")" ]; then
		log_error "Destination directory \"$(dirname "$friendly_destination_path")\" does not exist"
	fi

	if [ "$?" != 0 ]; then
		return 1
	fi

	local ln_command="ln \"$source_path\" \"$destination_path\""

	if [ "$soft_flag" == "-s" ]; then
		ln_command="ln -s \"$source_path\" \"$destination_path\""
		link_type="soft"
	fi

	check_link "$destination_path"
	eval $ln_command 2>/dev/null

	if [ "$?" == 0 ]; then
		log_success "Successfully created $link_type link: \"$friendly_source_path\" to \"$friendly_destination_path\""
	else
		log_error "Failed to create $link_type link: \"$friendly_source_path\" to \"$friendly_destination_path\""
	fi
}

function check_link() {
	local path="$1"
	local dir_name=$(basename "$directory_path")
	local path_user_friendly=$(get_user_friendly_path "$path")

	if [ -e "${path}" ]; then
		if [[ -L "${path}" ]]; then
			log_error "\"$path_user_friendly\" is already a symbolic link..."
		else
			log_error "\"$path_user_friendly\" is not a symbolic link..."
		fi
	else
		return 0
	fi
}

function select_and_link() {
	local source_path="$1"
	local destination_path="$2"
	local search_extension="$3"
	local soft_link="$4"

	echo
	local script_path=$(select_script "$source_path" "$search_extension")
	if [[ $script_path == "exit" ]]; then
		log_complete 1
	fi

	local filename="$(find "${script_path}" -maxdepth 0 -type f -exec basename {} \;)"

	if [ -z "$filename" ]; then
		log_error "No script file found: \"$script_path\""
	else
		local link_path="$destination_path$filename"
	fi

	if [ -e "$link_path" ]; then
		check_file_exists "$link_path"
	fi

	if [ "$?" == 0 ]; then
		create_link "$script_path" "$link_path" "$soft_link"
	fi

	log_complete $?
}

function select_script() {
	local script_dir="$1"
	local file_extension="$2"
	local file_list="$(find "$script_dir" -maxdepth 1 -type f -name "*$file_extension" -exec basename {} \; | sort -f)"

	if [[ -z "$file_list" ]]; then
		echo "🚫 No script files found in \"$script_dir\"..."
		return 1
	fi

	local file_array=()
	while read -r file; do
		local filename="${file%$file_extension}"
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
			local selected_file="$script_dir${file_name:2}$file_extension"
			echo "$selected_file"
			return 0
		fi
	done
}

function check_file_exists() {
	local path="$1"
	local path_user_friendly=$(get_user_friendly_path "$path")
	local remove_file=""

	if [ -e "$path" ]; then
		check_link "$path"
		while [[ "$remove_file" != "y" && "$remove_file" != "n" ]]; do
			echo "😱 \"$path_user_friendly\" already exists..."
			read -p "🤔 Do you want to remove it? [y/n]: " remove_file

			if [[ "$remove_file" != "y" && "$remove_file" != "n" ]]; then
				echo -e "\n✋ Invalid input. Please enter 'y' or 'n'"
			fi
		done
	else
		echo "🔍 File not found at \"$path_user_friendly\""
		return 1
	fi

	if [ "$remove_file" == "y" ]; then
		echo "🔥 Removing \"$path_user_friendly\"..."
		rm "$path"

		# Check if the file still exists
		if [ -e "$path" ]; then
			log_error "Failed to remove \"$path_user_friendly\""
		else
			log_success "Removed \"$path_user_friendly\""
		fi
	else
		log "Leaving \"$path_user_friendly\" in place..."
		return 1
	fi

}

function get_user_friendly_path() {
	local path="$1"
	echo "${path/$(pwd)/~}"
}

function log() {
	local message="$1"
	echo "✨ $message"
}

function log_success() {
	local message="$1"
	echo "✅ $message"
	return 0
}

function log_error() {
	local message="$1"
	echo "❌ $message"
	return 1
}

function log_complete() {
	local exit_code=$1

	if [[ $exit_code -ne 0 ]]; then
		echo "🚪 Exiting script..."
		exit $exit_code
	else
		echo "🚀 Done!"
		exit 0
	fi
}

commands=(init list import importModule)

if [[ $# -gt 0 ]] && [[ "${commands[@]}" =~ "$1" ]]; then
	$1 "${@:2}"
else
	show_commands "$commands"
fi
