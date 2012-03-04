import os
import sys

from fabric.api import env
from fabric.context_managers import cd, prefix
from fabric.contrib.files import exists
from fabric.operations import sudo, run

from utils.converters import asbool


# Maintainance

def update_code():
    with cd(env.project_root):
        run('git reset --hard')
        run('git pull')


def start_twistd():
    with virtualenv():
        run('twistd --pidfile={pidfile} --logfile={logfile}  -y {tacfile}'.format(
            **_get_twistd_attributes()
        ))


def stop_twistd():
    run('kill `cat {pidfile}`'.format(
        **_get_twistd_attributes()
    ))


def _get_twistd_attributes():
    pidfile = os.path.join(env.project_root, 'var', 'run', 'twistd.pid')
    logfile = os.path.join(env.project_root, 'var', 'log', 'twistd.log')
    tacfile = os.path.join(env.project_root, 'webserver', 'lrcs.tac')
    return locals()


# Deployment

def deploy(have_sudo=True):
    if asbool(have_sudo):
        install_virtualenv()
    create_virtualenv()
    clone_repo()
    install_python_dependencies()


def install_virtualenv():
    sudo('easy_install virtualenv')


def create_virtualenv():
    if exists(env.virtualenv_root):
        return
    run('mkdir -p {virtualenv_root}'.format(**env))
    run('chown {user}:{group} {virtualenv_root}'.format(**env))
    run('virtualenv --no-site-packages --distribute --python=python2.7 {virtualenv_root}'.format(**env))


def clone_repo():
    if not exists(os.path.join(env.project_root, '.git')):
        run('git clone {project_git_url} {project_root}'.format(**env))


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