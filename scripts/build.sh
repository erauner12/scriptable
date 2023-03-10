#!/usr/bin/env bash

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
  echo $_ | perl -MURI::Escape -ne 'chomp;print uri_escape($_),"\n"'
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
