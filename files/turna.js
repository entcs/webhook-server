function Tournament(args) {    
    this.id = getfunctionname(arguments.callee) + guid()
    this.objtype = this.id.split('_')[0]
    this.rounds = []
    this.selectedround = null
    this.maxsize = 0
    this.size = 12
    this.type = ''
    this.mixed = args?.mixed ? true : true
    this.byrating = args?.byrating ? true : true
    this.doubles = args?.doubles ? true : true
    this.players = []
    let _this = this
    this.takeplayersfromroster = function (players) {
        this.players = []
        let placement = _this.size / 100

        loop(players, function (i, p) {
            if (!p.tournament && _this.size > _this.players.length) {
                p.tournament = _this
                p.placement = placement - _this.players.length*0.01
                _this.players.push(p)
            }
        })   
    }
    this.addplayer = function (player) {
        player = player || new Player()
        player.tournament = _this
        _this.players.push(player)
        _this.sortplayersbyscore()
        return player
    }
    this.removeplayer = function (id) {
        let p
        if (id.objtype == 'Player') {
            p = id
        } else {
            p = Util.getbyid(_this.players, id)
        }
        
        let i = _this.players.indexOf(p)
        _this.players.splice(i, 1)
        p.tournament = null
    }
    this.sortplayersbyscore = function () {
        _this.players.sort(function (a, b) {
            let rating1 = a.getscore(),
                rating2 = b.getscore()
            if (rating1 > rating2) {
                return -1
            } else if (rating2 > rating1) {
                return 1
            } else {
                return 0
            }
        })
    }
    this.sortplayersbyplacement = function () {
        this.players.sort(function (a, b) {
            let rating1 = a.placement,
                rating2 = b.placement
            if (rating1 > rating2) {
                return -1
            } else if (rating2 > rating1) {
                return 1
            } else {
                return 0
            }
        })
    }
    this.addround = function () {
        let t = _this,
            last = t.rounds.last
        if (last && last.scoresmissing()) {
            return null
        }

        let round = new Round(t.players)
        round.tournament = t
        t.rounds.push(round)
        round.makegames()
        round.nr = t.rounds.indexOf(round) + 1
        return round
    }
    this.removeround = function () {
        let round = this.rounds[this.rounds.length - 1]
        if (round && !round.hasscores()) {
            this.rounds.pop()
            return round
        }
        return false
    }
    this.getrandomplayer = function (list) {
        return list[Math.floor(Math.random() * list.length)]
    }
    this.getbestplayer = function (list, pop) {
        let best
        loop(list, function (i, p) {
            if (!best || p.getscore() > best.getscore()) {
                best = p
            }
        })
        if (pop) {
            list.splice(list.indexOf(best), 1)[0]
        }
        return best
    }
    this.getbestM = function (list, pop) {
        let best
        loop(list, function (i, p) {
            if (p.sex == 'M') {
                if (!best || p.getscore() > best.getscore()) {
                    best = p
                }
            }
        })
        if (pop) {
            list.splice(list.indexOf(best), 1)[0]
        }
        return best
    }
    this.getbestW = function (list, pop) {
        let best
        loop(list, function (i, p) {
            if (p.sex == 'W') {
                if (!best || p.getscore() > best.getscore()) {
                    best = p
                }
            }
        })
        if (pop) {
            return list.splice(list.indexOf(best), 1)[0]
        }
        return best
    }
    this.getworstplayer = function (list, pop) {
        let best
        loop(list, function (i, p) {
            if (!best || p.getscore() < best.getscore()) {
                best = p
            }
        })
        if (pop) {
            return list.splice(list.indexOf(best), 1)[0]
        }
        return best
    }
    this.getworstM = function (list, pop) {
        let best
        loop(list, function (i, p) {
            if (p.sex == 'M') {
                if (!best || p.getscore() < best.getscore()) {
                    best = p
                }
            }
        })
        if (pop) {
            return list.splice(list.indexOf(best), 1)[0]
        }
        return best
    }
    this.getworstW = function (list, pop) {
        let best
        loop(list, function (i, p) {
            if (p.sex == 'W') {
                if (!best || p.getscore() < best.getscore()) {
                    best = p
                }
            }
        })
        if (pop) {
            return list.splice(list.indexOf(best), 1)[0]
        }
        return best
    }
    this.calculatescores = function (selectedround) {
        let t = _this
        loop(t.players, function (i, p) {
            p.score = 0
        })

        loop(t.rounds, function (i, round) {
            loop(round.games, function (i2, game) {
                loop(game.teams, function (i3, team) {
                    loop(team.players, function (i4, player) {
                        player.score += team.score
                    })
                })
            })
            if (round == selectedround) {
                return false
            }
        })        
    }    
    this.updaterounds = function (afterthisround) {
        let index = this.rounds.indexOf(afterthisround)
        loop(this.rounds, function (i, round) {
            if (index < i) {
                round.makegames()
                $('#Rounds #' + round.id).replaceWith(TournaUI.drawround(round))
            }
        })
    }
    this.getrating = function (p) {
        let _this = this
        loop(g.tournament.rounds, function (i, r) {
            if (r.teams[0].score > r.teams[1].score) {

            }

            if (r == _this.selectedround) {
                return false
            }
        })
    }
    this.DB = {
        tournaments:[],
        rounds:[],
        games: [],
        gamelines: [],
        players:[]
    }
    this.savetournament = function () {
        let t = {
            id: _this.id,
            name: _this.name,
            startdate: new Date().toISO(),
            enddate: new Date().toISO()
        }
        this.DB.tournaments.push(t)
        loop(_this.rounds, function (i, r) {
            let ro = {
                id: r.id,
                tournamentid: _this.id
            }
            _this.saveround(ro)
            loop(r.games, function (i2, g) {
                let ga = {
                    id: g.id,
                    roundid: r.id,
                    date: new Date().toISO()
                }
                _this.savegame(ga)
                loop(g.teams, function (i3, t) {
                    loop(t.players, function (i4, p) {
                        let l = {
                            id: guid(),
                            playerid: p.id,
                            gameid: g.id,
                            teamnr: t.nr,
                            ratingchange: t.ratingchange
                        }
                        _this.savegameline(l)
                    })
                })
            })
        })
    }
    this.saveround = function (r) {
        this.DB.rounds.push(r)
    }
    this.savegame = function (g) {
        this.DB.games.push(g)
    }
    this.savegameline = function (l) {
        this.DB.gamelines.push(l)
    }

}
function Game() {
    this.id = getfunctionname(arguments.callee) + guid()
    this.objtype = this.id.split('_')[0]
    this.doubles = true
    this.teams = []
    this.players = []
    this.round = null
    this.updateratings = function () {
        let t1 = this.teams[0],
            t2 = this.teams[1],
            s1 = t1.score,
            s2 = t2.score,
            ratinggap = 400,
            ratmod = Math.min(1,Math.abs(t1.rating - t2.rating) / ratinggap),
            ratingchange = 10 - 10 * (ratmod * ratmod).round(1)
        if (s1 > s2) {
            this.teams[0].ratingchange = ratingchange
            this.teams[1].ratingchange = -ratingchange
        } else if (s1 < s2) {
            this.teams[1].ratingchange = ratingchange
            this.teams[0].ratingchange = -ratingchange
        } else {
            this.teams[1].ratingchange = 0
            this.teams[0].ratingchange = 0
        }
    }
    this.scoresmissing = function () {
        let scoresmissing = true
        loop(this.teams, function (i, t) {
            if (t.score) {
                scoresmissing = false
                return false
            }
        })
        return scoresmissing
    }
}
function Round(players) {
    this.id = getfunctionname(arguments.callee) + guid()
    this.objtype = this.id.split('_')[0]
    this.games = []
    this.players = players
    this.teams = []
    let _this = this
    this.hasscores = function () {
        let hasscore = false
        loop(_this.games, function (i, g) {
            if (!g.scoresmissing()) {
                hasscore = true
                return false
            }
            if (hasscore) {
                return false
            }
        })
        return hasscore
    }
    this.scoresmissing = function () {
        let scoresmissing = false
        loop(_this.games, function (i, g) {
            if (g.scoresmissing()) {
                scoresmissing = true
                return false
            }
            if (scoresmissing) {
                return false
            }
        })
        return scoresmissing
    }
    this.makegames = function () {
        let type = 'RDR'
        switch (type) {
            case 'MS':
                break
            case 'MD':
                break
            case 'X':
                break
            case 'WS':
                break
            case 'WD':
                break
            case 'MSR':
                break
            case 'MDR':
                break
            case 'XR':
                break
            case 'WSR':
                break
            case 'WDR':
                break
            case 'RS':
                break
            case 'RD':
                break
            case 'RSR':
                break
            case 'RDR'://klubikas random doubles
                this.makegamesklubikas()
                break

        }
    }
    this.makegamesklubikas = function () {
        _this.games = []
        let roundplayers = _this.players.slice()
        loop(roundplayers, function (i, p) {
            p.iscopy = true
        })
        let teams = [],
            team
        while (roundplayers.length) {
            let player1 = _this.tournament.getbestplayer(roundplayers, true),
                player2 = _this.tournament.getworstplayer(roundplayers, true)
            team = new Team()
            if (player1) {
                team.players.push(player1)
            }
            if (player2) {
                team.players.push(player2)
            }
            teams.push(team)
        }
        let game
        while (teams.length) {
            game = new Game()
            game.tournament = _this.tournament
            game.round = _this
            team = teams.shift()
            team.nr = 1
            team.game = game
            game.teams.push(team)

            if (teams.length) {
                team = teams.pop()
                team.nr = 2
                team.game = game
                game.teams.push(team)
            }

            _this.games.push(game)
        }
        loop(_this.games, function (i, g) {
            loop(g.teams, function (i2, t) {
                t.rating = t.getrating()
            })
        })
    }
}
function Player() {
    this.id = getfunctionname(arguments.callee) + guid()
    this.objtype = this.id.split('_')[0]
    this.name = ''
    this.rating = 0
    this.tournament = null
    this.ratingmodifier = 0
    this.score = 0
    this.placement = 0
    
    let _this = this
    this.findme = function (list) {
        let found = list.filter(function (item) {
            return item.id == _this.id
        })[0]
        return found
    }
    this.getratingchange = function (round) {        
        let ratingchange = 0,
            _this = this
        loop(_this.tournament.rounds, function (i, r) {
            if (round) {
                if (r == round) {
                    loop(r.games, function (i2, g) {
                        loop(g.teams, function (i3, t) {
                            if (_this.findme(t.players)) {
                                ratingchange = t.ratingchange
                                return false
                            }
                        })
                    })
                    return false
                }
            } else {
                loop(r.games, function (i2, g) {
                    loop(g.teams, function (i3, t) {
                        if (_this.findme(t.players)) {
                            ratingchange += t.ratingchange
                        }
                    })
                })
                if (r == _this.tournament.selectedround) {
                    return false
                }
            }
        })
        return ratingchange
    }
    this.getrating = function (round) {        
        let ratingchange = 0
        if (this.tournament) {
            round = round || this.tournament.selectedround
            loop(_this.tournament.rounds, function (i, r) {
                loop(r.games, function (i2, g) {
                    loop(g.teams, function (i3, t) {
                        if (_this.findme(t.players)) {
                            ratingchange += t.ratingchange
                            return false
                        }
                    })
                })
                if (r == round) {
                    return false
                }
            })
        }
        let rating = this.rating + ratingchange + this.ratingmodifier
        return rating
    }
    this.getscore = function () {
        let score = _this.score + _this.placement
        return score
    }
}
function Team() {
    let _this = this
    this.id = getfunctionname(arguments.callee) + guid()
    this.objtype = this.id.split('_')[0]
    this.score = null
    this.rating = 0
    this.players = []
    this.ratingchange = 0    
    this.getscore = function () {
        let sum = 0
        loop(_this.players, function (i, p) {
            sum += p.getscore()
        })
        _this.score = sum / _this.players.length
        return _this.score
    }
    this.setscore = function (score) {
        this.score = score
        this.game.round.tournament.calculatescores()
    }
    this.getrating = function () {
        let rating = 0
        loop(_this.players, function (i, p) {
            rating+=p.getrating()
        })
        rating /=_this.players.length
        return rating
    }
}
function Registration() {
    let _this = this
    this.id = getfunctionname(arguments.callee) + guid()
    this.objtype = this.id.split('_')[0]    
    this.players = []
    this.tournaments = []
    this.tournamentsize = 12
    this.badnames = ['', 'OOTELIST', 'Turniirile on juba registreerunud']
    this.nameexists = function (name) {
        return this.players.filter(function (p) {
            return p.name.toLowerCase() == name.toLowerCase()            
        }).length
    },
    this.addplayer = function (player) {
        if (this.nameexists(player.name)) return false

        if (!player.rating) {
            player.rating = this.playerratings[player.name] || 400
        }
        player.placement = player.rating/1000.0
        this.players.push(player)
    },
    this.sortplayersbyrating = function () {
        this.players.sort(function (a, b) {
            let rating1 = a.getrating(),
                rating2 = b.getrating()
            if (rating1 > rating2) {
                return -1
            } else if (rating2 > rating1) {
                return 1
            } else {
                return 0
            }
        })
    }
    this.sortplayersbyplacement = function () {
        this.players.sort(function (a, b) {
            let rating1 = a.placement,
                rating2 = b.placement
            if (rating1 > rating2) {
                return -1
            } else if (rating2 > rating1) {
                return 1
            } else {
                return 0
            }
        })
    }
    this.addtournament = function () {        
        let t = new Tournament()
        t.size = this.tournamentsize
        let ni = this.gettournamentnameandindex()
        t.name = ni.name
        t.index = ni.index
        t.takeplayersfromroster(this.players)
        t.parent = this
        this.tournaments.splice(ni.index, 0, t)
        return t
    }
    this.gettournamentnameandindex = function () {
        let names = ['16:00 1-3', '16:00 4-6', '18:00 1-3', '18:00 4-6'],
            res = {
                name: names[0],
                index: 0
            }
        loop(names, function (i, n) {
            if (!_this.havenamedtournament(n)) {
                res.name = n
                res.index = i
                return false
            }
        })
        return res
    }
    this.havenamedtournament = function (name) {
        let have = this.tournaments.filter(function (t) {
            return t.name == name
        }).length
        return have
    }
    this.removetournament = function (t) {
        let remove = true
        loop(t.rounds, function (i, r) {
            if (r.hasscores()) {
                remove = false
                return false
            }
        })
        if(!remove) return false
        loop(t.players, function (i, p) {
            p.tournament = null
        })
        this.tournaments.splice(this.tournaments.indexOf(t), 1)      
        return remove
    }
    this.updatetournamentplayers = function () {
        let _this = this
        loop(this.tournaments, function (i, t) {
            let players = _this.players.slice()
        })
    }
    this.getplayerratingmap = function () {
        let map = {}
        loop(this.players, function (i, p) {
            map[p.name] = p.rating
        })
        return map
    }
}
var Util = {
    getbyid: function (list, id) {
        let o = list.filter(function (p) {
            return p.id == id
        })[0]
        return o
    }
}