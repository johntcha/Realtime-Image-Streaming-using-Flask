install:
	pip install -r requirements.txt

lint:
	black --check .

run:
	export FLASK_APP=app.py && flask run

run-windows:
	set FLASK_APP=app.py && flask run

clean:
	find . -name "*.pyc" -delete
	find . -name "__pycache__" -delete

format:
	black .

build:
	make clean
	make install
	make format
	make lint
	