var Colors = [
    '#f4fff0',
    '#DBF1FD',
    '#fff0d3',
    '#f5deff',
    '#FEF6F1',
    '#9bd0b7'
]
var TournaUI = {
    dragging: null,
    init: function (html) {
        this.html = html
        this.addevents()
    },
    addevents: function () {
        let _this = this,
            html = this.html        
        html.find('.addtournament').on('click', function (e) {
            let t = Reg.addtournament(),
                thtml = _this.drawtournament(t),
                th = _this.html.parent().find('#Tournaments')                

            if (t.index === 0) {
                th.prepend(thtml)
            } else {
                $(th.find('.tournament')[t.index - 1]).after(thtml)
            }
            
            TournaUI.drawplayers(t)

            let html = _this.html.find('.playerslist')
            TournaUI.drawplayers(Reg, html)
        })
        html.find('.tournamentsize').on('keyup change', function (e) {
            let val = e.target.value
            Reg.tournamentsize = parseInt(val)
        })
        html.find('#PlayerName').on('focus', function (e) {
            e.target.value = ''
        })
        html.find('#AddPlayer').on('click', function (e) {
            let name = html.find('#PlayerName').val(),
                rating = html.find('#PlayerRating').val()
            _this.addplayer(name, rating)
            Reg.sortplayersbyplacement()
            _this.drawplayers(Reg, Reg.html.find('.players'))
            html.find('#PlayerName').val('')
            html.find('#PlayerRating').val('')

        })
        html.find('.sortbyrating').on('click', function (e) {
            Reg.sortplayersbyrating()
            _this.drawplayers(Reg, Reg.html.find('.players'))
        })
        html.find('.clearplayers').on('click', function (e) {
            let t = Reg.tournaments,
                cleared = true
            if (t && !Reg.removetournament(t)) {
                cleared = false
            }
            if (cleared) {
                Reg.players = []
                Reg.tournaments = []
                _this.drawplayers(Reg)
                $('#Tournaments').html('')
                let r = $('Registration .playerlist')
            //    r.removeAttr('data-sortable')
            //    r.removeAttr('data-droppable')
            }
        })
    },
    badnames: ['', 'OOTELIST', 'Turniirile on juba registreerunud'],
    addplayerlist: function (list, ratinglist) {
        let players = list.split('\n'),
            _this = this
        loop(players, function (i, name) {
            name = name.replace('\n', '').trim()
            if (!_this.badnames.includes(name)) {
                _this.addplayer(name, ratinglist)
            }
        })
        Reg.sortplayersbyplacement()
        let reg = this.html.find('#Registration')
        TournaUI.drawplayers(Reg, reg.find('.players'))
    },
    addplayer: function (name, rating) {
        if (typeof (name) == 'string' && name.includes('\n')) {
            this.addplayerlist(name, rating)
        } else if (name && !this.badnames.includes(name)) {
            let player = new Player()            
            player.name = name
            if (!isNaN(rating)) {
                player.rating = parseInt(rating)
            } else if (rating && rating[name]) {
                player.rating = rating[name]
            }
            Reg.addplayer(player)
        }
    },
    drawplayerline: function (player, t) {
        let line = $('<div class="player item1 flex-space" />'),
            name = $('<span class=name />'),
            playerinfo = $('<div class="playerinfo flex" />'),
            sex = $('<div class="sexwrap flex">M/W</div>'),
            tobottom = $('<button type=button class=tobottom>⇳</button>'),
            score = $('<div class="score font1" />'),
            rating = $('<div class=rating />'),
            ratinginput = $('<input class=ratinginput />'),
            ratingchange = $('<div class=ratingchange />'),
            element = t.html.find('.playerslist')
        
        line.attr('id', player.id)
        line.append(name)
        line.append(playerinfo)
        
        let ratingvalue = player.getrating()
        if (t && t.objtype == 'Tournament') {
            playerinfo.append(score)
            let scorevalue = player.getscore()
            playerinfo.find('.score').text(scorevalue.round())
            let ratingchangevalue = player.getratingchange()
            ratingchange.removeClass('inc')
            ratingchange.removeClass('dec')    
            ratingchange.text(ratingchangevalue)
            if (ratingchangevalue > 0) {
                ratingchange.text('+' + ratingchangevalue)
                ratingchange.addClass('inc')
            } else if (ratingchangevalue < 0) {
                ratingchange.addClass('dec')
            }            
            playerinfo.append(rating)
            playerinfo.append(ratingchange)

            line.addClass('hasturna')
        } else {
            let title = [
                'M0    : 2400+',
                'M1 N0 : 2000+',
                'M2 N1 : 1600+',
                'M3 N2 : 1200+',
                'M4 N3 : 800+',
                'M5 N4 : 400+'
            ].join('\n')
            ratinginput.attr('title',title)
            playerinfo.append(ratinginput)
            ratinginput.val(ratingvalue)
            if (!player.tournament) {                
                playerinfo.append(tobottom)
            }            
        }        

        let index = Math.floor(t.players.indexOf(player)/12)
        if (player.tournament) {
            let r = player.tournament.parent
            index = r.tournaments.indexOf(player.tournament)
        } else {

        }
        line.css({
            'background-color': Colors[index]
        })


        
        //playerinfo.append(sex)        
        name.text(player.name)                
        if (ratingvalue < 0) {
            rating.text('-')
            ratinginput.hide()
        } else {
            ratinginput.show()
            rating.show()
            rating.text(ratingvalue)
        }       

        element.append(line)
        tobottom.on('click', function (e) {
            if (player.ratingmodifier) {
                player.ratingmodifier = 0            
            } else {
                player.ratingmodifier = -10000            
            }
            
            t.sortplayersbyrating()
            TournaUI.drawplayers(t)
            
        })
        ratinginput.on('change', function (e) {
            player.rating = parseInt(ratinginput.val())
            t.sortplayersbyrating()
            TournaUI.drawplayers(t)
        })
    },
    removeplayer: function (player) {
        let index = this.tournament.players.indexOf(player)
        this.tournament.players.splice(index,1)
        this.drawplayers(this.tournament)
    },
    drawplayers: function (playerparentobj) {
        let _this = this,
            element = playerparentobj.html.find('.playerslist'),
            players = playerparentobj.players,
            t = playerparentobj

        if (element.length > 1) {
            element = $(element[0])
        }
        if (playerparentobj.objtype != 'Registration') {
            playerparentobj.sortplayersbyscore()
        }

        element.html('')
        element.attr('id', playerparentobj.id)
        loop(players, function (i, player) {
            TournaUI.drawplayerline(player, playerparentobj)
        })
        if (!element.attr('data-sortable')) {
            element.attr('data-sortable', true)
            element.sortable({
                start: function (e, o) {
                    let player = Util.getbyid(playerparentobj.players, o.item.attr('id'))
                    TournaUI.dragging = {
                        t: playerparentobj,
                        p: player,
                        e: element
                    }
                },
                update: function (e, o) {
                    let playershtml = element.find('.player'),
                        placement = playerparentobj.players.length / 100
                    loop(playershtml, function (i, p) {
                        p= $(p)
                        let player = playerparentobj.players.getbyid(p.attr('id'))
                        if (player) {
                            player.placement = placement - i * 0.01
                        }
                    })
                    if (t.objtype == 'Registration') {
                        playerparentobj.sortplayersbyplacement()
                        _this.drawplayers(t)
                    } else {
                        if (t.selectedround && t.selectedround == t.rounds.last) {
                            if (!t.selectedround.hasscores()) {
                                //re do the games
                                t.selectedround.makegames()                                
                                t.html.find('.content').html(_this.drawround(t.selectedround))
                            }
                        }
                    }
                }
            })
        }
        if (!element.attr('data-droppable')) {
            element.attr('data-droppable', true)
            element.droppable({
                drop: function (e, o) {                    
                    let from = TournaUI.dragging.t,
                        to = t,
                        action = from.objtype + '2' + to.objtype

                    if (TournaUI.dragging.t.objtype == 'Registration' && TournaUI.dragging.p.tournament) {
                        return false
                    }
                    //dropped to     
                    switch (action) {
                        case 'Registration2Tournament':
                            to.addplayer(TournaUI.dragging.p)
                            break
                        case 'Tournament2Tournament':
                            from.removeplayer(TournaUI.dragging.p.id)
                            to.addplayer(TournaUI.dragging.p)
                            break
                        case 'Tournament2Registration':
                            from.removeplayer(TournaUI.dragging.p.id)
                            break
                        case 'Registration2Registration':
                            return false
                            break
                    }
                    
                    setTimeout(function () {
                        _this.drawplayers(playerparentobj)
                        _this.drawplayers(TournaUI.dragging.t)
                        _this.drawplayers(Reg)
                    }, 0)
                }
            })
        }

    },
    updateplayers: function (playerparentobj) {
        let players = playerparentobj.players,
            _this = this

        if (playerparentobj.sortplayersbyrating) {
            playerparentobj.sortplayersbyrating()            
        }
        if (playerparentobj.tournaments) { 
            loop(playerparentobj.tournaments, function (i, t) {
                t.takeplayersfromroster(players)
                _this.drawplayers(t)
            })
        }
        _this.drawplayers(playerparentobj)
    },
    drawtournament: function (t) {
        let html = $('<div class=tournament />'),
            header = $('<div class="header font1 text-center item1 flex flex-space"/>'),
            controls = $('<div class="controls flex" />'),
            content = $('<div class="content" />'),
            players = $('<div class=playerslist />'),
            name = $('<div class=name />'),            
            removetournament = $('<button class="removetournament float-right">X</button>'),
            removeround = $('<button class="removeround float-right" >X</button>'),
            _this = this,
            rounds = $('<div class="rounds flex flex-space"/>'),
            addround = $('<button class=addround>+R</button>')
        
        controls.append(rounds)
        controls.append(addround)
        controls.append(removeround)
        
        
        name.text(t.name)
        header.append(name)        
        header.append(removetournament)
        html.append(header)
        html.append(controls)
        html.append(content)
        html.append(players)
        html.attr('id', t.id)

        removetournament.on('click', function (e) {            
            if (Reg.removetournament(t)) {
                html.remove()
                _this.drawplayers(Reg)
            }
        })
        addround.on('click', function (e) {
            let round = t.addround()
            if (round) {
                _this.updaterounds(t, round)
            }
        })
        removeround.on('click', function (e) {
            if (t.removeround()) {
                let round = t.rounds.last
                _this.updaterounds(t, round)
            }
        })
        t.html = html
        return html
    },
    updaterounds: function (t, round) {
        let r = '',
            content = t.html.find('.content')
        if (round) {            
            round.tournament.selectedround = round
            r = this.drawround(round)                        
        }
        content.html(r)
        t.calculatescores(round)
        TournaUI.drawplayers(t)
        this.drawroundbuttons(t)
    },
    drawround: function (round) {
        let r = $('<div class="round" />'),
            t = this,
            header = $('<div class="header font1 text-center item1" />')            

        let islast = round.tournament.rounds.last == round

        header.text('R' + round.nr)        
        r.append(header)
        r.attr('id', round.id)
        loop(round.games, function (i, game) {
            game.nr = i + 1
            r.append(t.drawgame(game))
        })
        if (!islast) {
            r.addClass('notlast')
        }
        return r
    },
    drawroundbuttons: function (t) {
        let rounds = t.html.find('.rounds'),
            content = t.html.find('.content'),
            _this = this
        rounds.html('')
        loop(t.rounds, function (i, r) {
            let rb = $('<button class=round >R' + (i + 1) + '</button>')
            rb.attr('id', r.id)
            rounds.append(rb)
            if (t.selectedround == r) {
                rb.addClass('selected')
            }
            rb.on('click', function (e) {
                rounds.find('.round').removeClass('selected')
                rb.addClass('selected')
                t.selectedround = r
                content.html(_this.drawround(r))
                t.calculatescores(r)
                TournaUI.drawplayers(t)
            })
        })
    },
    drawgame: function (g) {
        let game = $('<div class="game flex item1 overflow-hidden" />'),
            gametag = $('<div class="gamename pad1 font1" />'),
            _this = this

        gametag.text(g.nr)
        game.append(gametag)

        loop(g.teams, function (i, t) {
            team = _this.drawteam(t)
            game.append(team)
        })

        return game
    },
    drawteam: function (team) {        
        let t = $('<div class="flex" />'),
            score = $('<input class="score font1" />'),
            _this = this

        if(!team) return t
        let tournament = team.game.round.tournament,
            players = $('<div class="players"></div>')

        loop(team.players, function (i, p) {
            let player = _this.drawplayer(p.name)
            players.append(player)
        })

        if (team.score) {
            score.val(team.score)
        }        
        if (team.nr == 1) {
            t.addClass('team1 flex flex-space')
            players.addClass('text-right')
            t.append(players)
            t.append(score)
            score.attr('placeholder', 'V')            
        } else {
            t.addClass('team2 flex flex-space')
            t.append(score)
            t.append(players)
            score.attr('placeholder', 'S')
        }

        t.attr('title', team.rating)

        score.on('keyup', function (e) {            
            let val = parseInt(e.target.value || 0)
            team.setscore(val)
            team.game.updateratings()
            TournaUI.drawplayers(tournament)            
        })
        
        return t
    },
    drawplayer: function (name) {
        let player = $('<div class="player pad1" />')
        player.text(name)
        return player
    }
}