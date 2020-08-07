# Collegerama

## Info

Collegerama lacks a 'watch this video offline' button. This project can download lectures and its slides and can view it in your browser.
This repo is a fork of the repo [MartijnDwars/collegerama](https://github.com/MartijnDwars/collegerama).

## Release binaries

You can find pre-built executables for Windows and Mac [here](https://yoshi34.stackstorage.com/s/ctkUyA20YwAtowBU)


## Installation (No development)

1. `git clone https://github.com/djosh34/collegerama.git`
2. `cd collegerama`
3. `yarn install`
4. `yarn run start`


## Usage

To open Collegerama offline viewer go to `localhost:3000`.

### Downloading new lectures

1. Find the id of the lecture you want to view (you can find it on the collegerama site)
2. Go to `localhost:3000` 
3. Select `Download new videos`
4. Enter your lecture id
5. Hit Enter


### Viewing lectures

1. Go to `localhost:3000` 
2. Select `Search videos`
3. Select your downloaded lecture from the list
4. Enjoy!

## Development

To run the development server run `yarn run dev`