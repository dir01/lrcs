from contextlib import contextmanager


@contextmanager
def assertInlineCallbackRaises(exc_type):
    """
        @inlineCallbacks
        def test_call_fails_if_request_empty_string(self):
            with assertInlineCallbackRaises(EmptyStringException):
                value = yield self.call('')
    """
    try:
        yield
    except exc_type:
        pass
    except Exception, e:
        raise AssertionError('Expected exception %s, not %s %s' % (
            exc_type.__name__, type(e), str(e)
        ))
    else:
        raise AssertionError('%s was not raised' % exc_type.__name__)
