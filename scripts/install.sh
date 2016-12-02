#!/usr/bin/env bash
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
export PCW_HOME="`cd "${SCRIPT_DIR}/..";pwd`"
export PCW_IO_HOME="${PCW_HOME}/lib/pcw-io"
USER=$(whoami)

if [ "${USER}" == "root" ]; then
    echo -e "Do not run this script as root, but do run it as a sudoer."
    exit 1
fi

echo -e "Installing packages from apt..."
sudo apt-get update
sudo apt-get install -y libasound2 alsa-utils vim git build-essential
sudo apt-get install -y git libao-dev libgcrypt11-dev libgnutls28-dev libfaad-dev libmad0-dev libjson0-dev make pkg-config
sudo apt-get install -y libavfilter-dev libavformat-dev libswscale-dev libavresample-dev
sudo apt-get install -y curl libcurl4-gnutls-dev nginx

echo -e "Installing pianobar from source..."
sudo git clone https://github.com/PromyLOPh/pianobar.git /usr/src/pianobar
cd /usr/src/pianobar
sudo make
sudo make install
sudo mkdir lib
sudo sh -c "ldd `which pianobar` | grep \"=> /\" | awk '{print $3}' | xargs -I '{}' cp -v '{}' ./lib > /dev/null"

echo -e "Configuring pianobar for ${USER}..."
mkdir -p ~/.config/pianobar
mkfifo ~/.config/pianobar/ctl
cp "${SCRIPT_DIR}/pianobar.config" ~/.config/pianobar/config
echo "event_command = ${PCW_HOME}/scripts/eventcmd.sh" >> ~/.config/pianobar/config
cat >> ~/.profile << EOL

# PCW ENV Settings
export PCW_HOME="${PCW_HOME}"
export PCW_IO_HOME="${PCW_IO_HOME}"

EOL

cat >> ~/.bashrc << EOL

# PCW ENV Settings
export PCW_HOME="${PCW_HOME}"
export PCW_IO_HOME="${PCW_IO_HOME}"

EOL

echo -e "Stopping NGINX for configuration..."
sudo service nginx stop

echo -e "Configuring NGINX..."
cat > /tmp/pcw << EOL
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root ${PCW_HOME}/build;

    index index.html index.htm index.nginx-debian.html;

    server_name _;

    location / {
        try_files \$uri \$uri/ =404;
    }
}

EOL

sudo mv /tmp/pcw /etc/nginx/sites-available/pcw
echo -e "Removing default NGINX site link..."
sudo rm -f /etc/nginx/sites-enabled/default
echo -e "Installing PCW NGINX site link..."
sudo ln -s /etc/nginx/sites-available/pcw /etc/nginx/sites-enabled/pcw


echo -e "Installing Node/NPM..."
curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
sudo apt-get install -y nodejs
npm set progress=false
sudo npm set progress=false
sudo npm install -g node-sass gulp

echo -e "Building PCW service..."
cd "${PCW_HOME}"
npm install
gulp build
chmod +x bin/ws
chmod +x bin/*.sh
chmod +x scripts/*.sh

echo -e "Starting NGINX now that the website is built..."
sudo service nginx start

echo -e "Building PCW I/O service..."
cd "${PCW_IO_HOME}"
npm install
chmod +x bin/pcw-io
chmod +x bin/*.sh

echo -e "Installing PCW startup scripts to /etc/init.d"
./install-services.sh "${user}" "${PCW_HOME}" "${PCW_IO_HOME}"

echo -e "PCW will now automatically start on boot, to change this run the uninstall-services.sh script located in this directory"
echo -e "All done."
