# URL Scanner - Image Accessibility Auditor

A full-stack web application designed to audit webpages for image accessibility. It scrapes a target URL, extracts all image elements, evaluates them for missing `alt` attributes, and stores the scan metrics into a PostgreSQL database. 

**Key Features:**
* **Web Scraping:** Bypasses basic bot-blocks and extracts DOM image elements using `httpx` and `BeautifulSoup4`.
* **Accessibility Auditing:** Calculates pass/fail rates for image `alt` tags and visualizes them using interactive SVG donut charts.
* **Secure Authentication:** Utilizes a custom JWT Bearer Token architecture (LocalStorage + Headers) to bypass cross-origin cookie restrictions.
* **Database Logging:** Automatically saves user scan history, including total images, missing alt counts, and timestamps.

**Tech Stack:**
* **Frontend:** React, Vite
* **Backend:** FastAPI, PostgreSQL, SQLAlchemy, Alembic, UV

---

## 💻 Frontend Development

The frontend is a React application built with Vite.

### Setup and Running

1. Open a new terminal and navigate to your frontend directory (e.g., `cd frontend`).
2. Install the required Node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. The frontend will be available at `http://localhost:5173`. 

*Note: Ensure your backend is running on `http://localhost:8000` so the React application can successfully make API calls.*

---

## ⚙️ Backend Development (FastAPI)

This project was generated using `fastapi_template` and uses `uv`, a modern Python dependency management tool.

### UV Setup

To run the project locally using `uv`, use this set of commands:

```bash
uv sync --locked
uv run -m url_scanner
```

This will start the backend server on `http://localhost:8000`. You can find the Swagger interactive API documentation at `http://localhost:8000/api/docs`.

You can read more about `uv` here: [https://docs.astral.sh/uv/](https://docs.astral.sh/uv/) *(Note: The original template links to Ruff, but UV is the package manager).*

### Docker

You can start the project with Docker using this command:

```bash
docker-compose up --build
```

If you want to develop in Docker with autoreload and exposed ports, add `-f deploy/docker-compose.dev.yml` to your docker command. Like this:

```bash
docker-compose -f docker-compose.yml -f deploy/docker-compose.dev.yml --project-directory . up --build
```

This command exposes the web application on port 8000, mounts the current directory, and enables autoreload. You must rebuild the image every time you modify `uv.lock` or `pyproject.toml` with this command:

```bash
docker-compose build
```

### Configuration

This application can be configured with environment variables. You can create a `.env` file in the root backend directory and place all environment variables there. 

All environment variables should start with the `URL_SCANNER_` prefix. For example, if you see a variable named `random_parameter` in `url_scanner/settings.py`, you should provide the `URL_SCANNER_RANDOM_PARAMETER` variable to configure it.

An example of a `.env` file:
```bash
URL_SCANNER_RELOAD="True"
URL_SCANNER_PORT="8000"
URL_SCANNER_ENVIRONMENT="dev"
```

### Migrations

Database migrations are handled by Alembic. To migrate your PostgreSQL database, run the following commands:

```bash
# To perform all pending migrations.
alembic upgrade "head"

# To run all migrations until a specific revision_id.
alembic upgrade "<revision_id>"
```

**Reverting migrations:**
```bash
# Revert all migrations up to: revision_id.
alembic downgrade <revision_id>

# Revert everything.
alembic downgrade base
```

**Migration generation:**
```bash
# For automatic change detection (after updating your SQLAlchemy models).
alembic revision --autogenerate

# For empty file generation.
alembic revision
```

### Running Tests

To run tests on your local machine:
1. Start a local PostgreSQL database. You can do this quickly with Docker:
   ```bash
   docker run -p "5432:5432" -e "POSTGRES_PASSWORD=url_scanner" -e "POSTGRES_USER=url_scanner" -e "POSTGRES_DB=url_scanner" postgres:18.1-bookworm
   ```
2. Run pytest:
   ```bash
   pytest -vv .
   ```

If you prefer to run the tests entirely inside Docker, simply run:
```bash
docker-compose run --build --rm api pytest -vv .
docker-compose down
```

### Pre-commit

To install pre-commit, simply run this inside the shell:
```bash
pre-commit install
```

Pre-commit checks your code before publishing it, configured via the `.pre-commit-config.yaml` file. By default, it runs `mypy` (validates types) and `ruff` (spots possible bugs).

---

## 📂 Backend Project Structure

```bash
$ tree "url_scanner"
url_scanner
├── conftest.py  # Fixtures for all tests.
├── db           # module contains db configurations
│   ├── dao      # Data Access Objects. Contains classes to interact with database.
│   └── models   # Package contains different models for ORMs.
├── __main__.py  # Startup script. Starts uvicorn.
├── services     # Package for external services (rabbit, redis, etc).
├── settings.py  # Main configuration settings for project.
├── static       # Static content.
├── tests        # Tests for project.
└── web          # Package contains web server. Handlers, startup config.
    ├── api      # Package with all API endpoints/handlers.
    │   └── router.py # Main router.
    ├── application.py # FastAPI application configuration.
    └── lifespan.py    # Contains actions to perform on startup and shutdown.
```