import React, { useState, useEffect } from 'react';
import { Play, Timer, RefreshCw, Trophy, Users, Clock, Settings, ChevronLeft, Crown, Plus, Minus, Edit, Check, X, History, ChevronDown, ChevronUp } from 'lucide-react';
import { useGameRoom } from './hooks/useGameRoom';
import { WaitingRoom } from './components/WaitingRoom';
import { ScoreBoard } from './components/ScoreBoard';
import type { GameRoom, Category, GameSettings, RoundHistory } from './types';

type Round = {
  letter: string;
  answers: Record<string, string>;
  score: number;
};

type GameHistory = {
  id: string;
  date: string;
  rounds: Round[];
  totalScore: number;
  settings: GameSettings;
};

const DEFAULT_CATEGORIES: Category[] = [
  { name: 'pays', label: 'Pays' },
  { name: 'ville', label: 'Ville' },
  { name: 'animal', label: 'Animal' },
  { name: 'metier', label: 'Métier' },
  { name: 'fruit', label: 'Fruit/Légume' },
  { name: 'celebrite', label: 'Célébrité' },
  { name: 'marque', label: 'Marque' },
  { name: 'objet', label: 'Objet' },
  { name: 'sport', label: 'Sport' },
];

const STORAGE_KEY = 'petit-bac-history';

function App() {
  const [gameState, setGameState] = useState<'menu' | 'settings' | 'playing' | 'waiting' | 'history' | 'results'>('menu');
  const [settings, setSettings] = useState<GameSettings>({
    timeLimit: 60,
    maxPlayers: 4,
    rounds: 3,
    categories: DEFAULT_CATEGORIES.slice(0, 6),
    customCategories: [],
  });
  const [currentRound, setCurrentRound] = useState(1);
  const [letter, setLetter] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(settings.timeLimit);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState(0);
  const [gameHistory, setGameHistory] = useState<GameHistory[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [currentGame, setCurrentGame] = useState<Round[]>([]);
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [newCategory, setNewCategory] = useState({ name: '', label: '' });
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [useCustomCategories, setUseCustomCategories] = useState(false);
  const [expandedGameId, setExpandedGameId] = useState<string | null>(null);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  
  const { room, error, createRoom, joinRoom, leaveRoom, findRoomByCode, setPlayerReady, updateGameState, deleteRoom } = useGameRoom(roomCode);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameHistory));
  }, [gameHistory]);

  useEffect(() => {
    if (room && room.status === 'playing' && gameState === 'waiting') {
      setCurrentGame([]);
      setCurrentRound(room.currentRound || 1);
      setLetter(room.currentLetter || '');
      setGameState('playing');
      setTimeLeft(settings.timeLimit);
      setAnswers({});
      settings.categories.forEach(cat => {
        setAnswers(prev => ({ ...prev, [cat.name]: '' }));
      });
    }
  }, [room, room?.status, gameState, settings]);

  useEffect(() => {
    if (room) {
      const shouldDelete = 
        room.players.length === 0 || 
        (room.status === 'finished' && room.players.every(p => !p.isHost));
      
      if (shouldDelete) {
        deleteRoom(room.code);
      }
    }
  }, [room]);

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      alert('Veuillez entrer votre pseudo');
      return;
    }

    setIsCreatingRoom(true);
    try {
      const code = await createRoom(playerName, settings);
      if (code) {
        setRoomCode(code);
        setGameState('waiting');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim() || !roomCode.trim()) {
      alert('Veuillez entrer votre pseudo et le code du salon');
      return;
    }

    try {
      const foundRoom = await findRoomByCode(roomCode);
      if (foundRoom.players.length >= foundRoom.settings.maxPlayers) {
        alert('Le salon est complet');
        return;
      }
      await joinRoom(playerName);
      setGameState('waiting');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLeaveRoom = async () => {
    try {
      await leaveRoom(playerName);
      setRoomCode('');
      setGameState('menu');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReady = async () => {
    try {
      await setPlayerReady(playerName, true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleInputChange = (category: string, value: string) => {
    setAnswers(prev => ({ ...prev, [category]: value }));
  };

  const generateLetter = () => {
    if (!room?.seed) return 'A';
    
    const letters = 'ABCDEFGHIJLMNOPRSTV';
    const usedLetters = currentGame.map(round => round.letter);
    
    const hash = Array.from(room.seed + currentRound).reduce(
      (acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0
    );
    
    let attempts = 0;
    let newLetter;
    
    do {
      const index = Math.abs((hash + attempts) % letters.length);
      newLetter = letters[index];
      attempts++;
    } while (usedLetters.includes(newLetter) && attempts < letters.length);
    
    return newLetter;
  };

  const startGame = async () => {
    if (!room) return;
    
    const seed = Math.random().toString(36).substring(2);
    const newLetter = generateLetter();
    
    const updatedPlayers = room.players.map(p => ({
      ...p,
      hasValidatedRound: false,
      score: 0,
      validWords: 0
    }));
    
    await updateGameState({
      status: 'playing',
      currentRound: 1,
      currentLetter: newLetter,
      timeLeft: settings.timeLimit,
      answers: {},
      seed,
      roundHistory: [],
      players: updatedPlayers
    });
  };

  const calculateScore = (answers: Record<string, string>, letter: string) => {
    let roundScore = 0;
    let validWords = 0;
    
    Object.values(answers).forEach(answer => {
      if (answer.trim().toLowerCase().startsWith(letter.toLowerCase())) {
        roundScore += 10;
        validWords++;
      }
    });
    
    return { score: roundScore, validWords };
  };

  const validateRound = async () => {
    if (!room) return;

    const updatedPlayers = room.players.map(p => 
      p.name === playerName ? { ...p, hasValidatedRound: true } : p
    );

    await updateGameState({
      players: updatedPlayers
    });
  };

  const endRound = async () => {
    if (!room) return;

    const { score: roundScore, validWords } = calculateScore(answers, letter);
    const round: Round = {
      letter,
      answers: { ...answers },
      score: roundScore
    };
    
    const newCurrentGame = [...currentGame, round];
    setCurrentGame(newCurrentGame);
    
    const roundHistory: RoundHistory = {
      letter,
      playerAnswers: {
        [playerName]: {
          answers: { ...answers },
          validWords,
          score: roundScore
        }
      }
    };
    
    const updatedHistory = [...(room.roundHistory || []), roundHistory];
    
    const updatedPlayers = room.players.map(p => {
      if (p.name === playerName) {
        const currentScore = p.score || 0;
        const currentValidWords = p.validWords || 0;
        return {
          ...p,
          score: currentScore + roundScore,
          validWords: currentValidWords + validWords,
          hasValidatedRound: false
        };
      }
      return {
        ...p,
        hasValidatedRound: false
      };
    });
    
    if (currentRound < settings.rounds) {
      const newLetter = generateLetter();
      const nextRound = currentRound + 1;
      
      await updateGameState({
        currentRound: nextRound,
        currentLetter: newLetter,
        timeLeft: settings.timeLimit,
        answers: {},
        players: updatedPlayers,
        roundHistory: updatedHistory
      });
      
      setCurrentRound(nextRound);
      setLetter(newLetter);
      setTimeLeft(settings.timeLimit);
      setAnswers({});
      settings.categories.forEach(cat => {
        setAnswers(prev => ({ ...prev, [cat.name]: '' }));
      });
    } else {
      const totalScore = [...newCurrentGame].reduce((sum, r) => sum + r.score, 0);
      const gameRecord: GameHistory = {
        id: Date.now().toString(),
        date: new Date().toLocaleString(),
        rounds: newCurrentGame,
        totalScore,
        settings: { ...settings }
      };
      
      setGameHistory(prev => [gameRecord, ...prev]);
      
      await updateGameState({
        status: 'finished',
        currentRound: currentRound,
        currentLetter: letter,
        timeLeft: 0,
        answers: {},
        players: updatedPlayers,
        roundHistory: updatedHistory
      });
      
      setGameState('results');
    }
  };

  const handleSettingChange = (setting: keyof GameSettings, value: number) => {
    const limits = {
      timeLimit: { min: 10, max: 300 },
      maxPlayers: { min: 1, max: 27 },
      rounds: { min: 1, max: 10 }
    };

    const { min, max } = limits[setting as keyof typeof limits];
    const newValue = Math.max(min, Math.min(max, value));
    setSettings(prev => ({ ...prev, [setting]: newValue }));
  };

  const addCustomCategory = () => {
    if (!newCategory.name || !newCategory.label) {
      alert('Veuillez remplir tous les champs');
      return;
    }
    setSettings(prev => ({
      ...prev,
      customCategories: [...prev.customCategories, newCategory],
      categories: [...prev.categories, newCategory]
    }));
    setNewCategory({ name: '', label: '' });
    setIsAddingCategory(false);
  };

  const removeCustomCategory = (categoryName: string) => {
    setSettings(prev => ({
      ...prev,
      customCategories: prev.customCategories.filter(c => c.name !== categoryName),
      categories: prev.categories.filter(c => c.name !== categoryName)
    }));
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      validateRound();
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  useEffect(() => {
    if (room && gameState === 'playing') {
      const allPlayersValidated = room.players.every(p => p.hasValidatedRound);
      if (allPlayersValidated) {
        endRound();
      }
    }
  }, [room?.players]);

  const renderMenu = () => (
    <div className="flex flex-col items-center justify-center h-screen space-y-8 bg-gradient-to-br from-indigo-900 to-purple-900 text-white p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">Le Petit Bac</h1>
        <p className="text-xl text-indigo-200">Le jeu classique en version moderne</p>
      </div>

      <div className="w-full max-w-md space-y-4">
        <input
          type="text"
          placeholder="Votre pseudo"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          maxLength={20}
        />

        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Code de la salle"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            maxLength={6}
          />
          <button 
            onClick={handleJoinRoom}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-2 transition-colors duration-200"
          >
            <Users className="w-5 h-5" />
            Rejoindre
          </button>
        </div>

        <button
          onClick={() => setGameState('settings')}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 rounded-lg text-xl font-semibold flex items-center justify-center space-x-3 transition-colors duration-200"
        >
          <Play className="w-6 h-6" />
          <span>Nouvelle Partie</span>
        </button>

        <button
          onClick={() => setGameState('history')}
          className="w-full bg-white/10 hover:bg-white/20 px-8 py-4 rounded-lg text-lg font-semibold flex items-center justify-center space-x-3 transition-colors duration-200"
        >
          <History className="w-6 h-6" />
          <span>Historique</span>
        </button>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 text-white p-8">
      <button
        onClick={() => setGameState('menu')}
        className="mb-8 flex items-center text-lg hover:text-indigo-300"
      >
        <ChevronLeft className="w-5 h-5 mr-2" />
        Retour au menu
      </button>

      <div className="max-w-2xl mx-auto space-y-8">
        <h2 className="text-3xl font-bold mb-8 flex items-center">
          <Settings className="w-8 h-8 mr-3" />
          Paramètres de la partie
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 p-6 rounded-xl space-y-4">
            <label className="block text-lg font-medium h-14 flex items-center">
              Temps par manche
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleSettingChange('timeLimit', settings.timeLimit - 10)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20"
              >
                <Minus className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={settings.timeLimit}
                onChange={(e) => handleSettingChange('timeLimit', parseInt(e.target.value) || 60)}
                className="w-24 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-center"
              />
              <button
                onClick={() => handleSettingChange('timeLimit', settings.timeLimit + 10)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <span className="text-sm text-white/70">secondes</span>
          </div>

          <div className="bg-white/10 p-6 rounded-xl space-y-4">
            <label className="block text-lg font-medium h-14 flex items-center">
              Nombre de joueurs
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleSettingChange('maxPlayers', settings.maxPlayers - 1)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20"
              >
                <Minus className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={settings.maxPlayers}
                onChange={(e) => handleSettingChange('maxPlayers', parseInt(e.target.value) || 1)}
                className="w-24 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-center"
              />
              <button
                onClick={() => handleSettingChange('maxPlayers', settings.maxPlayers + 1)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <span className="text-sm text-white/70">joueurs</span>
          </div>

          <div className="bg-white/10 p-6 rounded-xl space-y-4">
            <label className="block text-lg font-medium h-14 flex items-center">
              Nombre de manches
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleSettingChange('rounds', settings.rounds - 1)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20"
              >
                <Minus className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={settings.rounds}
                onChange={(e) => handleSettingChange('rounds', parseInt(e.target.value) || 1)}
                className="w-24 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-center"
              />
              <button
                onClick={() => handleSettingChange('rounds', settings.rounds + 1)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <span className="text-sm text-white/70">manches</span>
          </div>
        </div>

        <div className="bg-white/10 p-6 rounded-xl space-y-4">
          <label className="block text-lg font-medium">Catégories</label>
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setUseCustomCategories(false)}
              className={`flex-1 py-3 px-4 rounded-lg transition-colors duration-200 ${!useCustomCategories ? 'bg-indigo-600' : 'bg-white/10 hover:bg-white/20'}`}
            >
              Catégories par défaut
            </button>
            <button
              onClick={() => setUseCustomCategories(true)}
              className={`flex-1 py-3 px-4 rounded-lg transition-colors duration-200 ${useCustomCategories ? 'bg-indigo-600' : 'bg-white/10 hover:bg-white/20'}`}
            >
              Catégories personnalisées
            </button>
          </div>

          {useCustomCategories ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {settings.customCategories.map(category => (
                  <div
                    key={category.name}
                    className="flex justify-between items-center bg-white/10 p-3 rounded-lg"
                  >
                    <span>{category.label}</span>
                    <button
                      onClick={() => removeCustomCategory(category.name)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {isAddingCategory ? (
                <div className="bg-white/10 p-4 rounded-lg space-y-3">
                  <input
                    type="text"
                    placeholder="Nom unique (ex: fruit)"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/20"
                    maxLength={20}
                  />
                  <input
                    type="text"
                    placeholder="Libellé affiché (ex: Fruit/Légume)"
                    value={newCategory.label}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, label: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/20"
                    maxLength={30}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={addCustomCategory}
                      className="flex-1 py-2 rounded-lg bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2 transition-colors duration-200"
                    >
                      <Check className="w-4 h-4" />
                      Ajouter
                    </button>
                    <button
                      onClick={() => setIsAddingCategory(false)}
                      className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2 transition-colors duration-200"
                    >
                      <X className="w-4 h-4" />
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingCategory(true)}
                  className="w-full py-3 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center gap-2 transition-colors duration-200"
                >
                  <Plus className="w-5 h-5" />
                  Ajouter une catégorie
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {DEFAULT_CATEGORIES.map(category => (
                <button
                  key={category.name}
                  onClick={() => {
                    const isSelected = settings.categories.some(c => c.name === category.name);
                    setSettings(prev => ({
                      ...prev,
                      categories: isSelected
                        ? prev.categories.filter(c => c.name !== category.name)
                        : [...prev.categories, category],
                    }));
                  }}
                  className={`py-3 px-4 rounded-lg text-left transition-colors duration-200 ${
                    settings.categories.some(c => c.name === category.name)
                      ? 'bg-indigo-600'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleCreateRoom}
          disabled={isCreatingRoom}
          className={`w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 rounded-lg text-xl font-semibold flex items-center justify-center space-x-3 transition-all duration-200 ${
            isCreatingRoom ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          {isCreatingRoom ? (
            <>
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span>Création en cours...</span>
            </>
          ) : (
            <>
              <Play className="w-6 h-6" />
              <span>Créer la partie</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderGame = () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-6">
            <div className="text-8xl font-bold bg-white/10 px-10 py-6 rounded-2xl">
              {letter}
            </div>
            <div className="space-y-3">
              <div className="text-4xl font-bold flex items-center">
                <Timer className="w-8 h-8 mr-3 text-red-400" />
                <span className={timeLeft <= 10 ? 'text-red-400' : ''}>
                  {timeLeft}s
                </span>
              </div>
              <div className="text-xl text-white/70">
                Manche {currentRound}/{settings.rounds}
              </div>
            </div>
          </div>
          {!room?.players.find(p => p.name === playerName)?.hasValidatedRound && (
            <button
              onClick={validateRound}
              className="bg-green-500 hover:bg-green-600 px-8 py-4 rounded-lg flex items-center space-x-3 text-lg transition-colors duration-200"
            >
              <Check className="w-6 h-6" />
              <span>Valider mes réponses</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
          {settings.categories.map(category => (
            <div key={category.name} className="bg-white/10 rounded-xl p-8 space-y-4 min-h-[200px]">
              <label className="block text-2xl font-medium">
                {category.label}
              </label>
              <input
                type="text"
                value={answers[category.name] || ''}
                onChange={(e) => handleInputChange(category.name, e.target.value)}
                className="w-full px-6 py-4 bg-white/5 border-2 border-white/20 rounded-lg text-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                placeholder={`Un ${category.label.toLowerCase()} avec ${letter}...`}
                maxLength={50}
                disabled={room?.players.find(p => p.name === playerName)?.hasValidatedRound}
              />
            </div>
          ))}
        </div>

        {room && (
          <div className="mt-8 bg-white/10 rounded-xl p-6">
            <h3 className="text-xl font-medium mb-4">État des joueurs</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {room.players.map(player => (
                <div
                  key={player.id}
                  className={`p-4 rounded-lg ${
                    player.hasValidatedRound ? 'bg-green-500/20' : 'bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {player.isHost && <Crown className="w-4 h-4 text-yellow-400" />}
                    <span>{player.name}</span>
                  </div>
                  <div className="text-sm mt-1">
                    {player.hasValidatedRound ? 'A validé' : 'En cours...'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderResults = () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {room && (
          <ScoreBoard
            players={room.players}
            roundHistory={room.roundHistory || []}
          />
        )}

        <div className="flex gap-4">
          <button
            onClick={() => setGameState('menu')}
            className="flex-1 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200"
          >
            <ChevronLeft className="w-5 h-5" />
            Menu principal
          </button>
          <button
            onClick={() => {
              if (room) {
                setGameState('waiting');
                const updatedPlayers = room.players.map(p => ({
                  ...p,
                  isReady: false,
                  hasValidatedRound: false,
                  score: 0,
                  validWords: 0
                }));
                updateGameState({
                  status: 'waiting',
                  players: updatedPlayers
                });
              }
            }}
            className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200"
          >
            <RefreshCw className="w-5 h-5" />
            Nouvelle partie
          </button>
        </div>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 text-white p-8">
      <button
        onClick={() => setGameState('menu')}
        className="mb-8 flex items-center text-lg hover:text-indigo-300"
      >
        <ChevronLeft className="w-5 h-5 mr-2" />
        Retour au menu
      </button>

      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 flex items-center justify-center">
          <History className="w-8 h-8 mr-3" />
          Historique des parties
        </h2>

        <div className="space-y-4">
          {gameHistory.map((game) => (
            <div key={game.id} className="bg-white/10 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedGameId(expandedGameId === game.id ? null : game.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors duration-200"
              >
                <div className="flex items-center gap-4">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  <div className="text-left">
                    <div className="font-medium">{game.totalScore} points</div>
                    <div className="text-sm text-white/70">{game.date}</div>
                  </div>
                </div>
                {expandedGameId === game.id ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>

              {expandedGameId === game.id && (
                <div className="px-6 pb-4 space-y-4">
                  {game.rounds.map((round, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-4">
                          <div className="text-2xl font-bold">Lettre {round.letter}</div>
                          <div className="text-yellow-400">{round.score} points</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(round.answers).map(([category, answer]) => {
                          const categoryLabel = game.settings.categories.find(c => c.name === category)?.label;
                          const isValid = answer.toLowerCase().startsWith(round.letter.toLowerCase());
                          return (
                            <div key={category} className="space-y-1">
                              <div className="text-sm text-white/70">{categoryLabel}</div>
                              <div className={`font-medium ${isValid ? 'text-green-400' : 'text-red-400'}`}>
                                {answer || '-'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {gameState === 'menu' && renderMenu()}
      {gameState === 'settings' && renderSettings()}
      {gameState === 'waiting' && room && (
        <WaitingRoom
          room={room}
          playerName={playerName}
          onStart={startGame}
          onLeave={handleLeaveRoom}
          onReady={handleReady}
        />
      )}
      {gameState === 'playing' && renderGame()}
      {gameState === 'history' && renderHistory()}
      {gameState === 'results' && renderResults()}
    </>
  );
}

export default App;