# -*- mode: ruby -*-
# vi: set ft=ruby :

# All Vagrant configuration is done below. The "2" in Vagrant.configure
# configures the configuration version (we support older styles for
# backwards compatibility). Please don't change it unless you know what
# you're doing.
Vagrant.configure("2") do |config|
  config.vm.box = "debian/jessie64"
  config.vm.network "forwarded_port", guest: 3000, host: 3000
  config.vm.network "forwarded_port", guest: 8080, host: 8080
  config.vm.network "private_network", ip: "192.168.33.50"
  config.vm.hostname = "pcw.vagrant.app"

  # Share an additional folder to the guest VM. The first argument is
  # the path on the host to the actual folder. The second argument is
  # the path on the guest to mount the folder. And the optional third
  # argument is a set of non-required options.
  # config.vm.synced_folder "../data", "/vagrant_data"
  config.vm.synced_folder ".", "/vagrant", type: "virtualbox"

  config.vm.provider "virtualbox" do |vb|
    vb.memory = "1024"
  end

  config.vm.provision "shell", inline: <<-SHELL
    sudo apt-get update
    sudo apt-get install -y libasound2 alsa-utils vim git build-essential
    sudo apt-get install -y git libao-dev libgcrypt11-dev libgnutls28-dev libfaad-dev libmad0-dev libjson0-dev make pkg-config
    sudo apt-get install -y libavfilter-dev libavformat-dev libswscale-dev libavresample-dev
    sudo apt-get install -y curl libcurl4-gnutls-dev
    curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
    sudo apt-get install -y nodejs
    sudo npm set progress=false
    npm set progress=false
    sudo npm install -g node-sass gulp
    sudo git clone https://github.com/PromyLOPh/pianobar.git /usr/src/pianobar
    mkdir -p ~/.config/pianobar
    mkfifo ~/.config/pianobar/ctl
  SHELL
end
