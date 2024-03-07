# Cantonese Romanisation

## Summary

A [Scriptable](https://scriptable.app) utility widget to transform Chinese into a Cantonese romanisation system (based on data from the [Jyutping Workgroup of LSHK](https://github.com/lshk-org/jyutping-table) and [Pingyam database](https://github.com/kfcd/pingyam)).

<img src="./Cantonese%20Romanisation.jpg" width="400" alt="Cantonese Romanisation Widget Preview">

### Features

* Displays a **word of the day**
* Run from iOS ShareSheet
* Localisations in English, Chinese (Traditional), and Chinese (Simplified)
* Offline and less than 1 MB
* Supports conversion to eight different forms of romanisation

## Install

[![Download with ScriptDude](https://scriptdu.de/download.svg)](https://scriptdu.de?name=Cantonese%20Romanisation&source=https%3A%2F%2Fraw.githubusercontent.com%2Felliott-liu%2Fscriptable%2Fmain%2Fdist%2FCantonese%20Romanisation.js&docs=https%3A%2F%2Fgithub.com%2Felliott-liu%2Fscriptable%2Fblob%2Fmain%2Fsrc%2FCantonese%20Romanisation%2FREADME.md)

## Setup

  1. Add the Scriptable widget to home screen
  2. Set `Script` to `Cantonese Romanisation`
  3. Set `When interacting` to `Run Script`
  4. The script defaults to English, and the Jyutping system of romanisation. *Optionally*, set `Parameter` to a comma (`,`) separated list of `language`, `romanisation system` (e.g. `zhs, 6` for Chinese (Simplified) and Sidney Lau system of romanisation). Options are:
     * `language`:
       * `en`: English
       * `zhs`: Chinese (Simplified)
       * `zht`: Chinese (Traditional)
     * `romanisation system`:
       * `0`: [Cantonese Pinyin (教院拼音)](https://en.wikipedia.org/wiki/Cantonese_Pinyin)
       * `1`: [Canton Romanization (廣州拼音)](https://en.wikipedia.org/wiki/Guangdong_romanisation#Cantonese)
       * `2`: [International Phonetic Alphabet (IPA) (國際音標)](https://en.wikipedia.org/wiki/International_Phonetic_Alphabet)
       * `3`: [Jyutping (粵拼)](https://en.wikipedia.org/wiki/Jyutping)
       * `4`: [Penkyamp (Diacritics) (粵語拼音字)](http://cantonese.wikia.com/wiki/Penkyamp)
       * `5`: [Penkyamp (Numerals) (粵語拼音字)](http://cantonese.wikia.com/wiki/Penkyamp)
       * `6`: [Sidney Lau (劉錫祥)](https://en.wikipedia.org/wiki/Sidney_Lau_romanisation)
       * `7`: [S. L. Wong (Diacritics) (黃錫凌)](https://en.wikipedia.org/wiki/S._L._Wong_(romanisation))
       * `8`: [S. L. Wong (Numerals) (黃錫凌)](https://en.wikipedia.org/wiki/S._L._Wong_(romanisation))
       * `9`: [Yale (Diacritics) (耶魯拼音)](https://en.wikipedia.org/wiki/Yale_romanisation_of_Cantonese)
       * `10`: [Yale (Numerals) (耶魯拼音)](https://en.wikipedia.org/wiki/Yale_romanisation_of_Cantonese)

## Instructions

### Run from ShareSheet

 1. Highlight text
 2. Tap share
 3. Select `Run Script`
 4. Tap `Cantonese Romanisation`

### Run in Scriptable app

#### From clipboard

1. Copy text to clipboard
2. Open Scriptable
3. Tap `Cantonese Romanisation`
4. Select `From Clipboard 📋`

#### Manual input

1. Open Scriptable
2. Tap `Cantonese Romanisation`
3. Select `Convert 🔄`

## Accreditation

This wouldn't have been possible without the work from both [dohliam](https://github.com/dohliam) and [hanleyweng](https://github.com/hanleyweng) in their respective repos:

* [CantoJpMin](https://github.com/hanleyweng/CantoJpMin)
* [pingyam-js](https://github.com/dohliam/pingyam-js)

## See also

* [Pingyam database](https://github.com/kfcd/pingyam) - A comprehensive list of every possible Cantonese syllable in all major romanisation systems
* [pingyam-rb](https://github.com/dohliam/pingyam-rb) - Ruby library for converting between Cantonese romanisation systems

## License

* romanisation data has been released under a [CC BY license](https://github.com/kfcd/pingyam/blob/master/LICENSE) by the [kfcd](https://github.com/kfcd/) project.
* pingyam-js has been released under an [MIT BY license](https://github.com/dohliam/pingyam-js/blob/master/LICENSE) by [dohliam](https://github.com/dohliam) project.
