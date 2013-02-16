require ['lib/jquery', 'collections/tracklist', 'models/album', 'core/lastfm'], ($, Tracklist, Album, LastFm) ->

    describe('Test album fetch', ->

        beforeEach(=>
            @dfd = $.Deferred()
            spyOn(LastFm, 'getAlbumInfo').andReturn(@dfd)
        )

        it('polls lastfm api for album info', =>
            album = new Album(artist: 'FooArtist', title: 'BarTitle')
            album.fetch()
            expect(LastFm.getAlbumInfo).toHaveBeenCalledWith('FooArtist', 'BarTitle')
        )

        it('updates itself with lastfm api response', =>
            album = new Album
            spyOn(album, 'set')
            album.fetch()
            @dfd.resolve()
            expect(album.set).toHaveBeenCalled()
        )

        it('triggers error event if lastfm api call failed', =>
            album = new Album
            spyOn(album, 'trigger')
            album.fetch()
            @dfd.reject()
            expect(album.trigger).toHaveBeenCalledWith('error')
        )
    )


    describe('Test album', ->

        it('isStub if no tracks and no image', =>
            album = new Album
            expect(album.isStub()).toBe(true)
        )

        it('not isStub if has tracks', =>
            album = new Album({tracks: true})
            expect(album.isStub()).toBe(false)
        )

        it('not isStub if has image', =>
            album = new Album({image: true})
            expect(album.isStub()).toBe(false)
        )

        it('isEmpty if no tracks', =>
            album = new Album
            expect(album.isEmpty()).toBe(true)
        )

        it('isEmpty if tracks of length 0', =>
            album = new Album(tracks: [])
            expect(album.isEmpty()).toBe(true)
        )

        it('not isEmpty if has tracks', =>
            album = new Album(tracks: [1, 2, 3])
            expect(album.isEmpty()).toBe(false)
        )

        it('returns proper artist', =>
            album = new Album(artist: 'FooArtist')
            expect(album.getArtist()).toBe('FooArtist')
        )

        it('returns proper title', =>
            album = new Album(title: 'BarTitle')
            expect(album.getTitle()).toBe('BarTitle')
        )

        it('returns proper image', =>
            album = new Album(image: 'whatever')
            expect(album.getImage()).toBe('whatever')
        )

        it('returns cached tracklist', =>
            album = new Album
            spyOn(album, 'createTracklist').andReturn('FakeTrackList')
            expect(album.getTracklist()).toBe('FakeTrackList')
            expect(album.getTracklist()).toBe('FakeTrackList')
            expect(album.createTracklist.calls.length).toBe(1)
        )

        it('creates tracklist collection by tracks', =>
            album = new Album(tracks: 'FooTracks')
            spyOn(Tracklist)
            album.createTracklist()
            expect(Tracklist).toHaveBeenCalledWith('FooTracks')
        )

    )

