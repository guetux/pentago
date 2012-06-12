
game = {

    // Current game state, always present in us as class of #game div
    STATES : {
        0: 'p1_place',  // Player one place marble
        1: 'p1_rotate', // Player one rotate square
        2: 'p2_place',  // Player two place marble
        3: 'p2_rotate'  // Player two rotate square
    },

    // Square indexes
    SQUARE_ID : {
        0: '#square_0', // top left
        1: '#square_1', // top right
        2: '#square_2', // bottom left
        3: '#square_3'  // bottom right
    },

    // Constants for check functions
    HORIZONTAL : 0,
    VERTICAL : 1,
    DOWN : 0,
    UP : 1,

    // These two variable define the state of the current game
    state : 0,
    board : [[0,0,0,0,0,0],
             [0,0,0,0,0,0],
             [0,0,0,0,0,0],
             [0,0,0,0,0,0],
             [0,0,0,0,0,0],
             [0,0,0,0,0,0]],

    // count of wins for player
    p1_games_won : 0,
    p2_games_won : 0,

    state_is_placement : function () {
        return game.state % 2 === 0;
    },

    state_is_rotate : function () {
        return game.state % 2 === 1;
    },

    active_player : function () {
        return game.state < 2 ? 1 : 2;
    },

    reset_logic : function () {
        game.state = 0;
        game.board = [[0,0,0,0,0,0],
                      [0,0,0,0,0,0],
                      [0,0,0,0,0,0],
                      [0,0,0,0,0,0],
                      [0,0,0,0,0,0],
                      [0,0,0,0,0,0]];
    },

    reset_ui : function () {
        $('.pocket').removeClass('p1').removeClass('p2').addClass('empty');
    },

    progress_state : function () {
        game.print_board();

        var p1_wins = game.check_win(1);
        var p2_wins = game.check_win(2);

        if(p1_wins && p2_wins) {
            game.reset_logic();
            game.reset_ui();
        } else if (p1_wins) {
            game.reset_logic();
            game.reset_ui();
            game.p1_games_won += 1;
            $('#p1_games_won').text(game.p1_games_won);
        } else if (p2_wins) {
            game.reset_logic();
            game.reset_ui();
            game.p2_games_won += 1;
            $('#p2_games_won').text(game.p2_games_won);
        } else {
            var next_state = (game.state + 1) % 4;
            game.ui_state_update(next_state);
            game.state = next_state;
        }
    },

    ui_state_update : function (next_state) {
        $('#game').removeClass(game.STATES[game.state]);
        $('#game').addClass(game.STATES[next_state]);

        if (game.state_is_placement()) {
            $('.rotate').show();
        } else {
            $('.rotate').hide();
        }
    },

    check_win : function(player) {
        if (game.check_straight(game.HORIZONTAL, player)) return true;
        if (game.check_straight(game.VERTICAL, player)) return true;
        if (game.check_diagonal(1, 0, game.DOWN, player)) return true;
        if (game.check_diagonal(0, 0, game.DOWN, player)) return true;
        if (game.check_diagonal(0, 1, game.DOWN, player)) return true;
        if (game.check_diagonal(4, 0, game.UP, player))  return true;
        if (game.check_diagonal(5, 0, game.UP, player)) return true;
        if (game.check_diagonal(5, 1, game.UP, player)) return true;
        return false;
    },

    check_straight : function(axis, player) {
        var count = 0;
        for(var x = 0; x < 6; x++) {
            for(var y = 0; y < 6; y++) {
                if (axis === game.HORIZONTAL) {
                    var value = game.board[x][y];
                } else if (axis === game.VERTICAL) {
                    var value = game.board[y][x];
                } else {
                    var value = 0;
                }
                if (value === player) {
                    count += 1;
                } else {
                    count = 0;
                }
                if (count === 5) {
                    return true;
                }
            }
            count = 0;
        }
        return false;
    },

    check_diagonal : function(x, y, slope, player) {
        var count = 0;
        for(var i = 0; i < 6; i++) {
            if (game.board[x][y] === player) {
                count += 1;
            } else {
                count = 0;
            }

            if (count === 5) {
                return true;
            }

            if (slope === game.DOWN) {
                x += 1;
                y += 1;
            } else if (slope === game.UP) {
                x -= 1;
                y += 1;
            }

            if ( x < 0 || x > 5 || y < 0 || y > 5) {
                return false;
            }
        }
        return false;
    },

    pocket_click: function () {
        if (game.state_is_placement()) {
            var pocket = $(this);
            var x = pocket.data('x');
            var y = pocket.data('y');
            var player = game.active_player();

            game.board[x][y] = player;

            pocket.removeClass('empty');
            pocket.addClass('p' + player);

            game.progress_state();
        }
    },

    render_square_rotation : function (square, rotation) {
        square.css('-webkit-transform','rotate('+ rotation +'deg)');
        square.css('-moz-transform','rotate('+ rotation +'deg)');
        square.css('-o-transform','rotate('+ rotation +'deg)');
        square.css('-ms-transform','rotate('+ rotation +'deg)');
        square.css('transform','rotate('+ rotation +'deg)');
        square.find('.pocket').each(function (i, pocket) {
            var pocket = $(pocket);
            pocket.css('-webkit-transform','rotate('+ -rotation +'deg)');
            pocket.css('-moz-transform','rotate('+ -rotation +'deg)');
            pocket.css('-o-transform','rotate('+ -rotation +'deg)');
            pocket.css('-ms-transform','rotate('+ -rotation +'deg)');
            pocket.css('transform','rotate('+ -rotation +'deg)');
        });
    },

    get_board_copy : function () {
        var copy = new Array(6);
        for (var x=0; x < 6; x++) {
            copy[x] = game.board[x].slice();
        }
        return copy;
    },

    rotate_board_matrix : function (square_id, direction) {
        var sx = square_id < 2 ? 0 : 3; // start x
        var sy = square_id % 2 === 0 ? 0 : 3; // start y

        var board_copy = game.get_board_copy();

        for (var x = 0; x < 3; x++) {
            for (var y = 0; y < 3; y++) {
                if (direction === 'l') {
                    game.board[sx+x][sy+y] = board_copy[sx+y][sy+2-x];
                } else {
                    game.board[sx+x][sy+y] = board_copy[sx+2-y][sy+x];
                }
            }
        }
    },

    rotate_pocket_indexes : function (square_id, direction) {
        var sx = square_id < 2 ? 0 : 3; // start x
        var sy = square_id % 2 === 0 ? 0 : 3; // start y

        var pockets = $(game.SQUARE_ID[square_id] + ' > .pocket');
        pockets.each(function (i, pocket) {
            var pocket = $(pocket);

            var x = pocket.data('x') - sx;
            var y = pocket.data('y') - sy;

            if (direction === 'l') {
                pocket.data('x', sx+2-y);
                pocket.data('y', sy+x);
            } else {
                pocket.data('x', sx+y);
                pocket.data('y', sy+2-x);
            }
        });
    },

    rotate_square : function (square_id, direction) {
        var square = $(game.SQUARE_ID[square_id]);
        var rotation = direction === 'r' ? 90 : -90;
        var r = square.data('r') + rotation;
        square.data('r', r);

        game.rotate_board_matrix(square_id, direction);
        game.rotate_pocket_indexes(square_id, direction);

        game.render_square_rotation(square, r);
        game.progress_state();
    },

    rotate_click: function () {
        if (game.state_is_rotate()) {
            var square_id = $(this).data('i');
            var direction = $(this).data('d');
            game.rotate_square(square_id, direction);
        }
    },

    bind : function () {
        $('.pocket').click(game.pocket_click);
        $('.rotate').click(game.rotate_click);
    },

    // Testing stuff
    presets : {
        'horizontal':
            [[1,1,1,1,0,0],
             [0,0,0,0,0,0],
             [0,0,0,0,0,0],
             [0,0,0,0,0,0],
             [0,0,2,2,2,2],
             [0,0,0,0,0,0]],
        'vertical':
            [[1,0,0,0,0,0],
             [1,0,0,0,0,0],
             [1,0,0,0,2,0],
             [1,0,0,0,2,0],
             [0,0,0,0,2,0],
             [0,0,0,0,2,0]],
        'diagonal1':
            [[0,0,0,0,1,0],
             [0,0,0,1,0,0],
             [0,2,1,0,0,0],
             [0,1,2,0,0,0],
             [0,0,0,2,0,0],
             [0,0,0,0,2,0]],
         'diagonal2':
            [[0,0,0,0,0,0],
             [0,2,0,0,0,0],
             [0,0,2,1,0,0],
             [0,0,1,2,0,0],
             [0,1,0,0,2,0],
             [1,0,0,0,0,0]],
    },

    load_preset : function(preset_name) {
        if (game.presets.hasOwnProperty(preset_name)) {
            var preset = game.presets[preset_name]
            for(var x = 0; x < 6; x++) {
                for(var y = 0; y < 6; y++) {
                    game.board[x][y] = preset[x][y];
                    var pocket = $('.pocket[data-x="'+x+'"][data-y="'+y+'"]');
                    pocket.addClass('p'+preset[x][y]);
                }
            }
        }
    },

    print_board : function() {
        console.log('board:');
        for(var i=0; i < 6; i++) {
            console.log(game.board[i]);
        }
    }
}

$(function () {
    game.bind();

    //game.load_preset('horizontal');
    //game.load_preset('vertical');
    //game.load_preset('diagonal1');
    //game.load_preset('diagonal2');

    window.onbeforeunload = function () {
        if ($('#game').hasClass('dirty')) {
            //return 'The current game will be lost!';
        }
    }
});
