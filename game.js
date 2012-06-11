
game = {

    STATES : {
        0: 'p1_place',  // Player one place marble
        1: 'p1_rotate', // Player one rotate square
        2: 'p2_place',  // Player two place marble
        3: 'p2_rotate'  // Player two rotate square
    },

    state : 0,
    active_player : 1,

    SQUARE_ID : {
        0: '#square_0', // top left
        1: '#square_1', // top right
        2: '#square_2', // bottom left
        3: '#square_3'  // bottom right
    },

    board : [[0,0,0,0,0,0],
             [0,0,0,0,0,0],
             [0,0,0,0,0,0],
             [0,0,0,0,0,0],
             [0,0,0,0,0,0],
             [0,0,0,0,0,0]],

    state_is_placement : function () {
        return game.state % 2 === 0;
    },

    state_is_rotate : function () {
        return game.state % 2 === 1;
    },

    progress_state : function () {
        game.print_board();

       $('#game').addClass('dirty');

        var next_state = (game.state + 1) % 4;
        $('#game').removeClass(game.STATES[game.state]);
        $('#game').addClass(game.STATES[next_state]);

        if (next_state < 2) {
            game.active_player = 1;
        } else {
            game.active_player = 2;
        }

        if (game.state_is_placement()) {
            $('.rotate').show();
        } else {
            $('.rotate').hide();
        }

        game.state = next_state;
    },

    print_board : function() {
        console.log('board:');
        for(var i=0; i < 6; i++) {
            console.log(game.board[i]);
        }
    },

    render_rotation : function (square, rotation) {
        square.css('-webkit-transform','rotate('+rotation+'deg)');
        square.css('-moz-transform','rotate('+rotation+'deg)');
        square.css('-o-transform','rotate('+rotation+'deg)');
        square.css('-ms-transform','rotate('+rotation+'deg)');
        square.css('transform','rotate('+rotation+'deg)');
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

        game.render_rotation(square, r);
        game.progress_state();
    },

    place_marble : function (x, y, player) {
        console.log('set', x, y, player)
        game.board[x][y] = player;
        game.progress_state();
    },

    pocket_click: function () {
        if (game.state_is_placement) {
            var pocket = $(this);
            var x = pocket.data('x');
            var y = pocket.data('y');

            game.place_marble(x, y,  game.active_player);
            pocket.removeClass('empty');
            pocket.addClass('p' + game.active_player);
        }
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
    }

}

$(function () {
    game.bind();

    window.onbeforeunload = function () {
        if ($('#game').hasClass('dirty')) {
            //return 'The current game will be lost!';
        }
    }
});
