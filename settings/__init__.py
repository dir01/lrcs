import sys
import common


class SettingsObject(dict):
    def __getattr__(self, item):
        return self[item]

    def update_from_module(self, module):
        for member_name in module.__all__:
            self[member_name] = getattr(module, member_name)


settings = SettingsObject()
settings.update_from_module(common)
try:
    import local
    settings.update_from_module(local)
except ImportError:
    pass
