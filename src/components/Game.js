import React, { useState, useEffect } from 'react'
import api from '../API';
import Block from './Block'
import dayjs from 'dayjs'

const relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)

function Game() {
    const [blocks, setBlocks] = useState([]);
    const [message, setMessage] = useState('')
    const [gameId, setGameId] = useState('')
    const [lastUpdate, seLastUpdate] = useState(null)

    useEffect(() => {
        initial()
    }, [])

    const initial = async () => {
        const localGameId = localStorage.getItem('gameId');
        if (localGameId) {
            const response = await api.getGameById(localGameId)
            if (response) {
                setStateFromResponse(response)
            }
        } else {
            const response = await api.initial()
            if (response) {
                const { game_id } = response
                localStorage.setItem('gameId', game_id);
                setStateFromResponse(response)
            }
        }
    }

    const setStateFromResponse = (response) => {
        const { board, game_id, message, updateAt } = response
        setBlocks(board)
        setMessage(message)
        setGameId(game_id)
        seLastUpdate(updateAt)
    }

    const handleClickBlock = async (position) => {
        const newBlock = [...blocks]
        newBlock[position] = 'X'
        setBlocks(newBlock)
        const resultClick = await api.markPosition(gameId, { position })
        if (resultClick) {
            setStateFromResponse(resultClick)
        }
    }

    const resetGame = async () => {
        const reponse = await api.resetGame(gameId)
        if (reponse) {
            setStateFromResponse(reponse)
        }
    }

    const renderBlock = (i) => {
        return (
            <Block
                index={i}
                value={blocks[i]}
                handleClick={(e) => handleClickBlock(i)}
            />
        )
    }

    return (
        <div className="board">

            <h2>{message}</h2>
            <div className="row">
                {renderBlock(0)}
                {renderBlock(1)}
                {renderBlock(2)}
            </div>
            <div className="row">
                {renderBlock(3)}
                {renderBlock(4)}
                {renderBlock(5)}
            </div>
            <div className="row">
                {renderBlock(6)}
                {renderBlock(7)}
                {renderBlock(8)}
            </div>
            <button className="restart" onClick={resetGame}>Restart Game</button>
            <div>
                <h6 style={{ textTransform: 'initial', color: '#666666' }}>last play:  {lastUpdate && dayjs(new Date(lastUpdate)).fromNow()}</h6>
                <h6 style={{ textTransform: 'initial', color: '#666666' }}>game id:  {gameId}</h6>
            </div>
        </div>
    )
}

export default Game;