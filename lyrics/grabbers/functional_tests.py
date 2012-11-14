# -*- coding: utf-8 -*-
from twisted.internet.defer import inlineCallbacks
from twisted.trial.unittest import TestCase, SkipTest
from twisted.web.client import getPage

from lyrics.grabbers.azlyrics_com import AZLyricsLyricsGainer
from lyrics.grabbers.lyrics_wikia_com import LyricsWikiaComLyricsGainer
from lyrics.grabbers.songmeanings_net import SongMeaningsLyricsGainer
from lyrics.grabbers.vkontakte_ru import VkontakteLyricsGainer
from lyrics.errors import LyricsNotFound
from utils.testing import assertInlineCallbackRaises


class BaseSiteLyricsGainerTestCase(TestCase):
    TESTED_LYRICS_GAINER_CLASS = NotImplemented

    def getLyrics(self, artist, track):
        return self.buildGainer(artist, track).get()

    def buildGainer(self, artist, track):
        return self.TESTED_LYRICS_GAINER_CLASS(artist, track)


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


class TestSongMeaningsNetLyricsGainer(BaseSiteLyricsGainerTestCase):
    TESTED_LYRICS_GAINER_CLASS = SongMeaningsLyricsGainer

    @inlineCallbacks
    def test_search_matches_artist_exactly(self):
        # When searched artist matches exactly, url
        # http://www.songmeanings.net/query/?query=cat%20power&type=artists
        # redirects directly to the artist page on url
        # http://www.songmeanings.net/artist/view/songs/7465/
        lyrics = yield self.getLyrics('Cat Power', 'Silent Machine')
        self.assertIn('silent machine is eating me child', lyrics.lower())

    @inlineCallbacks
    def test_artist_search_renders_search_page(self):
        # There is more then 1 artist with name, for instance, Atmosphere on
        # http://www.songmeanings.net/query/?query=atmosphere&type=artists
        lyrics = yield self.getLyrics('Atmosphere', 'Like Today')
        self.assertIn('I wanna kiss her mom just for having this daughter', lyrics)

    @inlineCallbacks
    def test_lyrics_page_is_empty(self):
        raise SkipTest('')
        with assertInlineCallbackRaises(LyricsNotFound):
            lyrics = yield self.getLyrics('Cat Power', 'Cherokee')

    @inlineCallbacks
    def test_korn_twisted_transistor(self):
        with assertInlineCallbackRaises(LyricsNotFound):
            lyrics = yield self.getLyrics('koRn', 'twisted transistor')

    @inlineCallbacks
    def test_artist_page_has_more_popular_result_which_is_not_exact_match(self):
        # If this test breaks, it's possible that Pink became more popular than Pink Floyd
        # ... or wait, that's impossible
        pink_search_url = 'http://www.songmeanings.net/query/?query=pink&type=artists'
        pink_serp = yield getPage(pink_search_url)
        selected_url = self.TESTED_LYRICS_GAINER_CLASS.getArtistSearchUrlByArtistsPage('pink', pink_serp)
        pink_artist_url = 'http://www.songmeanings.net/artist/view/songs/70/'
        self.assertEqual(pink_artist_url, selected_url)


class TestVkontakteLyricsGainer(BaseSiteLyricsGainerTestCase):
    TESTED_LYRICS_GAINER_CLASS = VkontakteLyricsGainer

    @inlineCallbacks
    def test_cat_power_silent_machine(self):
        lyrics = yield self.getLyrics('Cat Power', 'Silent Machine')
        # TODO: That should raise error since lyrics is junk rather than real lyrics

    @inlineCallbacks
    def test_krovostok_besporyadki(self):
        lyrics = yield self.getLyrics('Кровосток', 'Беспорядки')
        self.assertIn(u'и уже потушат Кремль', lyrics)

    @inlineCallbacks
    def test_short_lyrics_are_filtered(self):
        with assertInlineCallbackRaises(LyricsNotFound):
            lyrics = yield self.getLyrics('Кровосток', 'Белый ягуар')

