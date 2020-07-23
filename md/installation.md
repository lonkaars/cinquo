# Installation

## This is a guide for Windows and Linux

> If you plan on developing for Cinquo, or develop node applications yourself, you might want to consider installing [nvm](https://github.com/nvm-sh/nvm) or [nvm for windows](https://github.com/coreybutler/nvm-windows/releases). This makes it really easy to manage and swap between node versions.

1. Make sure you have Node 12 installed by running `node -v` in a command prompt. You can download it [here](https://nodejs.org/dist/latest-v12.x/), or run `nvm install 12.x.x` and `nvm use 12`
2. If you run Windows, you should now open a new administrator command prompt, and run `npm i -g windows-build-tools` if you don't have Windows build tools for node already installed
3. `cd` into the directory where you want Cinquo to live, it currently only runs in portable mode since it doesn't place files in `~/.config/cinquo` or `%appdata%/cinquo`
4. `git clone https://github.com/lonkaars/cinquo`
5. `cd cinquo/src`
6. `npm i`
7. `npm i -g typescript electron-rebuild`
8. `npm list electron`
9. `electron-rebuild . --version=<electron version>`
10. `tsc`

<div align="center">
<b>You have now installed Cinquo, to start run `npm start` in cinquo's root directory</b>
<h2>🎉</h2>

If you want to set up midi as well, take a look at the <a href="midi.md">midi setup guide</a>
</div>


