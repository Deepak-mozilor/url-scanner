from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from url_scanner.log import configure_logging
from url_scanner.web.api.router import api_router
from url_scanner.web.lifespan import lifespan_setup
from url_scanner.settings import settings


APP_ROOT = Path(__file__).parent.parent


def get_app() -> FastAPI:
    """
    Get FastAPI application.

    This is the main constructor of an application.

    :return: application.
    """
    configure_logging()
    app = FastAPI(
        title="url_scanner",
        lifespan=lifespan_setup,
        docs_url=None,
        redoc_url=None,
        openapi_url="/api/openapi.json",
    )

    app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins, # MUST be the exact React URL, not "*"
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

    # Main router for the API.
    app.include_router(router=api_router, prefix="/api")
    
    # Adds static directory.
    # This directory is used to access swagger files.
    app.mount("/static", StaticFiles(directory=APP_ROOT / "static"), name="static")

    return app
