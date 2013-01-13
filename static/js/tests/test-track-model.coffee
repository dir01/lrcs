Track = lrcs.models.Track

describe('lrcs.models.Track fetching', ->
  beforeEach(=>
    @dfd = $.Deferred()
    spyOn(lrcs.lastfm, 'getTrackInfo').andReturn @dfd
  )

  it('fetches track info from last.fm api', =>
    track = new Track(artist: 'FooArtist', title: 'FooTitle')
    track.fetch()
    expect(lrcs.lastfm.getTrackInfo).toHaveBeenCalledWith('FooArtist', 'FooTitle')
  )

  it('triggers _doneFetch if last.fm API call succeeded', =>
    track = new Track
    spyOn(track, '_doneFetch')
    track.fetch()
    @dfd.resolve()
    expect(track._doneFetch).toHaveBeenCalled()
  )

  it('triggers _failedFetch if last.fm API call failed', =>
    track = new Track
    spyOn(track, '_failedFetch')
    track.fetch()
    @dfd.reject()
    expect(track._failedFetch).toHaveBeenCalledWith('error')
  )

  it('isEqualTo other track if both artist and title match', ->
    track = new Track(artist: 'foo', title: 'bar')
    otherTrack = new Track(artist: 'foo', title: 'bar')
    expect(track.isEqualTo(otherTrack)).toBeTruthy()
  )

  it('hasSameAlbumAs if albumArtist and album title are equal', ->
    track1 = new Track(artist: 'Foo', albumArtist: 'Kitsune', album: 'Compilation')
    track2 = new Track(artist: 'Bar', albumArtist: 'Kitsune', album: 'Compilation')
    expect(track1.hasSameAlbumAs(track2)).toBeTruthy()
  )

)
