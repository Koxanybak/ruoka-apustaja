sudo -u postgres psql -c "drop database if exists ruoka_apustaja;"
sudo -u postgres psql -c "create database ruoka_apustaja;"
sudo -u postgres psql -c "alter user postgres with password 'postgres';"

sudo -u postgres psql ruoka_apustaja < init.sql