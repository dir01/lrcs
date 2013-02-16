require ['lib/jquery', 'core/lastfm', 'models/track'], ($, LastFm, Track) ->

    describe('Track fetching', ->
        beforeEach(=>
            @dfd = $.Deferred()
            spyOn(LastFm, 'getTrackInfo').andReturn @dfd
        )

        it('fetches track info from last.fm api', =>
            track = new Track(artist: 'FooArtist', title: 'FooTitle')
            track.fetch()
            expect(LastFm.getTrackInfo).toHaveBeenCalledWith('FooArtist', 'FooTitle')
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
