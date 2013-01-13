from azlyrics_com import AZLyricsLyricsGainer
from lyrics_wikia_com import LyricsWikiaComLyricsGainer
from songmeanings_net import SongMeaningsLyricsGainer
from vkontakte_ru import VkontakteLyricsGainer


PRIORITIZED_LYRICS_GAINERS_LIST = [
    LyricsWikiaComLyricsGainer,
    AZLyricsLyricsGainer,
    SongMeaningsLyricsGainer,
    VkontakteLyricsGainer
]
