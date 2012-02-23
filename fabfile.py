import sys

from fabric.api import env
from fabric.context_managers import cd, prefix
from fabric.contrib.files import exists
from fabric.operations import sudo, run


def deploy():
    install_virtualenv()
    create_virtualenv()
    clone_repo()
    install_python_dependencies()


def install_virtualenv():
    sudo('easy_install virtualenv')


def create_virtualenv():
    sudo('mkdir -p {virtualenv_root}'.format(**env))
    sudo('chown {user}:{group} {virtualenv_root}'.format(**env))
    run('virtualenv --no-site-packages --distribute --python=python2.7 {virtualenv_root}'.format(**env))


def clone_repo():
    if not exists(env.project_root):
        sudo('mkdir -p {project_root}'.format(**env))
        sudo('chown {user}:{group} {project_root}'.format(**env))
        with cd(env.project_root):
            run('git clone {project_git_url}'.format(**env))


def install_python_dependencies():
    with virtualenv():
        run('pip install -r deploy/requirements.txt')


# Environment

def activate(environment_name):
    module_name = 'deploy.environments.{0}'.format(environment_name)
    try:
        environment = __import__(module_name, globals(), locals(), ['apply_to'], -1)
        environment.apply_to(env)
    except ImportError:
        print 'Module {0} have no apply_to function or does not exists'.format(module_name)
        sys.exit()


# Utils

def virtualenv():
    activation_sequence = [
        'cd {project_root}',
        'export PYTHONPATH=.',
        'source {virtualenv_root}/bin/activate',
    ]
    return prefix(' && '.join(activation_sequence).format(**env))