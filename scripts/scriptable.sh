#!/bin/bash

COMMANDS=(init list list_modules export export_module)

DIST_PATH="$(pwd)/dist/"
BUILD_PATH="$(pwd)/build/"
MODULE_PATH="$(pwd)/modules/"
ICLOUD_PATH="$HOME/Library/Mobile Documents/iCloud~dk~simonbs~Scriptable/Documents/"

function init() {
	local dir_name=$(basename "$BUILD_PATH")
	local directory_path="$(pwd)/${dir_name}"

	create_link "${ICLOUD_PATH}" "${directory_path}" -s
	log_complete $?
}

function export() {
	if [[ $1 ]]; then
		create_link "${DIST_PATH}${1}.js" "${BUILD_PATH}${1}.js"
		log_complete $?
	else
		select_and_link "$DIST_PATH" "$BUILD_PATH" ".js"
	fi
}

function export_module() {
	select_and_link "$MODULE_PATH" "${BUILD_PATH}modules/" ".js"
}

function list() {
	get_list "$DIST_PATH" ".js"
}

function list_modules() {
	get_list "$MODULE_PATH" ".js"
}

function get_list() {
	local path="$1"
	local friendly_path="$(get_user_friendly_path "$path")"
	local extension="$2"

	echo -e "📝 Scripts in \"$friendly_path\":\n"

	# Find matching files and print them using column
	if files="$(find "$path" -maxdepth 1 -type f -name "*$extension" -exec sh -c 'basename "$0" | sed -e "s/\.js$//" ' {} \; | sort -bgf)" && [ -n "$files" ]; then
		echo "$files" | column
	else
		echo "🚫 No script files found in \"$friendly_path\"..."
		log_complete 1
	fi

	if [ "$?" == 1 ]; then
		return 1
	fi
}

function create_link() {
	local source_path="$1"
	local destination_path="$2"
	local soft_flag="$3"
	local link_type="hard"
	local friendly_source_path=$(get_user_friendly_path "$source_path")
	local friendly_destination_path=$(get_user_friendly_path "$destination_path")

	destination_path=$(append_dev_to_filename "$destination_path")
	friendly_destination_path=$(append_dev_to_filename "$friendly_destination_path")

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
	if [ "$?" == 1 ]; then
		log_complete
	fi

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

	# Check if path already exists
	if [ -e "${path}" ]; then
		# If path exists, check if it's already a symbolic link
		if [[ "$(readlink -f "${path}")" != "${path}" ]]; then
			log "\"$path_user_friendly\" is already a symbolic link..." 1
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

	local script_path=$(select_script "$source_path" "$search_extension")

	if [[ $script_path == "exit" ]]; then
		log_complete 1
	fi

	if [[ $script_path == "empty" ]]; then
		log_error $"No script files found in \"$source_path\"..."
		log_complete 1
	fi

	local filename="$(basename "$script_path")"

	if [ -z "$filename" ]; then
		log_error "No script file found: \"$source_path\""
		log_complete 1
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
	local extension_icon="📝"
	local file_list=()
	local selected_file

	while IFS= read -r file; do
		file_list+=("$file")
	done < <(find "$script_dir" -maxdepth 1 -type f -name "*$file_extension" -exec sh -c 'basename "$0" | sed -e "s/\.js$//" ' {} \; | sort -bgf)

	if [[ ${#file_list[@]} -eq 0 ]]; then
		echo "empty"
		return 1
	fi

	local file_array=()
	while read -r file; do
		local filename="${file%$file_extension}"
		file_array+=("$extension_icon ${filename}")
	done <<<"$(printf '%s\n' "${file_list[@]}")"

	# Add option to exit
	file_array+=("🚪 Exit")

	PS3=$'\n👉 Select a script from the list (or enter 0 to exit): '
	select file_name in "${file_array[@]}"; do
		if [[ "$REPLY" == 0 ]] || [[ "$REPLY" == ${#file_array[@]} ]]; then
			echo "exit"
			return 1
		fi

		if [[ -n "$file_name" ]]; then
			selected_file="$script_dir${file_name:2}$file_extension"
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
			read -p "👉 Do you want to replace it? [y/n]: " remove_file

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

append_dev_to_filename() {
	local path="$1"

	# Extract the directory, filename without extension, and the extension
	local dir filename extension

	dir=$(dirname "$path")
	filename=$(basename "$path" | cut -d. -f1)
	extension=$(basename "$path" | cut -d. -f2-)

	# Check if there is an extension to handle files without extensions
	if [[ "$extension" != "$filename" ]]; then
		local new_filename="${filename} (DEV).${extension}"
	else
		local new_filename="${filename} (DEV)"
	fi

	# Combine the directory and the new filename
	local new_path="${dir}/${new_filename}"

	echo "$new_path"
}

function get_user_friendly_path() {
	local path="$1"
	echo "${path/$(pwd)/~}"
}

function log() {
	local message="$1"
	local exit_code=$2
	echo -e "✨ $message"
	return $exit_code
}

function log_success() {
	local message="$1"
	echo -e "✅ $message"
	return 0
}

function log_error() {
	local message="$1"
	echo -e "❌ $message"
	return 1
}

function log_complete() {
	local exit_code=$1

	if [[ $exit_code -ne 0 ]]; then
		echo -e "🚪 Exiting script..."
		exit $exit_code
	else
		echo -e "🚀 Done!"
		exit 0
	fi
}

function select_command() {
	echo -e "📝 Available commands:\n"
	PS3=$'\n👉 Please select a command (enter a number): '
	select command in "${COMMANDS[@]}"; do
		if [[ -n "$command" ]]; then
			echo -e "🚀 Running selected command \"$command\"...\n"
			$command
			break
		else
			echo "🚫 Invalid selection. Please try again."
		fi
	done
}

if [[ $# -gt 0 ]] && [[ "${COMMANDS[@]}" =~ "$1" ]]; then
	$1 "${@:2}"
else
	select_command "$COMMANDS"
fi
