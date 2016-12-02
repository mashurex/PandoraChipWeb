#!/usr/bin/env bash
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PCW_HOME="`cd "${SCRIPT_DIR}/..";pwd`"
PCW_IO_HOME="${PCW_HOME}/lib/pcw-io"
USER=$(whoami)

echo -e "Installing packages from apt..."
sudo apt-get update
sudo apt-get install -y libasound2 alsa-utils vim git build-essential
sudo apt-get install -y git libao-dev libgcrypt11-dev libgnutls28-dev libfaad-dev libmad0-dev libjson0-dev make pkg-config
sudo apt-get install -y libavfilter-dev libavformat-dev libswscale-dev libavresample-dev
sudo apt-get install -y curl libcurl4-gnutls-dev nginx

echo -e "Installing pianobar from source..."
sudo su - root
git clone https://github.com/PromyLOPh/pianobar.git /usr/src/pianobar
cd /usr/src/pianobar
make
make install
mkdir lib
ldd `which pianobar` | grep "=> /" | awk '{print $3}' | xargs -I '{}' cp -v '{}' ./lib > /dev/null
exit

echo -e "Configuring pianobar for ${USER}..."
mkdir -p ~/.config/pianobar
mkfifo ~/.config/pianobar/ctl
cp "${SCRIPT_DIR}/pianobar.config ~/.config/pianobar/config"
echo -e "event_command = ${PCW_HOME}/scripts/eventcmd.sh" >> ~/.config/pianobar/config
echo -e "" >> ~/.profile
echo -e "PCW ENV Settings" >> ~/.profile
echo -e "PCW_HOME=\"${PCW_HOME}\"" >> ~/.profile
echo -e "PCW_IO_HOME=\"${PCW_IO_HOME}\"" >> ~/.profile

echo -e "Installing Node/NPM..."
curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm set progress=false
npm set progress=false
sudo npm install -g node-sass gulp

echo -e "Configuring NGINX..."
sudo cat > /etc/nginx/sites-available/pcw << EOL
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root ${PCW_HOME}/build;

    index index.html index.htm index.nginx-debian.html;

    server_name _;

    location / {
        try_files $uri $uri/ =404;
    }
}
EOL
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -s /etc/nginx/sites-available/pcw /etc/nginx/sites-enabled/pcw

echo -e "Building PCW service..."
cd ${PCW_HOME}
npm install
gulp build
chmod +x bin/ws
chmod +x bin/*.sh
chmod +x scripts/*.sh

echo -e "Building PCW IO service..."
cd ${PCW_IO_HOME}
npm install
chmod +x bin/pcw-io
chmod +x bin/*.sh
