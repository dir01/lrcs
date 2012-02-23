import os

__all__ = (
    'PROJECT_ROOT',
    'TEMPLATE_DIR',
    'STATIC_ROOT',
)

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
TEMPLATE_DIR = os.path.join(PROJECT_ROOT, 'templates')
STATIC_ROOT = os.path.join(PROJECT_ROOT, 'static')
