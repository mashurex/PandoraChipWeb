#!/usr/bin/env bash

user="${1}"
pcw_home="${2}"
pcw_io_home="${3}"

cat > /tmp/pcw-service << EOL
#!/usr/bin/env bash
### BEGIN INIT INFO
# Provides: pcw
# Required-Start: $local_fs $network
# Required-Stop: $local_fs
# Default-Start: 2 3 4 5
# Default-Stop: 0 1 6
# Short-Description: pcw
# Description: pcw Pandora Service Client
### END INIT INFO

RUN_AS="${user}"
su -l \${RUN_AS} -c "${pcw_home}/scripts/pcw.sh \${1}"
EOL
sudo mv /tmp/pcw-service /etc/init.d/pcw
sudo chmod +x /etc/init.d/pcw

cat > /tmp/pcw-io-service << EOL
#!/usr/bin/env bash
### BEGIN INIT INFO
# Provides: pcw-io
# Required-Start: $local_fs $network pcw
# Required-Stop: $local_fs
# Default-Start: 2 3 4 5
# Default-Stop: 0 1 6
# Short-Description: pcw-io
# Description: pcw gpio service
### END INIT INFO

export PCW_IO_HOME="${pcw_io_home}"
RUN_AS="${user}"
su \${RUN_AS} -c "${pcw_io_home}/bin/pcw-io.sh \${1}"
EOL
sudo mv /tmp/pcw-io-service /etc/init.d/pcw-io
sudo chmod +x /etc/init.d/pcw-io

sudo update-rc.d pcw defaults
# Don't run I/O on default
# sudo update-rc.d pcw-io defaults