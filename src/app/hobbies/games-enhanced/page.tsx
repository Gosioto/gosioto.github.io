'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { topGames, currentGames, gamesData } from '@/data/gamesData';

export default function EnhancedHobbiesGamesPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [expandedGame, setExpandedGame] = useState<string | null>(null);
  const [showAllGames, setShowAllGames] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const topGamesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    
    // Handle click outside dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGameClick = (game: any) => {
    setSelectedGame(game);
    setExpandedGame(game.name);
  };

  const closeModal = () => {
    setSelectedGame(null);
    setExpandedGame(null);
    setActiveModal(null);
  };

  const openModal = (modalType: string) => {
    setActiveModal(modalType);
    setDropdownVisible(false);
  };

  // Horizontal scroll for top games
  const scrollTopGames = (direction: 'left' | 'right') => {
    if (topGamesRef.current) {
      const scrollAmount = 300;
      topGamesRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const displayedGames = showAllGames ? gamesData : gamesData.slice(0, 12);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-emerald-900/20"></div>
        <div className="absolute inset-0 bg-[url('/img/games-banner.png')] bg-cover bg-center opacity-20"></div>
        
        {/* Animated Particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center px-4">
          <motion.h1 
            className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-emerald-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Игровая Вселенная
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            От ретро-классики до современных AAA-проектов. Более 10,000 часов в виртуальных мирах.
          </motion.p>
          <motion.div 
            className="flex justify-center gap-8 md:gap-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-blue-400">10,000+</div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">Часов в играх</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-purple-400">100+</div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">Игр в коллекции</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-emerald-400">73%</div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">Достижений Steam</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Top-5 Games Horizontal Gallery */}
      <section className="py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Топ-5 Игр
            </h2>
            <p className="text-xl text-gray-400">Игры, которые оставили наибольшее впечатление</p>
          </motion.div>

          <div className="relative">
            {/* Scroll Buttons */}
            <button 
              onClick={() => scrollTopGames('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/80 backdrop-blur-sm border border-gray-700 rounded-full flex items-center justify-center text-white hover:bg-gray-800 transition-all duration-300 group"
            >
              <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              onClick={() => scrollTopGames('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/80 backdrop-blur-sm border border-gray-700 rounded-full flex items-center justify-center text-white hover:bg-gray-800 transition-all duration-300 group"
            >
              <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Horizontal Scroll Container */}
            <div 
              ref={topGamesRef}
              className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 px-12"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {topGames.map((game, index) => (
                <motion.div
                  key={game.name}
                  className="flex-shrink-0 w-80 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden border border-gray-700 hover:border-yellow-500 transition-all duration-300 group cursor-pointer"
                  whileHover={{ scale: 1.05, y: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  initial={{ opacity: 0, x: 50 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  onClick={() => handleGameClick(game)}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={game.image} 
                      alt={game.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    <div className="absolute top-4 right-4">
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                        Топ-{game.rank}
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-yellow-400 transition-colors">
                      {game.name}
                    </h3>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-blue-400 font-semibold">{game.hours} часов</span>
                      <span className="text-sm text-gray-400">{game.lastLaunch}</span>
                    </div>
                    <div className="text-sm text-gray-400 mb-4">
                      Достижения: {game.achievements}
                    </div>
                    <motion.button
                      className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold py-2 rounded-lg hover:shadow-lg hover:shadow-yellow-500/25 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Подробнее
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Currently Playing Section */}
      <section className="py-20 px-4 md:px-8 bg-gradient-to-b from-transparent via-gray-900/50 to-transparent">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Сейчас Играю
            </h2>
            <p className="text-xl text-gray-400">Активные проекты и текущие достижения</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {currentGames.map((game, index) => (
              <motion.div
                key={game.name}
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl overflow-hidden border border-gray-700 hover:border-green-500 transition-all duration-500 group"
                whileHover={{ scale: 1.02, y: -5 }}
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 50 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                onClick={() => handleGameClick(game)}
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={game.image} 
                    alt={game.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                  <div className="absolute top-6 left-6">
                    <div className="bg-green-500 text-black px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                      Активная игра
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-green-400 transition-colors">
                    {game.name}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-400 font-semibold">{game.hours} часов</span>
                      <span className="text-sm text-gray-400">{game.lastLaunch}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Прогресс</span>
                        <span className="text-green-400 font-semibold">{game.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${game.progress}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">
                      Достижения: {game.achievements}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* All Games Grid */}
      <section className="py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Вся Коллекция
            </h2>
            <p className="text-xl text-gray-400">Полная библиотека игр с детальной статистикой</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedGames.map((game, index) => (
              <motion.div
                key={game.name}
                className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all duration-300 cursor-pointer group ${
                  expandedGame === game.name ? 'ring-2 ring-purple-500 scale-105' : ''
                }`}
                whileHover={{ scale: 1.05, y: -5 }}
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 50 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                onClick={() => handleGameClick(game)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={game.image} 
                    alt={game.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-2 group-hover:text-purple-400 transition-colors line-clamp-2">
                    {game.name}
                  </h3>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-blue-400 font-semibold">{game.hours} часов</span>
                    <span className="text-xs text-gray-400">{game.lastLaunch}</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    Достижения: {game.achievements}
                  </div>
                  
                  {/* Expandable Content */}
                  <AnimatePresence>
                    {expandedGame === game.name && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-gray-700"
                      >
                        <div className="space-y-3">
                          <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-2 rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300">
                            Подробнее
                          </button>
                          <div className="flex gap-2">
                            <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors">
                              Скриншоты
                            </button>
                            <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors">
                              Достижения
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}

            {/* Show More Button */}
            {!showAllGames && gamesData.length > 12 && (
              <motion.div
                className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl overflow-hidden border border-purple-500 cursor-pointer"
                whileHover={{ scale: 1.05, y: -5 }}
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 50 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                onClick={() => setShowAllGames(true)}
              >
                <div className="h-full flex items-center justify-center p-8 text-center">
                  <div>
                    <div className="text-6xl mb-4">+</div>
                    <h3 className="text-xl font-bold mb-2">Показать все игры</h3>
                    <p className="text-purple-200">+{gamesData.length - 12} игр</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Enhanced Dropdown Menu */}
      <div className="fixed bottom-8 right-8 z-50" ref={dropdownRef}>
        {/* Arrow Hint */}
        <motion.div
          className="mb-4 text-center"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="text-2xl mb-2">⬆️</div>
          <div className="text-sm text-gray-400 whitespace-nowrap">Наведи для меню</div>
        </motion.div>

        {/* Dropdown Container */}
        <div 
          className="relative"
          onMouseEnter={() => setDropdownVisible(true)}
          onMouseLeave={() => setDropdownVisible(false)}
        >
          {/* Main Button */}
          <motion.button
            className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </motion.button>

          {/* Dropdown Content */}
          <AnimatePresence>
            {dropdownVisible && (
              <motion.div
                className="absolute bottom-20 right-0 flex flex-col gap-3"
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                {/* Info Button */}
                <motion.button
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 rounded-full text-white font-semibold shadow-lg hover:shadow-blue-500/25 transition-all duration-300 flex items-center gap-3 min-w-[200px]"
                  whileHover={{ scale: 1.05, x: -10 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openModal('info')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Подробнее</span>
                </motion.button>

                {/* Screenshots Button */}
                <motion.button
                  className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 rounded-full text-white font-semibold shadow-lg hover:shadow-purple-500/25 transition-all duration-300 flex items-center gap-3 min-w-[200px]"
                  whileHover={{ scale: 1.05, x: -10 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openModal('screenshots')}
                  style={{ transitionDelay: '0.1s' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Скриншоты</span>
                </motion.button>

                {/* Achievements Button */}
                <motion.button
                  className="bg-gradient-to-r from-yellow-600 to-orange-600 px-6 py-3 rounded-full text-white font-semibold shadow-lg hover:shadow-yellow-500/25 transition-all duration-300 flex items-center gap-3 min-w-[200px]"
                  whileHover={{ scale: 1.05, x: -10 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openModal('achievements')}
                  style={{ transitionDelay: '0.2s' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Достижения</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {selectedGame && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="bg-gradient-to-br from-gray-900 to-black rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-700"
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-64">
                <img 
                  src={selectedGame.image} 
                  alt={selectedGame.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                <button
                  className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                  onClick={closeModal}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-8">
                <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  {selectedGame.name}
                </h2>
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-800 rounded-xl p-4">
                    <div className="text-blue-400 text-sm font-semibold mb-1">Часы в игре</div>
                    <div className="text-2xl font-bold">{selectedGame.hours}</div>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-4">
                    <div className="text-purple-400 text-sm font-semibold mb-1">Последний запуск</div>
                    <div className="text-2xl font-bold">{selectedGame.lastLaunch}</div>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-xl p-4 mb-8">
                  <div className="text-green-400 text-sm font-semibold mb-1">Достижения</div>
                  <div className="text-xl font-bold">{selectedGame.achievements}</div>
                </div>
                <div className="flex gap-4">
                  <button className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
                    Скриншоты
                  </button>
                  <button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300">
                    Достижения
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Info Modal */}
        {activeModal === 'info' && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              className="bg-gradient-to-br from-blue-900 to-cyan-900 rounded-3xl max-w-lg w-full p-8 border border-blue-500"
              initial={{ scale: 0.9, rotate: -5 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.9, rotate: -5 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">О коллекции</h3>
                <p className="text-blue-200 mb-6">
                  Это моя личная коллекция игр, собранная за многие годы. Здесь представлены как классические проекты, так и современные хиты различных жанров.
                </p>
                <button
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-3 px-8 rounded-full hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                  onClick={() => setActiveModal(null)}
                >
                  Закрыть
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Screenshots Modal */}
        {activeModal === 'screenshots' && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-3xl max-w-4xl w-full p-8 border border-purple-500"
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">Скриншоты игр</h3>
                <p className="text-purple-200 mb-8">Лучшие моменты из моих игровых сессий</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {['/img/screenshot/screenshot1.jpg', '/img/screenshot/screenshot2.jpg', '/img/screenshot/screenshot3.jpg'].map((screenshot, index) => (
                    <motion.div
                      key={index}
                      className="bg-black/50 rounded-xl overflow-hidden border border-purple-400/30"
                      whileHover={{ scale: 1.05 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      initial={{ opacity: 0, y: 30 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <img 
                        src={screenshot} 
                        alt={`Скриншот ${index + 1}`}
                        className="w-full h-48 object-cover"
                      />
                    </motion.div>
                  ))}
                </div>
                
                <button
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-8 rounded-full hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                  onClick={() => setActiveModal(null)}
                >
                  Закрыть
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Achievements Modal */}
        {activeModal === 'achievements' && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              className="bg-gradient-to-br from-yellow-900 to-orange-900 rounded-3xl max-w-2xl w-full p-8 border border-yellow-500 max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, rotate: 5 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.9, rotate: 5 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">Достижения</h3>
                <p className="text-yellow-200 mb-8">Мои игровые достижения и награды</p>
                
                <div className="space-y-4 mb-8">
                  {[
                    { name: 'Мастер Witcher 3', description: 'Завершите все основные квесты', rarity: 'legendary', unlocked: true },
                    { name: 'Выживший GTFO', description: 'Пройдите все уровни сложности', rarity: 'epic', unlocked: true },
                    { name: 'Стратег Dawn of War', description: 'Победите в 100 сражениях', rarity: 'rare', unlocked: true },
                    { name: 'Космический пилот', description: 'Исследуйте 50 систем', rarity: 'rare', unlocked: false },
                    { name: 'Торговец', description: 'Заработайте 1,000,000 кредитов', rarity: 'common', unlocked: false }
                  ].map((achievement, index) => (
                    <motion.div
                      key={index}
                      className={`bg-black/50 rounded-xl p-4 border-l-4 ${
                        achievement.unlocked 
                          ? achievement.rarity === 'legendary' ? 'border-yellow-400' :
                            achievement.rarity === 'epic' ? 'border-purple-400' :
                            achievement.rarity === 'rare' ? 'border-blue-400' : 'border-gray-400'
                          : 'border-gray-600'
                      }`}
                      whileHover={{ scale: 1.02, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      initial={{ opacity: 0, x: -30 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <h4 className="font-semibold text-white">{achievement.name}</h4>
                          <p className="text-sm text-gray-400">{achievement.description}</p>
                        </div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          achievement.unlocked 
                            ? achievement.rarity === 'legendary' ? 'bg-yellow-400' :
                              achievement.rarity === 'epic' ? 'bg-purple-400' :
                              achievement.rarity === 'rare' ? 'bg-blue-400' : 'bg-gray-400'
                            : 'bg-gray-600'
                        }`}>
                          {achievement.unlocked ? (
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <button
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold py-3 px-8 rounded-full hover:shadow-lg hover:shadow-yellow-500/25 transition-all duration-300"
                  onClick={() => setActiveModal(null)}
                >
                  Закрыть
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}