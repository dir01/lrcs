import getpass
import os

def apply_to(env):
    env.update(dict(
        host_string = 'localhost',
        project_root = os.path.dirname(env.real_fabfile),
        virtualenv_root = os.environ['VIRTUAL_ENV'],
        user = getpass.getuser(),
        group = os.getgid(),
    ))