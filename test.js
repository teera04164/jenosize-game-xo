function Square(props) {
    return (
        <button class="square" onClick={props.onClick}>
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i) {
        return (
            <Square
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
            />
        );
    }

    render() {
        return (
            <div>
                <div className="board-row">
                    {this.renderSquare(0)}
                    {this.renderSquare(1)}
                    {this.renderSquare(2)}
                </div>
                <div className="board-row">
                    {this.renderSquare(3)}
                    {this.renderSquare(4)}
                    {this.renderSquare(5)}
                </div>
                <div className="board-row">
                    {this.renderSquare(6)}
                    {this.renderSquare(7)}
                    {this.renderSquare(8)}
                </div>
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [
                {
                    squares: Array(9).fill(null)
                }
            ],
            stepNumber: 0,
            xIsNext: true
        };
    }

    makeMove(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (calculateWinner(squares) || squares[i]) {
            return Promise.resolve();
        }
        squares[i] = this.state.xIsNext ? "X" : "O";
        const nextState = {
            history: history.concat([
                {
                    squares: squares
                }
            ]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext
        };

        // Return a Promise that resolves when setState completes.
        return new Promise((resolve, reject) => {
            this.setState(nextState, resolve);
        });
    }

    async handleClick(i) {
        // Apply player move to square i
        await this.makeMove(i);

        // Apply AI move
        const squares = this.state.history[this.state.stepNumber].squares.slice();
        const bestSquare = findBestSquare(squares, this.state.xIsNext ? "X" : "O");
        if (bestSquare !== -1) {
            await this.makeMove(bestSquare);
        }
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0
        });
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares);

        const moves = history.map((step, move) => {
            const desc = move ?
                'Go to move #' + move :
                'Go to game start';
            return (
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)}>{desc}</button>
                </li>
            );
        });

        let status;
        if (winner) {
            status = "Winner: " + winner;
        }
        else if (isBoardFilled(current.squares)) {
            status = "It's a Tie!";
        } else {
            status = "Next player: " + (this.state.xIsNext ? "X" : "O");
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={i => this.handleClick(i)}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a];
        }
    }
    return null;
}

function isBoardFilled(squares) {
    for (let i = 0; i < squares.length; i++) {
        if (squares[i] === null) {
            return false;
        }
    }
    return true;
}

function findBestSquare(squares, player) {
    // 'player' is the maximizing player
    // 'opponent' is the minimizing player
    const opponent = player === 'X' ? 'O' : 'X';

    const minimax = (squares, isMax) => {
        const winner = calculateWinner(squares);

        // If player wins, score is +1
        if (winner === player) return { square: -1, score: 1 };

        // If opponent wins, score is -1
        if (winner === opponent) return { square: -1, score: -1 };

        // If Tie, score is 0
        if (isBoardFilled(squares)) return { square: -1, score: 0 };

        // Initialize 'best'. If isMax, we want to maximize score, and minimize otherwise.
        const best = { square: -1, score: isMax ? -1000 : 1000 };

        // Loop through every square on the board
        for (let i = 0; i < squares.length; i++) {
            // If square is already filled, it's not a valid move so skip it
            if (squares[i]) {
                continue;
            }

            // If square is unfilled, then it's a valid move. Play the square.
            squares[i] = isMax ? player : opponent;
            // Simulate the game until the end game and get the score,
            // by recursively calling minimax.
            const score = minimax(squares, !isMax).score;
            // Undo the move
            squares[i] = null;

            if (isMax) {
                // Maximizing player; track the largest score and move.
                if (score > best.score) {
                    best.score = score;
                    best.square = i;
                }
            } else {
                // Minimizing opponent; track the smallest score and move.
                if (score < best.score) {
                    best.score = score;
                    best.square = i;
                }
            }
        }

        // The move that leads to the best score at end game.
        return best;
    };

    // The best move for the 'player' given current board
    return minimax(squares, true).square;
}