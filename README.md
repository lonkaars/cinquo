# Cinquo

## An open-source Quadro alternative

Quadro was an awesome app that would let you control your PC with virtual
launchpads. Unfortunately Quadro was removed from the App Store. I've attempted
to recreate Quadro from the ground up using web technologies, because almost
all devices support PWA's and they don't have to follow Apple's App Store
guidelines.

Currently this project is still a work-in-progress, but some funcitonality is
here! Buttons, sliders, and a basic settings app is working. Unfortunately,
there is currently no easy way to create tiles, because they're written in JSON
and there isn't a finished GUI to create and manage them, although I have
included a JSON schema that should add autocomplete functionality to vscode/coc
when editing the palette files.

The server is currently pretty buggy with creating new palettes and I'm
considering creating a seperate module for managing palettes. If you don't care
for the gui you can also run just the server by running `node server/index.js`
in the src/ directory, though you'll need to reinstall your npm dependencies if
you've ran electron-rebuild. Most settings are in server/user/ but I'm working
on creating an os-dependent config store, so settings will be in ~/.config on
Linux and %appdata%\ on Windows in the future.

### Important notes

- Some important code is commented out or messy because I was testing on Linux,
  full compatibility soon™ (affected files are in src/server, notably
  processMetadata.ts and actions.ts)
- I've decided (after 7 months) that I'll never finish this enough to call it
  usable before uploading it to GitHub, so here it is I guess.

---

### Screenshots

<p float="left">
  <img src="/md/client.png" width="49%"/>
  <img src="/md/settings.png" width="50%"/>
</p>

---

### Features

Buttons that launch:

- Node.js modules
- Files, such as executables or documents in their default app
- Midi messages
- Keystrokes (currently Windows only, because node 12 RobotJS)
- Commands (pretty much useless on Windows but useful on Linux)

Sliders that launch:

- Midi messages
- System volume changes
- Screen brightness changes
- Node.js modules

---

### Installation

Installation guide is [here](md/installation.md)

---

### Future features

Cinquo is currently in a pretty much unusable state for regular users. I
wouldn't recommend using this for important tasks, because all network traffic
isn't encrypted. 

See the issues tab for planned features, known bugs and progress on milestone
builds.
