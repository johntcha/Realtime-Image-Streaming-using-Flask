VENV = myenv

install:
	python -m venv $(VENV)
# For Linux or macOS:
# source $(VENV)/bin/activate && pip install -r requirements.txt
# For Windows:
	.\$(VENV)\Scripts\activate.bat && pip install -r requirements.txt

lint:
	pylint *.py

run:
	flask run

clean:
# For Linux or macOS (also gitbash):
#find . -name "*.pyc" -delete
#find . -name "__pycache__" -delete
	del /s *.pyc
	del /s __pycache__

format:
	black .
	npx prettier --write .

build:
	@echo Building application...
	make clean
	make install
	make format
	