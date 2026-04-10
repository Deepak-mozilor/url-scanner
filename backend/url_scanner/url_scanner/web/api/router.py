from fastapi.routing import APIRouter

from url_scanner.web.api import docs, monitoring
from url_scanner.web.api.scanner import router as scan_router
from url_scanner.web.api.security import router as security_router
from url_scanner.web.api.sign_up import router as signup_router

api_router = APIRouter()
api_router.include_router(monitoring.router)
api_router.include_router(docs.router)
api_router.include_router(security_router)
api_router.include_router(signup_router)
api_router.include_router(scan_router)
