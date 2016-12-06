#Pianobar C.H.I.P. Webserver and Jukebox

A web and GPIO interface for [pianobar](https://github.com/PromyLOPh/pianobar) running on a [C.H.I.P.](https://getchip.com/pages/chip). This code was used to create a dedicated C.H.I.P. Pianobar Jukebox.

The code provided has a basic browser based interface and also allows for control with three buttons physically wired to the C.H.I.P.. 

These can be extended to allow control from anywhere or anything as the web component is basically a WebSocket based API for a running pianobar instance.

Plug some speakers into the C.H.I.P. and you're ready to go.

![Chip Image](/chip.png?raw=true "CHIP with LiPo Battery and 3 buttons")

## How Does It Work
There are two main components *(Web and GPIO)* that are used to 'remotely' control music. 

Together they let you control your C.H.I.P. pianobar jukebox via browser, app, or physical hardware.
   
### PCW: The Web Component
The web component is known as `PCW` and is a single page web application that uses WebSockets for real time communication. This allows anyone on your local network to pull up the webpage and control the pianobar instance from any device.

The web component uses NGINX to serve up the static assets and a Node.js WebSocket server to do all the work. I found that this performed much faster than having Node.js also act as the asset server.

### PCW I/O: The GPIO Component
The GPIO component is another Node.js process running and listening for GPIO activities (physical button presses) that translates the activities and sends them to the PCW WebSocket server locally.

This process does not run by default, though it gets installed. You can find it in the `lib/pcw-io` directory.
   
## Compatibility
Designed for a tested against Debian Jessie running on a C.H.I.P. with version 4.4 headless firmware.

Included is a Vagrant configuration for local debug and testing of everything but the `PCW I/O` components *(they need to be run and tested on the CHIP)*.
   
Developed and tested on Mac OS X running a Vagrant Debian Jessie image created from the provided `Vagrantfile`.   

## Dependencies

The install script should install everything needed to get this running, but here's a brief overview of what is required and/or tested against:

- A CHIP running 4.4 headless firmware or some other Debian Jessie system
- NGINX
- Node 7.2
- NPM 3.10
- pianobar 2016.06.02 (which is downloaded and built from source)

## Installation

- You should clone this to your chip user's home directory (`/home/chip` by default).    
- `cd PandoraChipWeb/scripts`
- `./install.sh`
    + **!!!** Run this install command as your user (`chip`), not as root, and not with `sudo`.
    + If you're running this on a CHIP it will take a **LONG** time.
- `nano ~/.config/pianobar/config`
    + Replace the email and password placeholders with your own
- `sudo /etc/init.d/pcw start`
    + The only time you will have to tell the web service to start is this very first time
- Now browse to your CHIP's IP address or hostname.
     + If you followed [this](http://docs.getchip.com/chip.html#zero-configuration-networking) guide you should be able to browse to `http://chip.local`.
- In your browser window, press the start button to actually start pianobar
- Enjoy

