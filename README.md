# Cinquo

## An open-source Quadro alternative

Quadro was an awesome app that would let you control your pc with virtual launchpads. Unfortunately Quadro was removed from the App Store. I've attempted to recreate Quadro from the ground up using web technologies, because almost all devices support pwa's and they don't have to follow Apple's App Store guidelines.

Currently this project is still a work-in-progress, but some funcitonality is here! Buttons, sliders, and a basic settings app is working. Unfortunately, there is currently no easy way to create tiles, because they're written in JSON and there isn't a finished GUI to create and manage them, although I have included a JSON schema that should add autocomplete functionality to vscode/coc when editing the palette files.

### Important notes

- Some important code is commented out or messy because I was testing on linux, full compatibility soon™ (affected files are in src/server, notably processMetadata.ts and actions.ts)
- I've decided (after 7 months) that I'll never finish this enough to call it usable before uploading it to github, so here it is I guess.

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
- Keystrokes (currently Windows only, because node 12 robotjs)
- Commands (pretty much useless on Windows but useful on linux)

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

Cinquo is currently in a pretty much unusable state for regular users. I wouldn't recommend using this for important tasks, because all network traffic isn't encrypted. RobotJS doesn't work on Linux (for me?) with Node 12 and electron, and there are performace issues that cause a delay when changing app focus and it being reflected client-side which doesn't happen on Windows.

There are however planned features for milestone builds 1.0.0 and 2.0.0

#### 1.0.0

- Fix performace issues in processMetadata.ts to remove delay between app focus changes for Linux
- Find a solution that makes RobotJS work on Linux
- Create a user-friendly interface for creating and managing palettes in the settings utility
- A plugin system that exposes an api, so other developers can add additional functionality, like new tile types, new actions and other cool stuff
- MacOS compatibility
- Use default system config file locations, and auto-generate the neccisary files
- Remove user-specified id's in palette files

#### 2.0.0

- Implement end-to-end encryption for all traffic
- Add password protection
- Add ability to create and manage palettes client-side

