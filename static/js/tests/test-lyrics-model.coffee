require ['models/lyrics'], (Lyrics) ->

    describe('lrcs.models.Lyrics', ->
        it('generates the right URL', ->
            lyrics = new Lyrics(artist: 'foo', track: 'bar')
            expect(lyrics.url()).toBe('/lyrics?artist=foo&track=bar')
        )

        it('isStub when no text', ->
            lyrics = new Lyrics
            expect(lyrics.isStub()).toBe(true)
        )

        it('isn\'t isStub if has text', ->
            lyrics = new Lyrics(lyrics: 'footext')
            expect(lyrics.isStub()).toBe(false)
        )

        it('converts ugly text to pretty', ->
            lyrics = new Lyrics(lyrics: 'Dear Chaisy Lain\n\nI write you to explain')
            expect(lyrics.createPrettyText()).toBe(
                '<p>Dear Chaisy Lain</p><p>I write you to explain</p>'
            )
        )

    )
