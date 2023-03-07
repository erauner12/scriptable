#!/usr/bin/env bash

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
  local entry_file_path=$1
  local parsed_path

  if [[ $entry_file_path == ./src/* ]]; then
    parsed_path=$entry_file_path
  else
    parsed_path=$(find . -name "$1.ts")
  fi

  local escape_spaces=$(parse_path "$parsed_path")

  local cmd
  cmd="rollup --config rollup.config.ts --environment file_path:"$escape_spaces" --configPlugin @rollup/plugin-typescript"
  if has_param '--watch' "$@"; then cmd+=' --watch'; fi
  $cmd
}

build_and_watch() {
  build "$1" --watch
}

function parse_path() {
  local separator="/"
  local encoded_array=()

  IFS=$separator
  read -Ar strarr <<<$1

  for value in "${strarr[@]}"; do
    current_val=$(echo $value | perl -MURI::Escape -ne 'chomp;print uri_escape($_),"\n"')
    encoded_array+=($current_val)
  done

  echo -n "$(join_array "/" "${encoded_array[@]}")"
}

# Join an array of elements into a string with a separator
function join_array() {
  local separator="$1"
  shift
  local -a elements=("$@")
  local result="${elements[0]}"
  for ((i = 1; i < ${#elements[@]}; i++)); do
    result="${result}${separator}${elements[i]}"
  done
  echo -n "$result"
}
