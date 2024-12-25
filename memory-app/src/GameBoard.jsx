import React, { useState, useEffect } from 'react';
import Card from './Card';

const GameBoard = () => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);

  // Sample card data - you can replace images with your own
  const cardImages = [
    '/path/to/image1.jpg',
    '/path/to/image2.jpg',
    '/path/to/image3.jpg',
    '/path/to/image4.jpg',
    '/path/to/image5.jpg',
    '/path/to/image6.jpg',
  ];

  // Initialize game
  useEffect(() => {
    initializeCards();
  }, []);

  const initializeCards = () => {
    // Create pairs of cards and shuffle them
    const cardPairs = [...cardImages, ...cardImages]
      .map((image, index) => ({
        id: index,
        imageUrl: image,
        isMatched: false
      }))
      .sort(() => Math.random() - 0.5);

    setCards(cardPairs);
  };

  const handleCardClick = (clickedCard) => {
    // Prevent clicking same card or when two cards are already flipped
    if (
      flippedCards.length === 2 ||
      flippedCards.includes(clickedCard.id) ||
      matchedPairs.includes(clickedCard.id)
    ) {
      return;
    }

    const newFlippedCards = [...flippedCards, clickedCard.id];
    setFlippedCards(newFlippedCards);

    // Check for match when two cards are flipped
    if (newFlippedCards.length === 2) {
      const [firstCard, secondCard] = newFlippedCards.map(id => 
        cards.find(card => card.id === id)
      );

      if (firstCard.imageUrl === secondCard.imageUrl) {
        // Match found
        setMatchedPairs([...matchedPairs, firstCard.id, secondCard.id]);
        setFlippedCards([]);
      } else {
        // No match - flip cards back after delay
        setTimeout(() => {
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="game-board">
      {cards.map(card => (
        <Card
          key={card.id}
          id={card.id}
          imageUrl={card.imageUrl}
          isFlipped={flippedCards.includes(card.id) || matchedPairs.includes(card.id)}
          onClick={() => handleCardClick(card)}
        />
      ))}
    </div>
  );
};

export default GameBoard; 