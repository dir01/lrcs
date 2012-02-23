import os

__all__ = (
    'PROJECT_ROOT',
    'TEMPLATE_DIR',
)

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
TEMPLATE_DIR = os.path.join(PROJECT_ROOT, 'templates')