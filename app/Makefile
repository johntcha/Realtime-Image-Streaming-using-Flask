install:
	pip install -r requirements.txt

lint:
	pylint *.py

run:
	flask run

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
	