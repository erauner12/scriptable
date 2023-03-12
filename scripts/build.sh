#!/usr/bin/env bash

COMMANDS=(build build_and_watch open_in_scriptable)

src=src
dist=dist
build=build

has_param() {
  local term="$1"
  shift
  for arg; do
    if [[ $arg == "$term" ]]; then return 0; fi
  done
  return 1
}

# First argument is filepath (or filename, without extension)
#
# Supported flags:
#  --watch: Rebuild automatically when changes are detected
build() {
  local entry_file_path="$1"
  local parsed_path

  if [[ $entry_file_path == ./$src/* ]]; then
    parsed_path=$entry_file_path
  fi

  if [[ $entry_file_path != "./"* ]]; then
    parsed_path=$(find_file "." "$entry_file_path.ts")
    if [ $? -eq 1 ]; then
      echo "😭 \"$entry_file_path.ts\" could not be found!"
      echo "❌ Exiting!"
      exit 1
    fi
    echo "😇 We found the script at: $parsed_path"
  fi

  exit_if_not_extension "$parsed_path" ts TypeScript
  local base64_string=$(base64_encode "$parsed_path")

  local cmd
  cmd="rollup --config rollup.config.ts --environment file_path:"$base64_string" --configPlugin @rollup/plugin-typescript"

  if has_param '--watch' "$@"; then
    cmd+=' --watch'
  fi

  $cmd
  echo -e "\n🚀 Done!"
}

build_and_watch() {
  build "$1" --watch
}

function open_in_scriptable() {
  local entry_file="$1"
  local dist_relative_path="./$dist/"
  local build_relative_path="./$build/"
  local dist_absolute_path
  local build_absolute_path
  local uri_basename

  # Check if `entry_file` has an extension at the end
  if [[ ! "$entry_file" =~ \.[^.]+$ ]]; then
    # If it doesn't have an extension, append `.js` to the end of `entry_file`
    entry_file="${entry_file}.js"
  fi

  # Checks if the file is .ts or .js and replaces .ts with .js
  if [[ "$entry_file" == *.js ]] || [[ "$entry_file" == *.ts ]]; then
    if [[ "$entry_file" == *.ts ]]; then
      entry_file="${entry_file%.ts}.js"
    fi
  else
    log_error "The file is not JavaScript or TypeScript"
    log_complete 1
  fi

  local dist_file_path="$(find_file "$dist_relative_path" "$entry_file")"

  # Check if directory exists in ./dist
  if test -e "$dist_file_path"; then
    log_success "Found \"$dist_relative_path$(basename "$dist_file_path")\""
    dist_absolute_path="$(absolute_path "${dist_file_path}")"
  else
    echo "$dist_file_path"
  fi

  local build_file_path="$(find_file "$build_relative_path" "$entry_file")"

  # Check if directory exists in ./build
  if test -e "$build_file_path"; then
    log_success "Found \"$build_relative_path$(basename "$build_file_path")\""
    build_absolute_path="$(absolute_path "${build_file_path}")"
  else
    echo "$build_file_path"
  fi

  if [[ -e "$dist_file_path" && -e "$build_file_path" ]]; then
    # Check if paths symbolic link to the same file
    if [ ! "$dist_absolute_path" -ef "$build_absolute_path" ]; then
      log_error "No symbolic link between \"${dist_relative_path}${entry_file}\" and \"${build_relative_path}${entry_file}\""
      log "Remove \"${build_relative_path}${entry_file}\" and export \"$dist_file_path\" to \"$build_relative_path\""
      log "Run \`npm run export\`"
      log_complete 1
      return 1
    else
      log "\"${dist_relative_path}${entry_file}\" is symbolic linked to \"${build_relative_path}${entry_file}\""
    fi
  elif [[ ! -e "$dist_file_path" && -e "$build_file_path" ]]; then
    log "The file \"${build_relative_path}${entry_file}\" will not be backed up to git"
    log "Move it to \"${dist_relative_path}\" then run \`npm run export\`"
  elif [[ -e "$dist_file_path" && ! -e "$build_file_path" ]]; then
    log "You should export \"$dist_file_path\" to \"$build_relative_path\""
    log "Run \`npm run export\`"
    log_complete 1
  else
    log_complete 1
  fi

  uri_basename="$(basename "$build_absolute_path")"
  uri_basename="${uri_basename%.*}"
  uri_basename="$(uri_encode "$uri_basename")"

  local cmd="open scriptable:///run/${uri_basename}"
  log_success "Running command: \"${cmd}\""
  $cmd
  log_complete $?
}

uri_encode() {
  echo $1 | perl -MURI::Escape -ne 'chomp;print uri_escape($_),"\n"'
}

function find_file() {
  local location="$1"
  local name="$2"

  # Add a slash at the end of the location parameter if it is not already present
  if [[ "$location" != */ ]]; then
    location="$location/"
  fi

  # Remove any double slashes that might exist with sed
  local result=$(find "$location" -name "$name" | exec -l grep . | sed 's#//*#/#g')

  if [ -z "$result" ]; then
    log_error "File \"${location}${name}\" does not exist"
    return 1
  else
    echo "$result"
  fi
}

function base64_encode() {
  local string="$1"
  local base64_string=$(echo -n "$string" | base64)
  echo "$base64_string"
}

function absolute_path() {
  local path="$1"

  # Check that the path argument is not empty
  if [ -z "$path" ]; then
    log_error "Path argument is empty"
    return 1
  fi

  # Check if the path is already an absolute path
  if [[ "$path" = /* ]]; then
    # Path is already absolute, so return it as is
    echo "$path"
    return 0
  fi

  # Resolve the path to its canonical absolute path
  local absolute_path=$(realpath "$path")

  # Check that the resolved path exists
  if [ ! -e "$absolute_path" ]; then
    log_error "Resolved path does not exist: \"$absolute_path\""
    return 1
  fi

  # Print the absolute path of the resolved path
  echo "$absolute_path"
}

function exit_if_not_extension() {
  if [[ $1 != *.$2 ]]; then
    echo "🤨 The file \"${entry_file_path}\" is not $3."
    echo "❌ Exiting!"
    exit 1
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

function get_user_friendly_path() {
  local path="$1"
  echo "${path/$(pwd)/~}"
}

function log() {
  local message="$1"
  local exit_code=$2
  echo "✨ $message"
  return $exit_code
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

if [[ $# -gt 0 ]] && [[ "${COMMANDS[@]}" =~ "$1" ]]; then
  $1 "${@:2}"
else
  select_command "$COMMANDS"
fi
