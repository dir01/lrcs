import jinja2
from settings import settings

jinja2_env = jinja2.Environment(
    loader = jinja2.FileSystemLoader(settings.TEMPLATE_DIR)
)