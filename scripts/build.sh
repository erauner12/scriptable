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

  if [[ $entry_file_path != "./"* ]]; then
    parsed_path=$(find_file "$entry_file_path.ts")
    if [ $? -eq 1 ]; then
      echo "😭 \"$entry_file_path.ts\" could not be found!"
      echo "❌ Exiting!"
      exit 1
    fi
    echo "😇 We found the script at: $parsed_path"
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

function parse_path() {
  local separator="/"
  local encoded_array=()

  IFS=$separator
  read -Ar strarr <<<$1

  for value in "${strarr[@]}"; do
    current_val=$(uri_encode $value)
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
