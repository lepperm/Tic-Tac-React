import React from "react";
import ReactDOM from "react-dom";
import Confetti from "react-dom-confetti";
import UIfx from "uifx";

import victoryAudio from "./sounds/party-horn.wav";
import drawAudio from "./sounds/sad-trombone.wav";
import "./index.css";

const victorySound = new UIfx(victoryAudio, {
  volume: 0.4,
  throttleMs: 100,
});

const drawSound = new UIfx(drawAudio, {
  volume: 0.4,
  throttleMs: 100,
});

// Configuration settings for react-dom-confetti
const config = {
  angle: "60",
  spread: 45,
  startVelocity: "30",
  elementCount: 50,
  dragFriction: 0.1,
  duration: 3000,
  stagger: 0,
  width: "10px",
  height: "10px",
  colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"],
};

// Square is now a simplified function component
function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
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

  buildColumns(i, dims) {
    let columns = [];
    for (let j = 0; j < dims; j++) {
      columns.push(this.renderSquare(i * dims + j));
    }
    return columns;
  }

  buildRows(i, dims) {
    return <div className="board-row">{this.buildColumns(i, dims)}</div>;
  }

  buildBoard(dims) {
    let board = [];
    for (let i = 0; i < dims; i++) {
      board.push(this.buildRows(i, dims));
    }
    return board;
  }

  render() {
    // EC3 - buildBoard now uses two loops to build out our board from "dims" from the Game level
    const dims = this.props.dims;
    return <div>{this.buildBoard(dims)}</div>;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      boardDims: 3,
      history: [
        {
          squares: Array(9).fill(null),
          location: null, // EC1 - 'location' represents the active square
        },
      ],
      stepNumber: 0,
      xIsNext: true,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice(); // Take a copy of Board's squares array
    if (calculateWinner(squares) || squares[i]) {
      // Return early if the game has been won
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O"; // Manipulate the value of the square reporting the click
    this.setState({
      history: history.concat([
        {
          squares: squares,
          location: i, // EC1 - Add record of the active square
        },
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    }); // We directly force the new value to the board's squares array
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      // EC1 - With a 3x3 grid, we can use some math to quickly determine the row and column, given 0-8 left-to-right top-to-bottom population
      const row = Math.floor(step.location / 3 + 1);
      const column = (step.location % 3) + 1;
      const coords = "(" + row + ", " + column + ")";

      const desc = move ? "Move #" + move + ", " + coords : "Go to game start";
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>
            {move === this.state.stepNumber ? <b>{desc}</b> : desc}
          </button>
        </li>
      ); // EC2 - If the current step number and move match, render the description in bold
    });

    let status;
    if (winner) {
      status = "Winner: " + winner;
      victorySound.play();
    } else if (!current.squares.includes(null)) {
      status = "Draw: Please try again!"; // EC6 - Surprisingly easy?? If there are no empty spaces and also no winner, the game is a draw.
      drawSound.play();
    } else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            dims={this.state.boardDims}
          />
          <Confetti active={winner} config={config} />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));
