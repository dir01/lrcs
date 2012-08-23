# -*- coding: utf-8 -*-
from twisted.internet.defer import inlineCallbacks
from twisted.trial.unittest import TestCase
from webserver.lyrics_gainers import LyricsWikiaComLyricsGainer, LyricsNotFound, AZLyricsLyricsGainer
from utils.testing import assertInlineCallbackRaises


class BaseSiteLyricsGainerTestCase(TestCase):
    TESTED_LYRICS_GAINER_CLASS = NotImplemented

    def getLyrics(self, artist, track):
        return self.TESTED_LYRICS_GAINER_CLASS(artist, track).get()


class TestLyricsWikiaComLyricsGainer(BaseSiteLyricsGainerTestCase):
    TESTED_LYRICS_GAINER_CLASS = LyricsWikiaComLyricsGainer

    @inlineCallbacks
    def test_gorillaz_intro_exists(self):
        lyrics = yield self.getLyrics(u'Gorillaz', u'Intro')
        self.assertIn(u'Who put me on the bottom of the food chain', lyrics)

    @inlineCallbacks
    def test_lcd_soundsystem_someone_great_raises_copyright_error(self):
        with assertInlineCallbackRaises(LyricsNotFound):
            lyrics = yield self.getLyrics('LCD Soundsystem', 'Someone Great')

    @inlineCallbacks
    def test_bjork_hunter_exists(self):
        lyrics = yield self.getLyrics('Björk', 'Hunter')
        self.assertIn('hunter', lyrics)

    @inlineCallbacks
    def test_bjork_bachelorette_exists(self):
        lyrics = yield self.getLyrics('Björk', 'Bachelorette')
        self.assertIn('Loving me is the easiest thing', lyrics)

    @inlineCallbacks
    def test_queen_adreena_come_down(self):
        with assertInlineCallbackRaises(LyricsNotFound):
            lyrics = yield self.getLyrics('Queen Adreena', 'Come Down')

    @inlineCallbacks
    def test_refused_worms_of_senses(self):
        lyrics = yield self.getLyrics('Refused', 'Worms Of The Senses/Faculties Of The Skull')
        self.assertIn('Let\'s take the first bus out of here', lyrics)


class TestAZLyricsLyricsGainer(BaseSiteLyricsGainerTestCase):
    TESTED_LYRICS_GAINER_CLASS = AZLyricsLyricsGainer

    @inlineCallbacks
    def test_gorillaz_clint_eastwood(self):
        lyrics = yield self.getLyrics('Gorillaz', 'Clint Eastwood')
        self.assertIn('My future is coming on', lyrics)

    @inlineCallbacks
    def test_lcd_soundsystem_someone_great_exists(self):
        lyrics = yield self.getLyrics('LCD Soundsystem', 'Someone Great')
        self.assertIn('When someone great is gone', lyrics)

    @inlineCallbacks
    def test_bjork_bachelorette(self):
        lyrics = yield self.getLyrics('Björk', 'Bachelorette')
        self.assertIn('I\'m a tree that grows hearts', lyrics)

