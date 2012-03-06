# -*- coding: utf-8 -*-
from twisted.internet.defer import inlineCallbacks
from twisted.trial.unittest import TestCase
from webserver.lyrics_gainers import LyricsWikiaComLyricsGainer, LyricsNotFound


class TestLyricsWikiaComLyricsGainer(TestCase):
    @inlineCallbacks
    def test_gorillaz_intro_exists(self):
        expected_lyrics = u'Who put me on the bottom of the food chain! x10\
\n\nYou are now entering the harmonic world!!!\n\n'
        lyrics = yield self.get_lyrics(u'Gorillaz', u'Intro')
        self.assertEqual(expected_lyrics, lyrics)

    @inlineCallbacks
    def test_lcd_soundsystem_someone_great_raises_copyright_error(self):
        exception_raised = False
        try:
            lyrics = yield self.get_lyrics('LCD Soundsystem', 'Someone Great')
        except LyricsNotFound:
            exception_raised = True
        assert exception_raised

    @inlineCallbacks
    def test_bjork_hunter_exists(self):
        lyrics = yield self.get_lyrics('Björk', 'Hunter')
        self.assertIn('hunter', lyrics)

    @inlineCallbacks
    def test_bjork_bachelorette_exists(self):
        lyrics = yield self.get_lyrics('Björk', 'Bachelorette')

    def get_lyrics(self, artist, track):
        return LyricsWikiaComLyricsGainer(artist, track).get()
