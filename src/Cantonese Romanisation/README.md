# Cantonese Romanization

An iOS Scriptable action to romanize Cantonese text. Fully offline, lightweight, and simple to use!

## Overview

This is a simple Scriptable (JavaScript) action, to romanize Cantonese text based on data from the [Jyutping Workgroup of LSHK](https://github.com/lshk-org/jyutping-table) and [Pingyam database](https://github.com/kfcd/pingyam).

## Accreditation

This wouldn't have been possible without the work from both [dohliam](https://github.com/dohliam) and [hanleyweng](https://github.com/hanleyweng) in their respective repos:

* [CantoJpMin](https://github.com/hanleyweng/CantoJpMin)
* [pingyam-js](https://github.com/dohliam/pingyam-js)

The work I've done here is simply to merge the two projects into one, and make it avaiable for use on the go via the iOS Scriptable app.

## Features

* Supports conversion to eight different forms of romanization (including IPA) - *TBC ability to change this from UI menu*
* Offline
* Lightweight (under 1 MB) size
* Easy to use

## Supported romanization systems

* [Yale Romanization](https://en.wikipedia.org/wiki/Yale_romanization_of_Cantonese) (耶魯拼音)
* [Cantonese Pinyin](https://en.wikipedia.org/wiki/Cantonese_Pinyin) (教院拼音)
* [S. L. Wong Romanization](https://en.wikipedia.org/wiki/S._L._Wong_(romanisation)) (黃錫凌)
* [International Phonetic Alphabet](https://en.wikipedia.org/wiki/International_Phonetic_Alphabet) (國際音標)
* [Jyutping](https://en.wikipedia.org/wiki/Jyutping) (粵拼)
* [Canton Romanization](https://en.wikipedia.org/wiki/Guangdong_Romanization#Cantonese) (廣州拼音)
* [Sidney Lau Romanization](https://en.wikipedia.org/wiki/Sidney_Lau_romanisation) (劉錫祥)
* [Penkyamp](http://cantonese.wikia.com/wiki/Penkyamp) (粵語拼音字)

Note: Yale, SL Wong, and Penkyamp are available both using numerals and diacritics.

## Usage

1. Download "Cantonese Romanization.js" into the Scriptables folder (either local, or iCloud will work)

2. Run the action:

* *Via the ShareSheet*: highlight text, tap share, select "Run Script", tap "Cantonese Romanization"
* *Via Scriptable app*:
  * **From clipboard**: copy text to clipboard, open Scriptable, tap "Cantonese Romanization", select "From Clipboard 📋"
  * **Manual input**: open Scriptable, tap "Cantonese Romanization", select "Convert 🔄"

## See also

* [Pingyam database](https://github.com/kfcd/pingyam) - A comprehensive list of every possible Cantonese syllable in all major romanization systems
* [pingyam-rb](https://github.com/dohliam/pingyam-rb) - Ruby library for converting between Cantonese romanization systems

## License

Romanization data has been released under a [CC BY license](https://github.com/kfcd/pingyam/blob/master/LICENSE) by the [kfcd](https://github.com/kfcd/) project.

pingyam-js has been released under an [MIT BY license](https://github.com/dohliam/pingyam-js/blob/master/LICENSE) by [dohliam](https://github.com/dohliam) project.
