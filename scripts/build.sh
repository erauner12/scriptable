#!/usr/bin/env bash

COMMANDS=(build build_and_watch open_in_scriptable)

src=src
dist=dist

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
    parsed_path=$(find_file "$entry_file_path.ts")
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
  if has_param '--watch' "$@"; then cmd+=' --watch'; fi
  $cmd
  echo -e "\n🚀 Done!"
}

build_and_watch() {
  build "$1" --watch
}

open_in_scriptable() {
  local entry_file_path="$1"
  local cmd="open scriptable:///run/$(uri_encode "$entry_file_path")"
  $cmd
}

uri_encode() {
  echo $1 | perl -MURI::Escape -ne 'chomp;print uri_escape($_),"\n"'
}

function find_file() {
  result=$(find . -name "$1" | exec -l grep .)
  if [ $? -eq 1 ]; then
    return 1
  fi
  echo "$result"
}

function base64_encode() {
  local string="$1"
  local base64_string=$(echo -n "$string" | base64)
  echo "$base64_string"
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
