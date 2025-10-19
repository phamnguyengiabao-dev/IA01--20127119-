import { useState } from 'react';

function Square({ value, onSquareClick, isWinning }) {
  const className = isWinning ? "square winning-square" : "square";
  return (
    <button className={className} onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay }) {
  function handleClick(i) {
    const winnerResult = calculateWinner(squares);
    if (winnerResult.winner || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = 'X';
    } else {
      nextSquares[i] = 'O';
    }
    // Calculate row and col from square index
    const row = Math.floor(i / 3);
    const col = i % 3;
    onPlay(nextSquares, { row, col });
  }

  const winnerResult = calculateWinner(squares);
  let status;
  if (winnerResult.winner) {
    status = 'Winner: ' + winnerResult.winner;
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }
  // task2
  const renderBoard = () => {
    const rows = [];
    const winningSquares = winnerResult.line || [];

    for (let row = 0; row < 3; row++) {
      const rowSquares = [];
      for (let col = 0; col < 3; col++) {
        const index = row * 3 + col;
        const isWinning = winningSquares.includes(index);
        rowSquares.push(
          <Square
            key={index}
            value={squares[index]}
            onSquareClick={() => handleClick(index)}
            isWinning={isWinning}
          />
        );
      }
      rows.push(
        <div key={row} className="board-row">
          {rowSquares}
        </div>
      );
    }
    return rows;
  };

  return (
    <>
      <div className="status">{status}</div>
      {// task2
        renderBoard()
      }
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [moveLocations, setMoveLocations] = useState([null]); // Track move locations, starting with null for initial state
  const [currentMove, setCurrentMove] = useState(0);
  const [isAscending, setIsAscending] = useState(true);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares, location) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    const nextMoveLocations = [...moveLocations.slice(0, currentMove + 1), location];
    setHistory(nextHistory);
    setMoveLocations(nextMoveLocations);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  function toggleSortOrder() {
    setIsAscending(!isAscending);
  }

  const moves = history.map((squares, move) => {
    let description;
    if (move > 0) {
      const location = moveLocations[move];
      if (location) {
        description = `Go to move #${move} (${location.row}, ${location.col})`;
      } else {
        description = 'Go to move #' + move;
      }
    } else {
      description = 'Go to game start';
    }

    // Show current move as text instead of button
    if (move === currentMove) {
      let currentDescription;
      if (move > 0) {
        const location = moveLocations[move];
        if (location) {
          currentDescription = `You are at move #${move} (${location.row}, ${location.col})`;
        } else {
          currentDescription = `You are at move #${move}`;
        }
      } else {
        currentDescription = 'You are at game start';
      }
      return (
        <li key={move}>
          <span>{currentDescription}</span>
        </li>
      );
    }

    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  // Sort moves based on isAscending state
  const sortedMoves = isAscending ? moves : [...moves].reverse();

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <button onClick={toggleSortOrder}>
          Sort {isAscending ? 'Descending' : 'Ascending'}
        </button>
        <ol>{sortedMoves}</ol>
      </div>
    </div>
  );
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
      return {
        winner: squares[a],
        line: lines[i]
      };
    }
  }
  return {
    winner: null,
    line: null
  };
}
