sudo apt-get install python3.7 python3.7-dev python3-virtualenv python3-pip apache2-dev \
     libpq-dev build-essential libssl-dev libffi-dev libxslt1-dev zlib1g-dev -y

sudo cp -r api/ /var/www/forecast-api
sudo -H python3.7 -m virtualenv -p python3.7 /var/www/forecast-api/venv

sudo chmod -R 777 /var/www/forecast-api
source /var/www/forecast-api/venv/activate
pip install wheel
pip install -r /var/www/forecast-api/requirements.txt
sudo chmod -R 700 /var/www/forecast-api

sudo cp forecast-api.conf /etc/apache2/sites-available/
sudo a2ensite forecast-api
sudo service apache2 reload
