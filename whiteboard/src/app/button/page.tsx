"use client";
import { IconCircleDashedPlus, IconUsers, IconX, IconCopy } from '@tabler/icons-react'
import clsx from 'clsx'
import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const Page = () => {
    const { data: session } = useSession()
    const router = useRouter()
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showJoinModal, setShowJoinModal] = useState(false)
    const [showAuthModal, setShowAuthModal] = useState(false)
    const [roomCode, setRoomCode] = useState('')
    const [joinCode, setJoinCode] = useState('')
    const [copied, setCopied] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Reset all state when closing modals
    const resetState = () => {
        setShowCreateModal(false)
        setShowJoinModal(false)
        setShowAuthModal(false)
        setRoomCode('')
        setJoinCode('')
        setCopied(false)
        setError('')
        setLoading(false)
    }

    // Check authentication before showing modals
    const handleCreateRoom = async () => {
        // Reset state first
        resetState()
        
        if (!session) {
            setShowAuthModal(true)
            return
        }
        
        setLoading(true)
        try {
            const code = Math.random().toString(36).substr(2, 6).toUpperCase()
            
            // Create room in database
            const response = await fetch('/api/rooms/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomCode: code,
                }),
            })
            
            const data = await response.json()
            
            if (response.ok) {
                setRoomCode(code)
                setShowCreateModal(true)
            } else {
                setError(data.error || 'Failed to create room')
            }
        } catch (error) {
            setError('Failed to create room')
        } finally {
            setLoading(false)
        }
    }

    const handleJoinRoomClick = () => {
        // Reset state first
        resetState()
        
        if (!session) {
            setShowAuthModal(true)
            return
        }
        setShowJoinModal(true)
    }

    // Copy code to clipboard
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(roomCode)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    // Handle join room with database validation
    const handleJoinRoom = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (joinCode.length !== 6) return
        
        setLoading(true)
        setError('')
        
        try {
            const response = await fetch('/api/rooms/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomCode: joinCode,
                }),
            })
            
            const data = await response.json()
            
            if (response.ok) {
                // Navigate to whiteboard with room code
                router.push(`/whiteboard?room=${joinCode}`)
            } else {
                setError(data.error || 'Room not found')
            }
        } catch (error) {
            setError('Failed to join room')
        } finally {
            setLoading(false)
        }
    }

    const handleStartRoom = () => {
        router.push(`/whiteboard?room=${roomCode}`)
    }

    return (
        <>
            <div className="mt-8 flex gap-4 absolute top-[10px] left-[10px] flex-col">
                <button
                    onClick={handleCreateRoom}
                    disabled={loading}
                    className={clsx(
                        "font-medium text-lg flex items-center gap-2 select-none cursor-pointer transition-transform duration-200 bg-blue-500 text-white px-6 py-2 rounded-lg border-blue-600 border-b-[4px]",
                        "hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px]",
                        "active:border-b-[2px] active:brightness-90 active:translate-y-[2px]",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                >
                    {loading ? 'Creating...' : 'Create a room'} <IconCircleDashedPlus />
                </button>
                
                <button
                    onClick={handleJoinRoomClick}
                    className={clsx(
                        "cursor-pointer transition-transform duration-200 bg-white text-[var(--secondary-text)] px-6 py-2 rounded-lg",
                        "border-blue-600 border-b-[4px]",
                        "hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px]",
                        "active:border-b-[2px] active:brightness-90 active:translate-y-[2px]",
                        "font-medium text-lg flex items-center gap-2 select-none"
                    )}
                >
                    Join a room <IconUsers />
                </button>
            </div>

            {/* Authentication Modal */}
            {showAuthModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 relative border-4 border-[var(--accent)]">
                        <button
                            onClick={resetState}
                            className="absolute top-4 right-4 text-[var(--secondary-text)] hover:text-[var(--primary-text)]"
                        >
                            <IconX size={20} />
                        </button>
                        
                        <div className="text-center">
                            <div className="mx-auto h-16 w-16 bg-[var(--accent)] rounded-full flex items-center justify-center mb-6">
                                <IconUsers className="text-2xl text-[var(--primary-text)]" />
                            </div>
                            <h2 className="text-2xl font-bold text-[var(--primary-text)] mb-4">
                                Sign In Required
                            </h2>
                            <p className="text-[var(--secondary-text)] mb-6">
                                You need to be logged in to create or join a room.
                            </p>
                            
                            <div className="flex gap-3">
                                <button
                                    onClick={resetState}
                                    className="flex-1 px-6 py-3 border-3 border-[var(--accent)] text-[var(--primary-text)] rounded-2xl hover:bg-[var(--surface)] transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => router.push('/auth/login')}
                                    className="flex-1 px-6 py-3 bg-[var(--accent)] text-[var(--primary-text)] rounded-2xl hover:bg-[var(--accent-dark)] transition-colors font-medium"
                                >
                                    Sign In
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Room Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 relative border-4 border-[var(--accent)]">
                        <button
                            onClick={resetState}
                            className="absolute top-4 right-4 text-[var(--secondary-text)] hover:text-[var(--primary-text)]"
                        >
                            <IconX size={20} />
                        </button>
                        
                        <div className="text-center">
                            <div className="mb-6">
                                <div className="mx-auto h-16 w-16 bg-[var(--accent)] rounded-full flex items-center justify-center mb-4">
                                    <IconCircleDashedPlus className="text-2xl text-[var(--primary-text)]" />
                                </div>
                                <h2 className="text-2xl font-bold text-[var(--primary-text)] mb-2">Room Created!</h2>
                                <p className="text-[var(--secondary-text)]">Share this code with others to join your room</p>
                            </div>
                            
                            <div className="bg-[var(--surface)] rounded-2xl p-6 mb-6 border-2 border-[var(--accent)]">
                                <div className="text-3xl font-mono font-bold text-[var(--primary-text)] mb-3 tracking-wider">
                                    {roomCode}
                                </div>
                                <button
                                    onClick={copyToClipboard}
                                    className="flex items-center gap-2 mx-auto px-4 py-2 bg-[var(--accent)] text-[var(--primary-text)] rounded-2xl hover:bg-[var(--accent-dark)] transition-colors font-medium"
                                >
                                    <IconCopy size={16} />
                                    {copied ? 'Copied!' : 'Copy Code'}
                                </button>
                            </div>
                            
                            <button
                                onClick={handleStartRoom}
                                className="w-full px-6 py-3 bg-[var(--accent)] text-[var(--primary-text)] rounded-2xl hover:bg-[var(--accent-dark)] transition-colors font-medium border-3 border-[var(--accent)]"
                            >
                                Enter Room
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Join Room Modal */}
            {showJoinModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 relative border-4 border-[var(--accent)]">
                        <button
                            onClick={resetState}
                            className="absolute top-4 right-4 text-[var(--secondary-text)] hover:text-[var(--primary-text)]"
                        >
                            <IconX size={20} />
                        </button>
                        
                        <div className="text-center">
                            <div className="mb-6">
                                <div className="mx-auto h-16 w-16 bg-[var(--accent)] rounded-full flex items-center justify-center mb-4">
                                    <IconUsers className="text-2xl text-[var(--primary-text)]" />
                                </div>
                                <h2 className="text-2xl font-bold text-[var(--primary-text)] mb-2">Join a Room</h2>
                                <p className="text-[var(--secondary-text)]">Enter the 6-digit room code to join</p>
                            </div>
                            
                            <form onSubmit={handleJoinRoom} className="space-y-6">
                                <div>
                                    <input
                                        type="text"
                                        value={joinCode}
                                        onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                                        placeholder="Enter room code"
                                        className="w-full px-4 py-3 text-center text-2xl font-mono font-bold tracking-wider border-3 border-[var(--accent)] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[var(--accent)] bg-white text-[var(--primary-text)]"
                                        maxLength={6}
                                        autoFocus
                                    />
                                    {error && (
                                        <p className="mt-2 text-sm text-red-500 bg-red-50 p-2 rounded-xl">
                                            {error}
                                        </p>
                                    )}
                                </div>
                                
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={resetState}
                                        className="flex-1 px-6 py-3 border-3 border-[var(--accent)] text-[var(--primary-text)] rounded-2xl hover:bg-[var(--surface)] transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={joinCode.length !== 6 || loading}
                                        className="flex-1 px-6 py-3 bg-[var(--accent)] text-[var(--primary-text)] rounded-2xl hover:bg-[var(--accent-dark)] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Joining...' : 'Join Room'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Page
