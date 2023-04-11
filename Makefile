VENV = myenv

install:
	python -m venv $(VENV)
	make activate
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
	npx prettier --write .

build:
	@echo Building application...
	make clean
	make install
	make format
	make lint

# For Linux or macOS:
# source $(VENV)/bin/activate
# For Windows:
activate:
	@echo Activating virtual environment...
	call .\$(VENV)\Scripts\activate.bat
	