from azlyrics_com import AZLyricsLyricsGainer
from lyrics_wikia_com import LyricsWikiaComLyricsGainer
from songmeanings_net import SongMeaningsLyricsGainer


PRIORITIZED_LYRICS_GAINERS_LIST = [
    LyricsWikiaComLyricsGainer,
    AZLyricsLyricsGainer,
    SongMeaningsLyricsGainer,
]
